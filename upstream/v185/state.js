/**
 * StateManager
 *
 * Подробная инструкция и документация для разработчиков, использующих StateManager
 * в этом проекте.
 *
 * Описание
 * --------
 * Простое глобальное хранилище актуальных состояний со следующими особенностями:
 * - singleton: создаётся один экземпляр, доступный как window.StateManager;
 * - хранение последнего значения каждого состояния;
 * - синхронное уведомление подписчиков при изменении состояния;
 * - немедленная передача текущего значения новому подписчику;
 * - безопасная обработка ошибок: исключение одного подписчика не мешает остальным;
 * - поддержка функционального обновления через `update`.
 *
 * StateManager хранит то, что актуально сейчас. Для фактов, которые произошли
 * один раз и не должны переигрываться поздним подписчикам, используйте
 * EventEmitter. Например, `cart` является состоянием, а `cart:item-added` —
 * событием.
 *
 * Инициализация
 * -------------
 * const state = new StateManager();
 * // или использовать глобальный экземпляр после создания
 * window.StateManager;
 *
 * API (методы)
 * -------------
 * - set(name, value): сохранить новое значение и уведомить подписчиков.
 * - update(name, updater): вычислить новое значение на основе текущего.
 * - get(name): получить текущее значение.
 * - has(name): проверить, было ли состояние установлено.
 * - subscribe(name, listener, options): подписаться на состояние.
 * - unsubscribe(name, listener): удалить конкретного подписчика.
 * - delete(name): удалить одно состояние и уведомить его подписчиков.
 * - clear(): удалить все состояния и уведомить подписчиков.
 * - listenerCount(name): получить количество подписчиков состояния.
 *
 * Пример использования
 * --------------------
 * const state = new StateManager();
 *
 * // После загрузки корзины сохраняем её актуальное состояние.
 * state.set('cart', cart);
 *
 * // Подписчик сразу получит cart, если состояние уже было установлено,
 * // а затем будет получать каждое последующее изменение.
 * const unsubscribe = state.subscribe('cart', (cart, previousCart) => {
 *   updateCartIndicators(cart);
 * });
 *
 * // Функциональное обновление удобно, когда новое значение зависит от старого.
 * state.update('cart', currentCart => ({
 *   ...currentCart,
 *   quantity: currentCart.quantity + 1,
 * }));
 *
 * // Отписка.
 * unsubscribe();
 *
 * Поведение значений
 * ------------------
 * - Значения хранятся по ссылке и не копируются автоматически.
 * - Состояния следует обновлять иммутабельно: создавать новый объект или массив,
 *   а не изменять ранее сохранённое значение.
 * - Повторный `set` с тем же значением по `Object.is` не вызывает подписчиков.
 * - `undefined` является допустимым значением. Для проверки существования
 *   состояния используйте `has`, а не сравнение результата `get`.
 *
 * Подписка и удаление
 * ------------------
 * - По умолчанию `subscribe` синхронно передаёт уже сохранённое значение.
 * - Передайте `{ immediate: false }`, если первое значение при подписке не нужно.
 * - При `delete` подписчики получают `undefined` и предыдущее значение.
 * - `clear` выполняет такое же удаление отдельно для каждого состояния.
 * - Подписки после удаления сохраняются и продолжат получать новые значения.
 *
 * Рекомендации
 * ------------
 * - Используйте короткие имена сущностей: `cart`, `wish`, `account`.
 * - Не добавляйте к состояниям суффикс `:updated`: обновление уже выражено
 *   методом `set`, а имя описывает само текущее состояние.
 * - Для нескольких независимых экземпляров сущности храните коллекцию по ID
 *   либо используйте составные ключи, например `product-selection:42`.
 * - Сохраняйте функцию, возвращаемую `subscribe`, и вызывайте её при уничтожении
 *   компонента, чтобы не оставлять лишних подписчиков.
 */
export default class StateManager {
	constructor() {
		if (StateManager._instance) return StateManager._instance;

		this.states = new Map();
		this.listeners = new Map();

		StateManager._instance = this;
		window.StateManager = StateManager._instance;
	}

	/**
	 * Проверяет, было ли состояние установлено.
	 * В отличие от проверки `get(name) !== undefined`, корректно работает,
	 * когда `undefined` сохранён как самостоятельное значение.
	 *
	 * @param {string} name - Имя состояния.
	 * @returns {boolean} `true`, если состояние существует.
	 */
	has(name) {
		return this.states.has(name);
	}

	/**
	 * Возвращает текущее значение состояния.
	 *
	 * @param {string} name - Имя состояния.
	 * @returns {*} Сохранённое значение или `undefined`, если состояния нет.
	 */
	get(name) {
		return this.states.get(name);
	}

	/**
	 * Сохраняет новое значение состояния и синхронно уведомляет подписчиков.
	 * Если новое и текущее значения равны по `Object.is`, обновление пропускается.
	 *
	 * Каждый подписчик получает новое и предыдущее значения. Список подписчиков
	 * копируется перед рассылкой, поэтому подписка или отписка внутри обработчика
	 * не изменяет уже начавшийся проход.
	 *
	 * @param {string} name - Имя состояния.
	 * @param {*} value - Новое значение.
	 * @returns {boolean} `true`, если состояние изменилось, иначе `false`.
	 */
	set(name, value) {
		const exists = this.states.has(name);
		const previousValue = this.states.get(name);

		if (exists && Object.is(previousValue, value)) return false;

		this.states.set(name, value);
		this._notify(name, value, previousValue);

		return true;
	}

	/**
	 * Вычисляет и сохраняет новое значение на основе текущего.
	 * Updater вызывается синхронно и получает текущее значение либо `undefined`,
	 * если состояние ещё не было установлено.
	 *
	 * @param {string} name - Имя состояния.
	 * @param {Function} updater - Функция `(currentValue) => newValue`.
	 * @returns {boolean} Результат вызова `set`: изменилось ли состояние.
	 * @throws {TypeError} Если updater не является функцией.
	 */
	update(name, updater) {
		if (typeof updater !== 'function') {
			throw new TypeError('StateManager.update: updater должен быть функцией');
		}

		return this.set(name, updater(this.states.get(name)));
	}

	/**
	 * Подписывает функцию на изменения состояния.
	 * По умолчанию уже сохранённое значение передаётся подписчику немедленно.
	 * Возвращает функцию для отписки.
	 *
	 * @param {string} name - Имя состояния.
	 * @param {Function} listener - Обработчик `(value, previousValue)`.
	 * @param {Object} [options] - Настройки подписки.
	 * @param {boolean} [options.immediate=true] - Передать ли текущее значение сразу.
	 * @returns {Function} Функция для отписки.
	 * @throws {TypeError} Если listener не является функцией.
	 */
	subscribe(name, listener, { immediate = true } = {}) {
		if (typeof listener !== 'function') {
			throw new TypeError('StateManager.subscribe: listener должен быть функцией');
		}

		if (!this.listeners.has(name)) {
			this.listeners.set(name, new Set());
		}

		this.listeners.get(name).add(listener);

		if (immediate && this.states.has(name)) {
			this._callListener(name, listener, this.states.get(name), undefined);
		}

		return () => this.unsubscribe(name, listener);
	}

	/**
	 * Удаляет конкретного подписчика состояния.
	 * Пустой набор подписчиков удаляется, чтобы не накапливать имена состояний.
	 *
	 * @param {string} name - Имя состояния.
	 * @param {Function} listener - Ранее зарегистрированный обработчик.
	 * @returns {boolean} `true`, если подписчик был найден и удалён.
	 */
	unsubscribe(name, listener) {
		const listeners = this.listeners.get(name);
		if (!listeners) return false;

		const deleted = listeners.delete(listener);

		if (listeners.size === 0) {
			this.listeners.delete(name);
		}

		return deleted;
	}

	/**
	 * Удаляет состояние и синхронно уведомляет подписчиков.
	 * Обработчики получают `undefined` как новое значение и удалённое значение
	 * как предыдущее. Сами подписки при этом сохраняются.
	 *
	 * @param {string} name - Имя состояния.
	 * @returns {boolean} `true`, если состояние существовало и было удалено.
	 */
	delete(name) {
		if (!this.states.has(name)) return false;

		const previousValue = this.states.get(name);
		this.states.delete(name);
		this._notify(name, undefined, previousValue);

		return true;
	}

	/**
	 * Удаляет все установленные состояния.
	 * Для каждого состояния выполняется обычный `delete`, поэтому его подписчики
	 * получают уведомление и остаются активными для будущих значений.
	 */
	clear() {
		for (const name of [...this.states.keys()]) {
			this.delete(name);
		}
	}

	/**
	 * Возвращает количество подписчиков указанного состояния.
	 *
	 * @param {string} name - Имя состояния.
	 * @returns {number} Количество активных подписчиков.
	 */
	listenerCount(name) {
		return this.listeners.get(name)?.size ?? 0;
	}

	/**
	 * Синхронно уведомляет всех текущих подписчиков состояния.
	 *
	 * @private
	 * @param {string} name - Имя состояния.
	 * @param {*} value - Новое значение.
	 * @param {*} previousValue - Предыдущее значение.
	 */
	_notify(name, value, previousValue) {
		const listeners = this.listeners.get(name);
		if (!listeners) return;

		for (const listener of [...listeners]) {
			this._callListener(name, listener, value, previousValue);
		}
	}

	/**
	 * Вызывает одного подписчика и изолирует возможную ошибку обработчика.
	 *
	 * @private
	 * @param {string} name - Имя состояния.
	 * @param {Function} listener - Обработчик состояния.
	 * @param {*} value - Новое значение.
	 * @param {*} previousValue - Предыдущее значение.
	 */
	_callListener(name, listener, value, previousValue) {
		try {
			listener(value, previousValue);
		} catch (error) {
			console.error(`Ошибка состояния «${name}»:`, error);
		}
	}
}
