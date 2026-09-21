/**
 * NavigationManager
 *
 * Единая точка синхронизации URL и history.state для независимых компонентов.
 * Менеджер наблюдает pushState, replaceState, popstate и hashchange, сохраняет
 * данные компонентов в отдельных namespace и не затирает состояние чужого кода.
 *
 * Подключение
 * -----------
 * import NavigationManager from 'navigation';
 * const navigation = new NavigationManager();
 *
 * Повторный new возвращает тот же экземпляр. Он также доступен как
 * window.NavigationManager.
 *
 * Регистрация URL-адаптера
 * -----------------------
 * const unregister = navigation.register('account', {
 *   fromUrl(url, current) {
 *     const view = ['profile', 'cart', 'wish'].includes(url.hash.slice(1))
 *       ? url.hash.slice(1)
 *       : null;
 *
 *     return view ? { open: true, view } : null;
 *   },
 *   toUrl(url, account) {
 *     url.hash = account?.view || '';
 *     return url;
 *   },
 * });
 *
 * fromUrl получает URL, текущее значение namespace и полный history.state.
 * Его результат записывается в namespace. undefined удаляет namespace.
 * toUrl получает изменяемую копию URL, новое значение и все namespace. Он
 * может изменить URL на месте либо вернуть URL/строку.
 *
 * Навигация
 * ---------
 * navigation.navigate('account', { open: true, view: 'cart' });
 * navigation.replace('locationMap', { city: 'Москва', storeUuid: null });
 *
 * Третий аргумент поддерживает:
 * - url: явный URL, если адаптер toUrl не нужен;
 * - title: второй аргумент History API;
 * - historyState: верхнеуровневые данные для объединения с history.state.
 *
 * navigate создаёт новую запись истории, replace меняет текущую. Одинаковые
 * URL и состояния не записываются повторно, поэтому подписчик может безопасно
 * синхронизировать локальное состояние обратно с навигацией без циклов.
 * Для удаления namespace передайте NavigationManager.DELETE.
 *
 * Подписки
 * --------
 * const unsubscribe = navigation.subscribe('account', (value, previous, info) => {
 *   // info: { url, previousUrl, cause, historyState }
 * });
 *
 * По умолчанию namespace-подписчик сразу получает текущее значение. Опция
 * { immediate: false } отключает первый вызов. Глобальная форма
 * navigation.subscribe(info => {}) вызывается при любом замеченном изменении
 * URL/history.state, даже если зарегистрированные namespace не изменились.
 *
 * Структура history.state
 * -----------------------
 * Состояния лежат в history.state.__coreNavigation (ключ настраивается через
 * stateKey). Все остальные поля history.state сохраняются без изменений:
 * {
 *   popups: ['account'],             // данные другого кода
 *   __coreNavigation: {
 *     account: { open: true, view: 'cart' },
 *     catalog: { filters: [['color', 'red']] },
 *     locationMap: { city: 'Москва', storeUuid: null },
 *   },
 * }
 *
 * Публичный API
 * -------------
 * - register(namespace, adapter): зарегистрировать преобразования URL ↔ state;
 * - get(namespace): получить актуальное значение namespace;
 * - navigate(namespace, value, options): создать запись истории;
 * - replace(namespace, value, options): заменить текущую запись;
 * - subscribe(namespace, listener, options): подписаться на namespace;
 * - subscribe(listener): подписаться на все изменения навигации;
 * - refresh(cause): перечитать URL и history.state вручную;
 * - destroy(): снять слушатели, восстановить History API и удалить singleton.
 */

const DELETE = Symbol('NavigationManager.DELETE');

export default class NavigationManager {
	static DELETE = DELETE;

	constructor(options = {}) {
		if (NavigationManager._instance) return NavigationManager._instance;

		this.cfg = Object.assign({
			stateKey: '__coreNavigation',
			eventName: 'core:navigation',
		}, options);
		this.adapters = new Map();
		this.listeners = new Map();
		this.globalListeners = new Set();
		this.currentUrl = window.location.href;
		this.currentNamespaces = this._readNamespaces(window.history.state);
		this._destroyed = false;

		this._handlers = {
			popstate: () => this._synchronize('popstate'),
			hashchange: () => this._synchronize('hashchange'),
			pageshow: () => this._synchronize('pageshow'),
		};

		this._install();

		NavigationManager._instance = this;
		window.NavigationManager = NavigationManager._instance;
	}

	/**
	 * Регистрирует преобразования URL для одного независимого namespace.
	 * Повторная регистрация заменяет адаптер, но не подписчиков и не состояние.
	 *
	 * @param {string} namespace
	 * @param {Object} adapter
	 * @param {Function} [adapter.fromUrl]
	 * @param {Function} [adapter.toUrl]
	 * @returns {Function} Функция отмены именно этой регистрации.
	 */
	register(namespace, adapter = {}) {
		this._assertNamespace(namespace);
		if (!adapter || typeof adapter !== 'object') {
			throw new TypeError('NavigationManager.register: adapter должен быть объектом');
		}
		if (adapter.fromUrl !== undefined && typeof adapter.fromUrl !== 'function') {
			throw new TypeError('NavigationManager.register: fromUrl должен быть функцией');
		}
		if (adapter.toUrl !== undefined && typeof adapter.toUrl !== 'function') {
			throw new TypeError('NavigationManager.register: toUrl должен быть функцией');
		}

		this.adapters.set(namespace, adapter);
		this._synchronize('register', { force: true });

		return () => {
			if (this.adapters.get(namespace) !== adapter) return false;
			return this.adapters.delete(namespace);
		};
	}

	get(namespace) {
		this._assertNamespace(namespace);
		return this.currentNamespaces[namespace];
	}

	navigate(namespace, value, options = {}) {
		return this._write('pushState', namespace, value, options);
	}

	replace(namespace, value, options = {}) {
		return this._write('replaceState', namespace, value, options);
	}

	/**
	 * Поддерживает subscribe(namespace, listener, options) и subscribe(listener).
	 */
	subscribe(namespace, listener, options = {}) {
		if (typeof namespace === 'function') {
			const globalListener = namespace;
			this.globalListeners.add(globalListener);
			return () => this.globalListeners.delete(globalListener);
		}

		this._assertNamespace(namespace);
		if (typeof listener !== 'function') {
			throw new TypeError('NavigationManager.subscribe: listener должен быть функцией');
		}
		if (!this.listeners.has(namespace)) this.listeners.set(namespace, new Set());
		this.listeners.get(namespace).add(listener);

		if (options.immediate !== false) {
			this._callListener(namespace, listener, this.get(namespace), undefined, {
				url: new URL(this.currentUrl),
				previousUrl: null,
				cause: 'subscribe',
				historyState: window.history.state,
			});
		}

		return () => this.unsubscribe(namespace, listener);
	}

	unsubscribe(namespace, listener) {
		const listeners = this.listeners.get(namespace);
		if (!listeners) return false;

		const deleted = listeners.delete(listener);
		if (listeners.size === 0) this.listeners.delete(namespace);

		return deleted;
	}

	refresh(cause = 'refresh') {
		return this._synchronize(cause, { force: true });
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		window.removeEventListener('popstate', this._handlers.popstate);
		window.removeEventListener('hashchange', this._handlers.hashchange);
		window.removeEventListener('pageshow', this._handlers.pageshow);

		if (window.history.pushState === this._wrappedPushState) {
			window.history.pushState = this._originalPushState;
		}
		if (window.history.replaceState === this._wrappedReplaceState) {
			window.history.replaceState = this._originalReplaceState;
		}

		this.adapters.clear();
		this.listeners.clear();
		this.globalListeners.clear();
		if (window.NavigationManager === this) delete window.NavigationManager;
		if (NavigationManager._instance === this) NavigationManager._instance = null;
	}

	_install() {
		const manager = this;
		this._originalPushState = window.history.pushState;
		this._originalReplaceState = window.history.replaceState;

		this._wrappedPushState = function (...args) {
			const previousUrl = window.location.href;
			const result = manager._originalPushState.apply(this, args);
			manager._synchronize('pushState', { previousUrl, force: true });
			return result;
		};
		this._wrappedReplaceState = function (...args) {
			const previousUrl = window.location.href;
			const result = manager._originalReplaceState.apply(this, args);
			manager._synchronize('replaceState', { previousUrl, force: true });
			return result;
		};

		window.history.pushState = this._wrappedPushState;
		window.history.replaceState = this._wrappedReplaceState;
		window.addEventListener('popstate', this._handlers.popstate);
		window.addEventListener('hashchange', this._handlers.hashchange);
		window.addEventListener('pageshow', this._handlers.pageshow);
	}

	_write(method, namespace, value, options) {
		this._assertNamespace(namespace);
		if (!options || typeof options !== 'object') {
			throw new TypeError(`NavigationManager.${method === 'pushState' ? 'navigate' : 'replace'}: options должен быть объектом`);
		}

		const previousUrl = window.location.href;
		const namespaces = { ...this._readNamespaces(window.history.state) };
		if (value === DELETE) {
			delete namespaces[namespace];
		} else {
			namespaces[namespace] = value;
		}

		let url = new URL(options.url || window.location.href, window.location.href);
		const adapter = this.adapters.get(namespace);
		if (options.url === undefined && adapter?.toUrl) {
			const transformed = adapter.toUrl(url, value === DELETE ? undefined : value, namespaces);
			if (transformed !== undefined) url = new URL(transformed, window.location.href);
		}

		const historyState = this._mergeHistoryState(
			window.history.state,
			namespaces,
			options.historyState,
		);
		const sameUrl = url.href === window.location.href;
		const sameState = this._equal(historyState, window.history.state);
		if (sameUrl && sameState) return false;

		const original = method === 'pushState'
			? this._originalPushState
			: this._originalReplaceState;
		original.call(window.history, historyState, options.title || '', url.href);
		this._synchronize(method === 'pushState' ? 'navigate' : 'replace', {
			previousUrl,
			force: true,
		});

		return true;
	}

	_synchronize(cause, { previousUrl = this.currentUrl, force = false } = {}) {
		if (this._destroyed) return false;

		const href = window.location.href;
		const priorNamespaces = this.currentNamespaces;
		let namespaces = this._readNamespaces(window.history.state);

		for (const [namespace, adapter] of this.adapters) {
			if (!adapter.fromUrl) continue;

			try {
				const parsed = adapter.fromUrl(
					new URL(href),
					namespaces[namespace],
					window.history.state,
				);
				const nextNamespaces = { ...namespaces };
				if (parsed === undefined) {
					delete nextNamespaces[namespace];
				} else {
					nextNamespaces[namespace] = parsed;
				}
				namespaces = nextNamespaces;
			} catch (error) {
				console.error(`Ошибка навигации «${namespace}»:`, error);
			}
		}

		const storedNamespaces = this._readNamespaces(window.history.state);
		if (!this._equal(namespaces, storedNamespaces)) {
			const merged = this._mergeHistoryState(window.history.state, namespaces);
			this._originalReplaceState.call(window.history, merged, '', href);
		}

		const urlChanged = href !== this.currentUrl;
		const stateChanged = !this._equal(namespaces, priorNamespaces);
		if (!force && !urlChanged && !stateChanged) return false;

		this.currentUrl = href;
		this.currentNamespaces = namespaces;
		const info = {
			url: new URL(href),
			previousUrl: previousUrl ? new URL(previousUrl, href) : null,
			cause,
			historyState: window.history.state,
		};

		const names = new Set([...Object.keys(priorNamespaces), ...Object.keys(namespaces)]);
		for (const namespace of names) {
			if (this._equal(namespaces[namespace], priorNamespaces[namespace])) continue;
			for (const listener of [...(this.listeners.get(namespace) || [])]) {
				this._callListener(namespace, listener, namespaces[namespace], priorNamespaces[namespace], info);
			}
		}

		for (const listener of [...this.globalListeners]) {
			try {
				listener(info);
			} catch (error) {
				console.error('Ошибка глобального подписчика навигации:', error);
			}
		}

		if (typeof window.CustomEvent === 'function') {
			window.dispatchEvent(new window.CustomEvent(this.cfg.eventName, { detail: info }));
		}

		return true;
	}

	_readNamespaces(historyState) {
		const value = historyState && typeof historyState === 'object' && !Array.isArray(historyState)
			? historyState[this.cfg.stateKey]
			: null;

		return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
	}

	_mergeHistoryState(current, namespaces, patch) {
		const merged = current && typeof current === 'object' && !Array.isArray(current)
			? { ...current }
			: {};

		if (patch !== undefined) {
			if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
				throw new TypeError('NavigationManager: historyState должен быть объектом');
			}
			Object.assign(merged, patch);
		}

		if (Object.keys(namespaces).length === 0) {
			delete merged[this.cfg.stateKey];
		} else {
			merged[this.cfg.stateKey] = namespaces;
		}

		return merged;
	}

	_assertNamespace(namespace) {
		if (typeof namespace !== 'string' || namespace.trim() === '') {
			throw new TypeError('NavigationManager: namespace должен быть непустой строкой');
		}
	}

	_callListener(namespace, listener, value, previousValue, info) {
		try {
			listener(value, previousValue, info);
		} catch (error) {
			console.error(`Ошибка подписчика навигации «${namespace}»:`, error);
		}
	}

	_equal(left, right, seen = new WeakMap()) {
		if (Object.is(left, right)) return true;
		if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
		const prototype = Object.getPrototypeOf(left);
		if (prototype !== Object.getPrototypeOf(right)) return false;
		if (left instanceof Date) return left.getTime() === right.getTime();
		if (left instanceof RegExp) return left.source === right.source && left.flags === right.flags;
		if (!Array.isArray(left) && prototype !== Object.prototype && prototype !== null) return false;

		let rights = seen.get(left);
		if (rights?.has(right)) return true;
		if (!rights) {
			rights = new WeakSet();
			seen.set(left, rights);
		}
		rights.add(right);

		const leftKeys = Reflect.ownKeys(left);
		const rightKeys = Reflect.ownKeys(right);
		if (leftKeys.length !== rightKeys.length) return false;

		return leftKeys.every(key => Object.prototype.hasOwnProperty.call(right, key)
			&& this._equal(left[key], right[key], seen));
	}
}
