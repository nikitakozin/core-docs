/**
 * EventEmitter
 *
 * Подробная инструкция и документация для разработчиков, использующих EventEmitter
 * в этом проекте.
 *
 * Описание
 * --------
 * Простой глобальный эмиттер событий со следующими особенностями:
 * - singleton: создаётся один экземпляр, доступен как window.EventEmitter;
 * - поддержка отложенной рассылки: события, отправленные через `emit`, собираются
 *   и выполняются пакетно с небольшой задержкой (200ms) — это предотвращает
 *   многократные синхронные вызовы при высокочастотных событиях;
 * - мгновенная отправка через `emitImmediate`;
 * - метод `emitWithAsyncResponse` возвращает результат от каждого слушателя
 *   в виде Promise (всеSettled) и позволяет слушателям отвечать accept/reject.
 *
 * Инициализация
 * -------------
 * const ee = new EventEmitter();
 * // или просто использовать глобально
 * window.EventEmitter // экземпляр доступен после создания
 *
 * API (методы)
 * --------------
 * - on(event, cb): подписка на событие. Возвращает функцию отписки.
 *     Пример:
 *       const off = ee.on('my:event', data => console.log(data));
 *       // отписаться
 *       off();
 *
 * - off(event, cb): удалить конкретный обработчик от события.
 *
 * - emit(event, ...args): отложенная отправка события. Все вызовы
 *   `emit` собираются и выполняются пакетно каждые ~200ms (см. flushTimer).
 *   Полезно для событий, которые генерируются часто (resize, scroll-like, etc.).
 *   Аргументы передаются подписчикам в том же порядке, в каком были указаны.
 *
 * - emitImmediate(event, ...args): немедленное выполнение всех подписчиков
 *   для события (синхронно). Используйте, когда нужен мгновенный отклик.
 *
 * - emitWithAsyncResponse(event, ...args): вызывает слушателей и ожидает
 *   их ответов через колбек-объект, передаваемый как последний аргумент.
 *   Каждый слушатель получает последний аргумент в форме
 *   { accept: Function, reject: Function }.
 *   Возвращает Promise.allSettled для всех подписчиков.
 *
 * - listenerCount(event): возвращает число подписчиков на событие.
 *
 * Поведение слушателей и ошибки
 * -----------------------------
 * - Если обработчик бросает ошибку, EventEmitter ловит её и логирует в консоль,
 *   не прерывая выполнение других обработчиков.
 * - Для `emit` ошибки в отдельных обработчиках также логируются при flush.
 *
 * Пример использования
 * -------------------
 * // Подписка
 * const unsubscribe = ee.on('user:login', (user) => {
 *   console.log('Вошёл пользователь', user.name);
 * });
 *
 * // Отправка (отложенно, пакетно)
 * ee.emit('user:login', { id: 1, name: 'Anna' });
 *
 * // Немедленная отправка
 * ee.emitImmediate('ping', { time: Date.now() });
 *
 * // Получение асинхронных ответов от слушателей
 * ee.on('save:confirm', (data, { accept, reject }) => {
 *   if (data.ok) accept(); else reject();
 * });
 * ee.emitWithAsyncResponse('save:confirm', { ok: true }).then(results => {
 *   console.log(results); // массив результатов allSettled
 * });
 *
 * Рекомендации и частые кейсы
 * ---------------------------
 * - Используйте `emit` для событий с высокой частотой, где не требуется
 *   мгновенная реакция.
 * - Используйте `emitImmediate` если нужен синхронный эффект (например в init).
 * - Используйте `emitWithAsyncResponse` если необходимо собрать согласие/ответы
 *   от подписчиков (пример: подтверждение сохранения, валидация и т.д.).
 * - Всегда сохраняйте функцию, возвращаемую `on`, если планируете отписываться.
 *
 * Замечания по реализации
 * -----------------------
 * - Таймер задержки установлен на 200ms для пакетной отправки; можно изменить
 *   значение в _flushEvents/emit, если требуется другая частота.
 * - Слушатели хранятся в Map => Set функций, что позволяет безопасно добавлять
 *   и удалять обработчики.
 */
export default class EventEmitter {
	constructor() {
		if (EventEmitter._instance) return EventEmitter._instance;
		
		this.listeners = new Map();
		this.pendingEvents = new Map();
		this.flushTimer = null;
		
		EventEmitter._instance = this;
		window.EventEmitter = EventEmitter._instance;
	}

	/**
	 * Подписывает функцию-обработчик на указанный тип события.
	 * Если для события ещё нет слушателей, создаёт новый набор.
	 * Возвращает функцию для отписки от события.
	 *
	 * @param {string} event - Имя события, на которое происходит подписка.
	 * @param {Function} cb - Функция-обработчик, вызываемая при возникновении события.
	 * @returns {Function} Функция для отписки от события.
	 */
	on(event, cb) {
		if (!this.listeners.has(event)) this.listeners.set(event, new Set());
		this.listeners.get(event).add(cb);
		return () => this.off(event, cb);  // возвращаем функцию для отписки
	}

	/**
	 * Удаляет обработчик события для указанного события.
	 *
	 * @param {string} event - Имя события, для которого нужно удалить обработчик.
	 * @param {Function} cb - Функция-обработчик, которую необходимо удалить.
	 */
	off(event, cb) {
		this.listeners.get(event)?.delete(cb);
	}

	/**
	 * Вызывает все обработчики, зарегистрированные для указанного события.
	 * Аргументы сохраняются и обработчики вызываются раз в 150 мс.
	 */
	emit(event, ...args) {
		// Сохраняем событие и аргументы для последующей рассылки
		if (!this.pendingEvents.has(event)) this.pendingEvents.set(event, []);
		this.pendingEvents.get(event).push(args);
		
		// Планируем отправку, если ещё не запланировано
		if (!this.flushTimer) {
			this.flushTimer = setTimeout(() => this._flushEvents(), 200);
		}
	}

	emitWithAsyncResponse(event, ...args) {
		const listeners = this.listeners.get(event);

		if (!listeners || listeners.size === 0) {
			return Promise.resolve([]); // Нет подписчиков
		}

		// Создаем массив промисов для обработки ответа от каждого подписчика
		const promises = Array.from(listeners).map(listener => {
			return new Promise((resolve, reject) => {
				try {
					listener(
						...args,
						{
							accept: () => resolve('accept'),
							reject: () => reject('reject'),
						}
					);
				} catch (error) {
					console.error(`Ошибка «${event}»:`, error);
					reject(error);
				}
			});
		});

		// Ожидаем выполнения всех промисов
		return Promise.allSettled(promises);
	}


	/**
	 * Вызывает все обработчики, зарегистрированные для указанного события немедленно.
	 * @param {string} event - Имя события.
	 * @param {...any} args - Аргументы для переданных обработчиков.
	 */
	emitImmediate(event, ...args) {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.forEach(cb => {
				try {
					cb(...args);
				} catch (e) {
					console.error(`Ошибка «${event}»:`, e);
				}
			});
		}
	}
	

	/**
	 * Обрабатывает все отложенные события, вызывая соответствующие слушатели для каждого события.
	 * Для каждого события из очереди вызывает все зарегистрированные обработчики с переданными аргументами.
	 * В случае ошибки в обработчике выводит сообщение в консоль, не прерывая выполнение остальных обработчиков.
	 * После обработки всех событий очищает очередь и сбрасывает таймер.
	 *
	 * @private
	 */
	_flushEvents() {
		// (Опционально) можно добавить проверку существования слушателей для события.
		for (const [event, argsList] of this.pendingEvents.entries()) {
			const listeners = this.listeners.get(event);
			if (listeners) {
				for (const args of argsList) {
					listeners.forEach(cb => {
						try {
							cb(...args);
						} catch (e) {
							console.error(`Ошибка «${event}»:`, e);
						}
					});
				}
			}
		}
		// Очищаем очередь и сбрасываем таймер
		this.pendingEvents.clear();
		this.flushTimer = null;
	}


	listenerCount(event) {
		if (!this.listeners.has(event)) return 0;
		return this.listeners.get(event).size;
	}
}