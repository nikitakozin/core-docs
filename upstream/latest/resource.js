/**
 * resource / AsyncResource / ResourceManager
 *
 * Управляет жизненным циклом асинхронных данных поверх StateManager. HTTP-клиент
 * по-прежнему отвечает за транспорт, а resource — за loading/ready/error,
 * дедупликацию запросов, отмену, защиту от устаревших ответов и публикацию данных.
 *
 * Быстрый старт
 * -------------
 * import resource from 'resource';
 *
 * const cart = resource('store.cart', () => fetchCart(cartUrl), {
 *   dedupe: true,
 *   latest: true,
 * });
 *
 * await cart.load();
 * await cart.mutate(() => updateCartLine(updateUrl, { quantity: 2 }));
 *
 * В StateManager под ключом store.cart автоматически хранится:
 * {
 *   status: 'loading' | 'ready' | 'error' | 'idle',
 *   data: previousData,
 *   error: null | Error,
 * }
 *
 * Повторная загрузка сохраняет предыдущие данные. UI может продолжать показывать
 * корзину или каталог, добавив поверх них индикатор обновления.
 *
 * StateManager
 * ------------
 * resource использует options.state либо уже созданный window.StateManager.
 * Это соответствует остальным библиотекам проекта: сначала создаётся общий
 * StateManager, затем ресурсы. Явная передача удобна в независимых модулях:
 *
 * const cart = resource('store.cart', loadCart, { state });
 *
 * load
 * ----
 * load(...args) вызывает loader(...args, context), где последний аргумент:
 * {
 *   signal,       // AbortSignal операции
 *   data,         // данные до начала операции
 *   resource,     // текущий AsyncResource
 *   operation,    // 'load'
 *   revision,
 * }
 *
 * При dedupe: true повторный load во время актуальной загрузки возвращает тот же
 * Promise. При latest: true только самая новая операция может изменить state.
 * Поэтому старый ответ загрузки не перезапишет результат более новой мутации.
 *
 * mutate
 * ------
 * mutate(task) запускает изменение данных. task получает (currentData, context)
 * и должен вернуть новые данные либо Promise с ними:
 *
 * await cart.mutate((cart, { signal }) => updateCartLine(url, body, { signal }));
 *
 * Начало mutate немедленно делает выполняющийся load устаревшим. Если включён
 * abortPrevious, предыдущая операция также физически отменяется.
 *
 * Настройки
 * ---------
 * - state: экземпляр с методами get/set/subscribe;
 * - dedupe: переиспользовать актуальный Promise load (по умолчанию true);
 * - latest: применять результат только последней операции (true);
 * - abortPrevious: отменять предыдущие операции при старте новой (false);
 * - loadingDelay: задержка публикации loading в мс (0);
 * - keepPreviousData: сохранять data во время loading/error (true);
 * - initialData: начальные данные;
 * - onSuccess(data, context): хук успешно применённого результата;
 * - onError(error, context): хук актуальной ошибки;
 * - isAbortError(error): собственная проверка ошибки отмены.
 *
 * Для каталога можно использовать:
 * const catalog = resource('store.catalog', loadCatalog, {
 *   latest: true,
 *   abortPrevious: true,
 *   loadingDelay: 300,
 *   onError(error, { args: [url] }) {
 *     if (error.name !== 'AbortError') window.location.assign(url);
 *   },
 * });
 *
 * Публичный API AsyncResource
 * --------------------------
 * - load(...args): загрузить данные;
 * - mutate(task): изменить данные и опубликовать результат;
 * - set(data): синхронно установить актуальные данные;
 * - get(): получить data;
 * - getState(): получить полный snapshot;
 * - subscribe(listener, options): подписаться через StateManager;
 * - cancel(): отменить активные операции и оставить имеющиеся data;
 * - reset(data): отменить операции и вернуть ресурс в idle;
 * - destroy(): отменить операции и удалить ресурс из менеджера.
 *
 * Фабрика хранит по одному ресурсу на имя. Повторный resource('store.cart', ...)
 * возвращает существующий экземпляр. Получить его также можно через
 * new ResourceManager().get('store.cart').
 */

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const isSnapshot = value => value
	&& typeof value === 'object'
	&& ['idle', 'loading', 'ready', 'error'].includes(value.status)
	&& hasOwn(value, 'data')
	&& hasOwn(value, 'error');

export class AsyncResource {
	constructor(name, loader, options = {}, manager = null) {
		if (typeof name !== 'string' || name.trim() === '') {
			throw new TypeError('AsyncResource: name должен быть непустой строкой');
		}
		if (typeof loader !== 'function') {
			throw new TypeError(`AsyncResource «${name}»: loader должен быть функцией`);
		}
		if (!options.state || typeof options.state.set !== 'function') {
			throw new TypeError(`AsyncResource «${name}»: требуется экземпляр StateManager в options.state`);
		}

		this.name = name;
		this.loader = loader;
		this.state = options.state;
		this.manager = manager;
		this.cfg = Object.assign({
			dedupe: true,
			latest: true,
			abortPrevious: false,
			loadingDelay: 0,
			keepPreviousData: true,
			onSuccess: null,
			onError: null,
			isAbortError: error => error?.name === 'AbortError',
		}, options);

		this.revision = 0;
		this.operations = new Map();
		this.loadingOperation = null;
		this.destroyed = false;

		const stored = typeof this.state.has === 'function' && this.state.has(name)
			? this.state.get(name)
			: undefined;
		if (isSnapshot(stored)) {
			this.snapshot = stored;
		} else {
			const hasInitialData = hasOwn(options, 'initialData');
			const hasStoredData = stored !== undefined;
			this.snapshot = {
				status: hasInitialData || hasStoredData ? 'ready' : 'idle',
				data: hasInitialData ? options.initialData : stored,
				error: null,
			};
			this.state.set(this.name, this.snapshot);
		}
	}

	/**
	 * Загружает данные. Метод намеренно не async: дедуплицированные вызовы
	 * получают один и тот же объект Promise, а не только одинаковый результат.
	 */
	load(...args) {
		this._assertAlive();

		if (
			this.cfg.dedupe
			&& this.loadingOperation
			&& !this.loadingOperation.settled
			&& !this.loadingOperation.invalidated
			&& (!this.cfg.latest || this.loadingOperation.revision === this.revision)
		) {
			return this.loadingOperation.promise;
		}

		return this._execute('load', this.loader, args);
	}

	/**
	 * Выполняет изменение и публикует возвращённые task данные.
	 */
	mutate(task) {
		this._assertAlive();
		if (typeof task !== 'function') {
			throw new TypeError(`AsyncResource «${this.name}».mutate: task должен быть функцией`);
		}

		return this._execute('mutate', task, []);
	}

	get() {
		return this.snapshot.data;
	}

	getState() {
		return this.snapshot;
	}

	/**
	 * Синхронная публикация данных также инвалидирует все старые ответы.
	 */
	set(data) {
		this._assertAlive();
		this.revision += 1;
		this._invalidateOperations(this.cfg.abortPrevious);
		this._publish({ status: 'ready', data, error: null });

		return data;
	}

	subscribe(listener, options) {
		if (typeof this.state.subscribe !== 'function') {
			throw new TypeError(`AsyncResource «${this.name}»: StateManager не поддерживает subscribe`);
		}

		return this.state.subscribe(this.name, listener, options);
	}

	cancel() {
		if (this.destroyed) return false;
		const hadOperations = this.operations.size > 0;
		this.revision += 1;
		this._invalidateOperations(true);
		this._publishStable();

		return hadOperations;
	}

	reset(data) {
		this._assertAlive();
		this.revision += 1;
		this._invalidateOperations(true);
		this._publish({ status: 'idle', data, error: null });

		return this.snapshot;
	}

	destroy() {
		if (this.destroyed) return;
		this.cancel();
		this.destroyed = true;
		if (this.manager?.get(this.name) === this) {
			this.manager.resources.delete(this.name);
		}
	}

	_execute(type, executor, args) {
		const revision = ++this.revision;
		if (this.cfg.abortPrevious) this._invalidateOperations(true);

		const controller = new AbortController();
		const operation = {
			type,
			revision,
			controller,
			loadingTimer: null,
			promise: null,
			settled: false,
			invalidated: false,
		};
		const context = {
			signal: controller.signal,
			data: this.snapshot.data,
			resource: this,
			operation: type,
			revision,
			args,
		};

		this.operations.set(revision, operation);
		if (type === 'load') this.loadingOperation = operation;
		this._scheduleLoading(operation);

		operation.promise = Promise.resolve().then(() => (
			type === 'load'
				? executor(...args, context)
				: executor(context.data, context)
		)).then(data => {
			if (this._canCommit(operation)) {
				this._clearLoading(operation);
				this._publish({ status: 'ready', data, error: null });
				this._callHook('onSuccess', data, context);
			}

			return data;
		}).catch(error => {
			const aborted = controller.signal.aborted || this.cfg.isAbortError(error);
			if (this._canCommit(operation)) {
				this._clearLoading(operation);
				if (aborted) {
					this._publishStable();
				} else {
					this._publish({
						status: 'error',
						data: this.cfg.keepPreviousData ? this.snapshot.data : undefined,
						error,
					});
					this._callHook('onError', error, context);
				}
			}

			throw error;
		}).finally(() => {
			operation.settled = true;
			this._clearLoading(operation);
			this.operations.delete(revision);
			if (this.loadingOperation === operation) this.loadingOperation = null;
		});

		return operation.promise;
	}

	_scheduleLoading(operation) {
		const publish = () => {
			operation.loadingTimer = null;
			if (!this._canCommit(operation)) return;
			this._publish({
				status: 'loading',
				data: this.cfg.keepPreviousData ? this.snapshot.data : undefined,
				error: null,
			});
		};

		const delay = Math.max(0, Number(this.cfg.loadingDelay) || 0);
		if (delay === 0) {
			publish();
		} else {
			operation.loadingTimer = setTimeout(publish, delay);
		}
	}

	_canCommit(operation) {
		return !this.destroyed
			&& !operation.invalidated
			&& !operation.controller.signal.aborted
			&& (!this.cfg.latest || operation.revision === this.revision);
	}

	_clearLoading(operation) {
		if (operation.loadingTimer !== null) {
			clearTimeout(operation.loadingTimer);
			operation.loadingTimer = null;
		}
	}

	_invalidateOperations(abort) {
		for (const operation of this.operations.values()) {
			this._clearLoading(operation);
			operation.invalidated = true;
			if (abort) operation.controller.abort();
		}
	}

	_publishStable() {
		this._publish({
			status: this.snapshot.data === undefined ? 'idle' : 'ready',
			data: this.snapshot.data,
			error: null,
		});
	}

	_publish(snapshot) {
		this.snapshot = snapshot;
		this.state.set(this.name, snapshot);
	}

	_callHook(name, value, context) {
		if (typeof this.cfg[name] !== 'function') return;

		try {
			this.cfg[name](value, context);
		} catch (error) {
			console.error(`Ошибка ${name} ресурса «${this.name}»:`, error);
		}
	}

	_assertAlive() {
		if (this.destroyed) {
			throw new Error(`AsyncResource «${this.name}» уже уничтожен`);
		}
	}
}

export class ResourceManager {
	constructor(options = {}) {
		if (ResourceManager._instance) {
			if (!ResourceManager._instance.state && options.state) {
				ResourceManager._instance.state = options.state;
			}
			return ResourceManager._instance;
		}

		this.state = options.state || null;
		this.resources = new Map();
		ResourceManager._instance = this;

		if (typeof window !== 'undefined') {
			window.ResourceManager = this;
			window.resource = resource;
		}
	}

	create(name, loader, options = {}) {
		if (this.resources.has(name)) return this.resources.get(name);

		const state = options.state
			|| this.state
			|| (typeof window !== 'undefined' ? window.StateManager : null);
		if (!state) {
			throw new Error(
				`ResourceManager: перед созданием «${name}» создайте StateManager или передайте options.state`,
			);
		}

		const instance = new AsyncResource(name, loader, { ...options, state }, this);
		this.resources.set(name, instance);

		return instance;
	}

	has(name) {
		return this.resources.has(name);
	}

	get(name) {
		return this.resources.get(name);
	}

	delete(name) {
		const instance = this.resources.get(name);
		if (!instance) return false;

		instance.destroy();
		return true;
	}

	clear() {
		for (const instance of [...this.resources.values()]) instance.destroy();
	}

	destroy() {
		this.clear();
		if (typeof window !== 'undefined') {
			if (window.ResourceManager === this) delete window.ResourceManager;
			if (window.resource === resource) delete window.resource;
		}
		if (ResourceManager._instance === this) ResourceManager._instance = null;
	}
}

export default function resource(name, loader, options = {}) {
	return new ResourceManager({ state: options.state }).create(name, loader, options);
}
