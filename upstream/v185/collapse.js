// onoffer

// toggler

// collapse

// visible.js

// data-visible-show

// display.js

// vision.js

// data-vision-show

// data-display-show

// show.js

// see.js

// ghost.js



/**
 * CollapseManager
 *
 * Подробная инструкция по использованию класса CollapseManager для новых пользователей.
 *
 * Кратко
 * -----
 * CollapseManager управляет видимостью «коллапсов» (скрываемых блоков) в DOM.
 * Он поддерживает: триггеры (показывать/скрывать/переключать), сгруппированные
 * коллапсы, hover- и focus-поведение, а также опциональное сохранение
 * состояния в localStorage.
 *
 * Подключение и инициализация
 * --------------------------
 * - Скрипт просто импортируется и создаётся экземпляр:
 *     import CollapseManager from './js/collapse.js';
 *     const cm = new CollapseManager();
 *
 * - Класс использует singleton-паттерн: повторный new вернёт уже созданный
 *   экземпляр. Также экземпляр доступен как window.CollapseManager.
 *
 * HTML-разметка (пример)
 * ----------------------
 * - Контейнер коллапса помечается атрибутом data-collapse (или другим через cfg.collapseAttr).
 * - Внутреннее содержимое — любые дочерние элементы. Для управления видимостью
 *   используется CSS-класс (cfg.hideClass или указанный через data-collapse-hide-class).
 *
 * <div id="panel1" data-collapse>
 *   <p>Контент панель 1</p>
 * </div>
 *
 * Группы
 * ------
 * Если у коллапса есть атрибут data-collapse-group (cfg.collapseGroupAttr),
 * то он считается частью группы. Триггеры могут принимать имена групп, и
 * тогда действие будет применено ко всем элементам группы.
 *
 * Атрибуты (по умолчанию, можно переопределить через cfg)
 * -----------------------------------------------------
 * - data-collapse (cfg.collapseAttr): пометка элемента как коллапс.
 * - data-collapse-save (cfg.saveStateAttr): включает сохранение состояния
 *     в localStorage (принадлежность этому атрибуту на элементе или родителе).
 * - data-collapse-hide-class (cfg.hideClassAttr): альтернативный класс для скрытия.
 * - data-collapse-animate (cfg.animateAttr): при наличии включает анимацию —
 *     либо указывает CSS-класс анимации, либо пустая строка означает
 *     использование дефолтной анимации из cfg.anim.show.class.
 * - data-collapse-group (cfg.collapseGroupAttr): имя группы.
 *
 * Триггеры управления
 * -------------------
 * Все триггерные атрибуты могут содержать список ID или имён групп через запятую:
 * - data-collapse-show — показать указанные (id или группы)
 * - data-collapse-hide — скрыть указанные
 * - data-collapse-toggle — переключить состояние
 * - data-collapse-show-only — показать указанные внутри их групп и скрыть остальные
 * - data-collapse-hide-only — скрыть указанные внутри их групп и показать остальные
 *
 * Примеры:
 * <button data-collapse-show="panel1">Показать</button>
 * <button data-collapse-toggle="panel1,panel2">Переключить</button>
 * <button data-collapse-show="group1">Показать всю группу</button>
 *
 * Hover / mouse modifiers
 * -----------------------
 * Дополнительно есть поведение для мыши/фокуса:
 * - data-collapse-hover — простой hover: при наведении выполняется действие, при уходе — ничего.
 * - data-collapse-mouseon — действие выполняется только пока мышь над триггером; при уходе выполняется inverse.
 * - data-collapse-mouseover — обратное mouseon: действие выполняется когда мыши нет, inverse при наведении.
 * Эти модификаторы работают также при фокусе (keyboard accessible) — менеджер добавляет tabindex к неинтерактивным элементам.
 *
 * Конфигурация (параметры конструктора)
 * -------------------------------------
 * new CollapseManager(options) принимает объект с полями (по умолчанию показаны):
 * - animation: false — глобально включить анимации.
 * - collapseAttr: 'data-collapse'
 * - saveStateAttr: 'data-collapse-save'
 * - hideClass: 'core-hide' — класс, добавляемый для скрытия.
 * - hideClassAttr: 'data-collapse-hide-class'
 * - animateAttr: 'data-collapse-animate'
 * - collapseGroupAttr: 'data-collapse-group'
 * - triggerHoverAttr / triggerMouseOnAttr / triggerMouseOverAttr — имена hover-атрибутов.
 * - triggerShowAttr / triggerHideAttr / triggerToggleAttr / triggerShowOnlyInGroupAttr / triggerHideOnlyInGroupAttr
 * - anim: { show: { class: 'core-pulse-in', duration: 400 } } — дефолтные параметры анимации.
 * - storageKey: 'collapseManager' — ключ localStorage для сохранения состояний.
 *
 * Публичные методы
 * -----------------
 * - autoInit(): сканирует DOM и регистрирует все элементы с cfg.collapseAttr.
 * - registerCollapse(id, collapseDOM): зарегистрировать конкретный элемент как коллапс.
 * - refresh(): обновляет listeners и регистрирует новые элементы.
 * - show(ids, options), hide(ids, options), toggle(ids, options):
 *     ids — строка (id или имя группы), массив строк или группа. options может содержать:
 *       - animationClass: null | string — класс анимации для показа (если пустая строка — используется дефолтная anim.show.class).
 *       - isHover: true|false — флаг вызова из hover-логики.
 * - showOnly(ids, options), hideOnly(ids, options): действия в пределах групп (показывает/скрывает только перечисленные и инвертирует остальные в группе).
 * - isShow(id), isHide(id): быстрые проверки состояния.
 * - destroy(): удаляет слушатели, очищает таймеры и singleton.
 *
 * Особенности реализации (важно для понимания)
 * -------------------------------------------
 * - Управление фокусом: при показе/скрытии менеджер обновляет tabindex вложенных фокусируемых элементов,
 *   чтобы скрытые элементы не были доступны через Tab. Оригинальные tabindex сохраняются в data-orig-tabindex.
 * - Отложенные действия: при массовых операциях для show используется распределённая задержка (animated stagger)
 *   — чтобы анимировать демонстрацию большого количества элементов по очереди. Для toggle задержки нет.
 * - Таймеры: менеджер хранит активные таймеры в this._state.activeTimeouts и очищает их при необходимости.
 * - Сохранение состояния: если элемент (или его родитель) маркирован saveStateAttr, его видимость будет сохранена
 *   в localStorage под ключом cfg.storageKey; сохранение выполняется с debounce 300ms.
 *
 * Примеры использования
 * ---------------------
 * // Инициализация
 * const cm = new CollapseManager({ animation: true });
 *
 * // Программная навигация
 * cm.show('panel1');
 * cm.hide(['panel1','panel2']);
 * cm.toggle('panel3');
 * cm.show('group1'); // показать все коллапсы в группе
 * cm.showOnly(['panelX'], { animationClass: 'my-fade-in' });
 *
 * // Проверка состояния
 * if (cm.isShow('panel1')) {
 *   console.log('panel1 видим');
 * }
 *
 * Дальнейшие улучшения
 * --------------------
 * - Добавить поддержку EventEmitter (emit событий) — сейчас закомментировано.
 * - Позволить конфигурировать threshold/stagger timings через опции.
 *
 * Примечание
 * ---------
 * Документация ориентирована на поведение текущего кода. Если вы хотите
 * изменить поведение (например, стратегию сохранения или анимации), правьте
 * соответствующие места в коде или сообщите — я внесу изменения.
 */
export default class CollapseManager {

	// SECTION constructor()

	constructor(options = {}) {
		if (CollapseManager._instance) return CollapseManager._instance;

		// this.emitter = window.EventEmitter || null;
		// if (!this.emitter) {
		//     console.warn('[FormManager] EventEmitter не найден в window.EventEmitter. Логика подписчиков будет отключена. Если EventEmitter был создан позже FormManager, выполните FormManager.autoInit(), затем создайте подписчиков');
		// }

		// if (CollapseManager._instance) {
		//     CollapseManager._instance.emitter = this.emitter;
		//     return CollapseManager._instance;
		// }

		this.cfg = Object.assign({
			animation: false, // Если указан false, то по умолчанию анимация не будет работать для всех, только для тех, где указан animateAttr

			collapseAttr: 'data-collapse',
			saveStateAttr: 'data-collapse-save', // При добавлении этого атрибута к коллапсу или любому родителю, его состояние будет сохраняться при перезагрузке страницы


			hideClass: 'core-hide', // По умолчанию для скрытия коллапса добавляется этот класс. Если не указан hideClassAttr, то будет использоваться этот класс.
			hideClassAttr: 'data-collapse-hide-class', // Если указан, то будет использоваться этот класс для скрытия коллапса. Если не указан, то используется hideClass
			animateAttr: 'data-collapse-animate', // Если при выключенной анимации указан пустой, то работает дефолтная анимация anim.show.class только для этого коллапса. Если указан класс, применяется его анимация.
			collapseGroupAttr: 'data-collapse-group', // Коллпас, у которого указан этот атрибут, будет частью группы. Группа может быть показана или скрыта целиком.

			// Триггеры для управления коллапсами
			// Все триггеры могут принимать id коллапсов или групп, разделенные запятыми
			// Например: 
			// data-collapse-show="collapse1,collapse2" – одиночные коллапсы
			// data-collapse-show="group1,group2" – все группы
			// data-collapse-show="group1,collapse2" – и одиночные и группы, в заданном порядке

			triggerHoverAttr: 'data-collapse-hover', // Добавляет триггеру ховер-помедение: при наведении мыши будет срабатывать логика "on", при выходе мыши остается в новом состоянии ("invert" не выполняется). Этот триггер будет срабатывать при фокусе на элемент с клавиатуры. 
			triggerMouseOnAttr: 'data-collapse-mouseon', // Добавляет триггеру mouseon-поведение. Логика "on" будет выполняться только когда мышь наведена на триггер. При выходе мыши с триггера выполняется "invert". Этот триггер будет срабатывать при фокусе на элемент с клавиатуры. 
			triggerMouseOverAttr: 'data-collapse-mouseover', // Обратное mouseon-поведение, пока мышь не триггере будет выполняться логика "on", при наведении выполнится "invert". Этот триггер будет срабатывать при фокусе на элемент с клавиатуры. 
			triggerShowAttr: 'data-collapse-show', // Триггер для показа коллапса
			triggerHideAttr: 'data-collapse-hide', // Триггер для скрытия коллапса
			triggerToggleAttr: 'data-collapse-toggle', // Триггер для переключения состояния коллапса
			triggerShowOnlyInGroupAttr: 'data-collapse-show-only', // Триггер который показывает только указанные элементы в группе, остальные скрывает. Если коллапс не в группе, то просто показывает его
			triggerHideOnlyInGroupAttr: 'data-collapse-hide-only', // Триггер который скрывает только указанные элементы в группе, остальные показывает. Если коллапс не в группе, то просто скрывает его

			// Необязательные атрибуты, так как collapseTriggerShow и collapseTriggerHide умеют принимать id групп
			// collapseTriggerShowGroupAttr: 'data-collapse-show-group',
			// collapseTriggerHideGroupAttr: 'data-collapse-hide-group',

			anim: {
				show: { class: 'core-pulse-in', duration: 400 },
			},

			storageKey: 'collapseManager'
		}, options);

		this.acts = new Map([
			[this.cfg.triggerShowAttr, { on: 'show', inverse: 'hide' }],
			[this.cfg.triggerHideAttr, { on: 'hide', inverse: 'show' }],
			[this.cfg.triggerToggleAttr, { on: 'toggle', inverse: 'toggle' }],
			[this.cfg.triggerShowOnlyInGroupAttr, { on: 'showOnly', inverse: 'hide' }],
			[this.cfg.triggerHideOnlyInGroupAttr, { on: 'hideOnly', inverse: 'show' }],
			// [this.cfg.collapseTriggerShowGroupAttr, { on: 'show', inverse: 'hide' }],
			// [this.cfg.collapseTriggerHideGroupAttr, { on: 'hide', inverse: 'show' }],
		]);

		this.collapses = new Map();

		this._state = {
			hoverListeners: new Map(), // Структура: { element: { mouseenter: handler, mouseleave: handler } }
			activeTimeouts: new Map(), // Структура: { id: { timeoutId, action, options } }
			globListenersInit: false, // Флаг для проверки инициализации глобальных слушателей
		};


		this._saveStateDebounced = debounce(this.#_saveCollapseState.bind(this), 300);

		this._handlers = {
			globalClick: this.#_handleGlobalClick.bind(this),
		};

		// Инициализируем CollapseManager
		this.autoInit();

		// Восстанавливаем состояние коллапсов после регистрации
		this.#_restoreCollapseState();

		CollapseManager._instance = this;

		window.CollapseManager = CollapseManager._instance; // Для глобального доступа к экземпляру
	}



	// !SECTION
	// SECTION Регистрация

	autoInit() {
		document.querySelectorAll('[' + this.cfg.collapseAttr + ']').forEach(collapseDOM => {
			const id = collapseDOM.id ||
				collapseDOM.getAttribute(this.cfg.collapseAttr) ||
				(collapseDOM.getAttribute(this.cfg.collapseGroupAttr) + '-' + Math.random().toString(36).slice(2, 8));
			
			if (id) this.registerCollapse(id, collapseDOM);
		});

		// Добавляем слушатели кликов по всему документу
		this.#_initGlobalClickListener();

		this.#_initMouseAndFocusListeners();

		return "Новых коллапсов: " + this.collapses.size;
	}



	refresh() {
		this.#_removeMouseAndFocusListeners();
		this.autoInit();
	};



	registerCollapse(id, collapseDOM) {
		if (!collapseDOM) throw new Error('DOM коллапса "' + id + '" не найден');

		const customHideClass = collapseDOM.getAttribute(this.cfg.hideClassAttr) || this.cfg.hideClass;
		let state = collapseDOM.classList.contains(customHideClass) ? 0 : 1;

		this.collapses.set(id, {
			DOM: collapseDOM,
			group: collapseDOM.getAttribute(this.cfg.collapseGroupAttr) || null,
			state,
			hideClass: customHideClass,
		});

		// Управляем фокусом при регистрации
		this.#_updateFocusability(id, state === 1);

		return "Новый коллапс " + id;
	}


	// !SECTION
	// SECTION Обработчики событий

	// Слушатели кликов по всему документу
	#_handleGlobalClick(e) {
		this.#_handleTriggerEvent(e, { isHover: false });
	}

	#_initGlobalClickListener() {
		if (!this._state.globListenersInit) {
			document.addEventListener('click', this._handlers.globalClick);
			this._state.globListenersInit = true;
		}
	}

	#_removeGlobalClickListener() {
		document.removeEventListener('click', this._handlers.globalClick);
	}

	

	// Слушатели наведения мыши
	#_handleMouseAndFocus(e, options = {}) {
		// console.log('CollapseManager: Обработка hover-события', { target: e.target, options });
		this.#_handleTriggerEvent(e, { isHover: true, isMouseLeave: options.isMouseLeave });
	}

	#_initMouseAndFocusListeners() {
		const attrs = [
			this.cfg.triggerHoverAttr,
			this.cfg.triggerMouseOnAttr,
			this.cfg.triggerMouseOverAttr,
		].filter(Boolean);

		if (!attrs.length) return;

		const selector = attrs.map(a => `[${a}]`).join(', ');

		document.querySelectorAll(selector).forEach(trigger => {
			if (this._state.hoverListeners.has(trigger)) return;

			// Делаем неинтерактивный элемент фокусируемым, чтобы сработали focus/blur
			const tn = trigger.tagName;
			const isNative = /^(BUTTON|INPUT|SELECT|TEXTAREA|A|AREA|SUMMARY)$/i.test(tn) && (tn !== 'A' || trigger.hasAttribute('href'));
			if (!isNative && !trigger.hasAttribute('tabindex') && !trigger.hasAttribute('contenteditable')) {
				trigger.setAttribute('tabindex', '0');
			}

			const handlers = {
				mouseenter: (e) => this.#_handleMouseAndFocus(e),
				mouseleave: (e) => this.#_handleMouseAndFocus(e, { isMouseLeave: true }),
				focus: (e) => requestAnimationFrame(() => this.#_handleMouseAndFocus(e)),
				blur: (e) => {
					const onFocusIn = (evt) => {
						if (!trigger.contains(evt.target)) {
							this.#_handleMouseAndFocus({target: trigger}, { isMouseLeave: true });
							document.removeEventListener('focusin', onFocusIn, true);
						}
					};
					document.addEventListener('focusin', onFocusIn, true);
				}
			};

			// Привязываем все обработчики одним циклом
			Object.entries(handlers).forEach(([event, handler]) => {
				trigger.addEventListener(event, handler);
			});

			this._state.hoverListeners.set(trigger, handlers);
		});

		// Проверяем, есть ли уже наведение на элементы при инициализации
		setTimeout(() => {
			const hoveredElements = document.querySelectorAll(':hover');
			const lastHovered = hoveredElements[hoveredElements.length - 1];
			
			if (lastHovered) {
				const hoverTrigger = lastHovered.closest(selector);
				if (hoverTrigger && this._state.hoverListeners.has(hoverTrigger)) {
					this.#_handleMouseAndFocus({ target: hoverTrigger });
				}
			}
		}, 0);

	}

	#_removeMouseAndFocusListeners() {
		this._state.hoverListeners.forEach((handlers, element) => {
			// Упрощенное удаление всех обработчиков
			Object.entries(handlers).forEach(([event, handler]) => {
				if (typeof handler === 'function') {
					element.removeEventListener(event, handler);
				}
			});
		});
		
		this._state.hoverListeners.clear();
	}

	#_handleTriggerEvent(e, { isHover = false, isMouseLeave = false } = {}) {

		const attrs = Array.from(this.acts.keys());
		// Ранний выход если дочерний элемент интерактивен
		const target = attrs
			.map(attr => e.target.closest(`[${attr}]`))
			.find(el => el);

		if (target && target !== e.target) {
			const tn = e.target.tagName;
			const isNative = /^(BUTTON|INPUT|SELECT|TEXTAREA|A|AREA|SUMMARY)$/i.test(tn) && (tn !== 'A' || e.target.hasAttribute('href'));
			const isContentEditable = e.target.hasAttribute('contenteditable');
			if (isNative || isContentEditable) return;
		}

		if (!target) return;
		const attrMap = this.acts;

		// Флаги модификаторов поведения при hover
		const hasMouseOn = target.hasAttribute(this.cfg.triggerMouseOnAttr);
		const hasMouseOver = target.hasAttribute(this.cfg.triggerMouseOverAttr);
		const hasSimpleHover = target.hasAttribute(this.cfg.triggerHoverAttr);

		// Отключаем логику по клику для hover-элементов
		if (!isHover && (hasMouseOn || hasMouseOver || hasSimpleHover)) return;

		for (const [attr, { on, inverse }] of attrMap.entries()) {
			const value = target.getAttribute(attr);
			if (value === null) continue;

			// e.preventDefault();
			const ids = value.split(',').map(s => s.trim()).filter(Boolean);
			
			// Если нет ID, то просто локальная обработка (например data-collapse-hide="")
			if (!ids.length) {
				this.#_handleLocalClick(e, attr);
				return;
			};

			let action = on;
			if (isHover) {
				if (hasMouseOn) {
					// Выполняем действие при наведении, inverse при уходе
					action = isMouseLeave ? inverse : on;
				} else if (hasMouseOver) {
					// Выполняем действие когда мыши нет (mouseleave), inverse при наведении
					action = isMouseLeave ? on : inverse;
				} else if (hasSimpleHover) {
					// Простой hover: только при наведении
					if (isMouseLeave) return; // ничего не делаем при уходе
					action = on;
				} else {
					// Событие пришло из hover listeners, но модификаторов нет – игнорируем
					return;
				}
			}

			const animationClass = target.hasAttribute(this.cfg.animateAttr)
				? (target.getAttribute(this.cfg.animateAttr) || this.cfg.anim.show.class)
				: null;

			this[action](ids, { animationClass, isHover });
			return;
		}
	}

	#_handleLocalClick(e, attr) {
		const target = e.target;

		if (attr === this.cfg.triggerHideAttr) {
			// Ищем ближайший родительский коллапс
			const closestCollapse = target.closest(`[${this.cfg.collapseAttr}]`);
			if (closestCollapse && closestCollapse.id) {
				const animationClass = target.hasAttribute(this.cfg.animateAttr)
					? (target.getAttribute(this.cfg.animateAttr) || this.cfg.anim.show.class)
					: null;

				this.hide(closestCollapse.id, { animationClass });
				return;
			}
			// Если коллапс не найден, просто выходим
			return;
		}
	}


	// !SECTION
	// SECTION Контроллеры

	/**
	 * Универсальный метод для показа одного коллапса, нескольких или группы
	 * @param {string|string[]} ids - ID коллапса, массив ID, имя группы или массив групп
	 * @param {Object} options - Опции (например, animationClass, callback)
	 * @returns {*} Результат выполнения
	 */
	show(ids, options = {}) {
		return this.#_executeAction('show', ids, options);
	}

	showOnly(ids, options = {}) {
		return this.#_executeAction('show', ids, { ...options, only: true });
	}

	/**
	 * Универсальный метод для скрытия одного коллапса, нескольких или группы
	 * @param {string|string[]} ids - ID коллапса, массив ID, имя группы или массив групп
	 * @param {Object} options - Опции (например, animationClass, callback)
	 * @returns {*} Результат выполнения
	 */
	hide(ids, options = {}) {
		return this.#_executeAction('hide', ids, options);
	}

	hideOnly(ids, options = {}) {
		return this.#_executeAction('hide', ids, { ...options, only: true });
	}

	/**
	 * Универсальный метод для переключения состояния одного коллапса, нескольких или группы
	 * @param {string|string[]} ids - ID коллапса, массив ID, имя группы или массив групп
	 * @param {Object} options - Опции (например, animationClass, callback)
	 * @returns {*} Результат выполнения
	 */
	toggle(ids, options = {}) {
		return this.#_executeAction('toggle', ids, options);
	}

	// !SECTION

	

	// SECTION Вспомогательные методы

	#_applyShowAnimation(element, animationClass = this.cfg.anim.show.class) {
		element.classList.add(animationClass);

		// Удаляем класс анимации через заданное время
		setTimeout(() => {
			element.classList.remove(animationClass);
		}, this.cfg.anim.show.duration);
	}

	#_shouldAnimate(animationClass) {
		return this.cfg.animation || Boolean(animationClass);
	}


	//// SECTION Экшены

	/**
	 * Универсальный метод для управления коллапсами
	 * @param {string} action - 'show', 'hide', 'toggle'
	 * @param {string|string[]} ids - ID, массив ID или группа
	 * @param {Object} options - Опции
	 * @returns {*} Результат выполнения
	 */
	#_executeAction(action, targets, options = {}) {
		const { only = false } = options;

		const input = Array.isArray(targets) ? targets : [targets];
		const ids = this.#_getIdsFromTargets(input);

		if (only) {
			const entries = this.#_filterOnlyInGroups(ids);
			const invertAction = action === 'show' ? 'hide' : action === 'hide' ? 'show' : 'toggle';

			return entries.map(({ id, invert }) =>
				this.#_setVisibilityOne(id, invert ? invertAction : action, options)
			);
		}

		return this.#_setVisibilityBatch(ids, action, options);
	}

	/**
	 * Возвращает список элементов с флагом invert для "only"-действий
	 * @param {string[]} ids - ID, указанные пользователем
	 * @returns {Array<{id: string, invert: boolean}>}
	 */
	#_filterOnlyInGroups(ids) {
		const groups = new Map();
		const result = new Set();

		// Сначала группируем входящие ID по их группам
		for (const id of ids) {
			const collapse = this.collapses.get(id);
			if (!collapse || !collapse.group) continue;
			if (!groups.has(collapse.group)) groups.set(collapse.group, []);
			groups.get(collapse.group).push(id);
		}

		// Теперь обрабатываем каждую группу отдельно
		for (const [groupName, idsToAct] of groups) {
			for (const [id, { group }] of this.collapses.entries()) {
				if (group !== groupName) continue;

				// если элемент из группы есть в списке — он будет показан
				if (idsToAct.includes(id)) {
					result.add({ id, invert: false });
				} else {
					result.add({ id, invert: true });
				}
			}
		}

		return Array.from(result);
	}



	//// !SECTION
	//// SECTION Видимость

	#_setVisibilityOne(id, action, options = {}) {
		const { animationClass = null, isHover = false } = options;
		const collapseInstance = this.collapses.get(id);
		if (!collapseInstance) return;

		const isHidden = collapseInstance.state === 0;
		const hideClass = collapseInstance.hideClass || this.cfg.hideClass;
		const actions = {
			show: () => { 
				if (!isHidden) return; 
				collapseInstance.DOM.classList.remove(hideClass); 
				if (this.#_shouldAnimate(animationClass)) this.#_applyShowAnimation(collapseInstance.DOM, animationClass || this.cfg.anim.show.class); 
				collapseInstance.state = 1; 
				this.#_updateFocusability(id, true);
			},
			hide: () => { 
				if (isHidden) return; 
				collapseInstance.DOM.classList.add(hideClass); 
				collapseInstance.DOM.classList.remove(this.cfg.anim.show.class); 
				collapseInstance.state = 0; 
				this.#_updateFocusability(id, false);
			},
			toggle: () => { const nextAction = isHidden ? 'show' : 'hide'; actions[nextAction](); }
		};
		actions[action]();
		this.#_updateSavedState(id);
		return { id, state: collapseInstance.state };
	}
	
	#_setVisibilityBatch(ids, action, options = {}) {
		const { animationClass = null } = options;

		const idsToProcess = ids.filter(id => this.collapses.has(id));

		if (idsToProcess.length === 0) return [];

		// Очищаем активные таймеры для этих элементов и выполняем отложенные действия
		this.#_clearTimeouts(idsToProcess);

		// Анимация сработает если указан animationClass или если глобальная анимация включена
		// Если указан пустой animationClass, то будет использоваться дефолтная анимация из config.animations.show.class
		// Для hide всегда без анимации и задержек

		// Для toggle: всегда без задержки, но с animationClass (если есть)
		if (action === 'toggle') {
			return idsToProcess.map(id => this.#_setVisibilityOne(id, action, options));
		}

		const useDelayAnimation = (
			(action === 'show') &&
			this.#_shouldAnimate(animationClass) &&
			idsToProcess.length <= 100
		);

		if (!useDelayAnimation) {
			idsToProcess.forEach(id => this.#_setVisibilityOne(id, action, { ...options, animationClass: null }));
		} else {
			requestAnimationFrame(() => {
				this.#_scheduleVisibilityUpdates(idsToProcess, action, options);
			});
		}

		return idsToProcess;
	}

	#_scheduleVisibilityUpdates(ids, action, options = {}) {
		const maxDuration = 500;
		const defaultDuration = 70;
		const delay = Math.min(maxDuration / ids.length, defaultDuration);
		ids.forEach((id, i) => {
			this.#_createTimeout(id, () => this.#_setVisibilityOne(id, action, options), action, options, i * delay);
		});
	}



	//// !SECTION
	//// SECTION Таймеры

	/**
	 * Создает таймер с сохранением действия для последующего выполнения
	 * @param {string} id - ID коллапса
	 * @param {Function} callback - Функция для выполнения
	 * @param {string} action - Действие ('show', 'hide', 'toggle')
	 * @param {Object} options - Опции для действия
	 * @param {number} delay - Задержка в миллисекундах
	 */
	#_createTimeout(id, callback, action, options, delay) {
		// Очищаем существующий таймер если есть
		this.#_clearTimeouts(id);

		const timeoutId = setTimeout(() => {
			callback();
			this._state.activeTimeouts.delete(id);
		}, delay);

		// Сохраняем таймер вместе с действием и опциями
		this._state.activeTimeouts.set(id, {
			timeoutId,
			action,
			options
		});
	}

	/**
	 * Очищает таймеры для массива ID или одного ID
	 * 
	 * Если передан массив, очищает таймеры для каждого ID в массиве.
	 * Если передан один ID, очищает только его таймер.
	 * 
	 * Выполняет отложенные действия по умолчанию, если executeActions = true.
	 * @param {string[]} ids - Массив ID коллапсов
	 * @param {boolean} executeActions - Выполнить ли отложенные действия (по умолчанию true)
	 */
	#_clearTimeouts(ids = null, executeActions = true) {
		const timeouts = ids === null 
			? this._state.activeTimeouts 
			: new Map([...this._state.activeTimeouts].filter(([id]) => 
				(Array.isArray(ids) ? ids : [ids]).includes(id)
			));

		timeouts.forEach(({ timeoutId, action, options }, id) => {
			clearTimeout(timeoutId);
			if (executeActions) {
				this.#_setVisibilityOne(id, action, options);
			}
			this._state.activeTimeouts.delete(id);
		});
	}


	//// !SECTION


	/**
	 * Разворачивает массив ID и групп в единый массив ID
	 * @param {string[]} array - Массив, содержащий ID и/или имена групп
	 * @returns {string[]} Массив ID коллапсов
	 */
	#_getIdsFromTargets(targets) {
		const result = new Set();
		const ids = new Set();
		const groups = new Set();

		for (const t of Array.isArray(targets) ? targets : [targets]) {
			if (this.collapses.has(t)) {
				ids.add(t);
			} else {
				groups.add(t);
			}
		}

		// Быстрое добавление ID
		for (const id of ids) result.add(id);

		// Только если есть группы — проходим по Map
		if (groups.size) {
			for (const [id, { group }] of this.collapses.entries()) {
				if (group && groups.has(group)) {
					result.add(id);
				}
			}
		}

		return Array.from(result);
	}



	// !SECTION
	// SECTION Состояния

	isShow(id) {
		const c = this.collapses.get(id); return !!c && !c.DOM.classList.contains(c.hideClass || this.cfg.hideClass);
	}

	isHide(id) {
		const c = this.collapses.get(id); return !c || c.DOM.classList.contains(c.hideClass || this.cfg.hideClass);
	}

	// !SECTION
	// SECTION Сохранение и восстановление состояния

	/**
	 * Проверяет, должен ли коллапс сохранять состояние
	 * @param {string} id - ID коллапса
	 * @returns {boolean}
	 */
	#_shouldSaveState(id) {
		const collapseInstance = this.collapses.get(id);
		if (!collapseInstance) return false;
		const attr = this.cfg.saveStateAttr;
		const el = collapseInstance.DOM;
		return el.hasAttribute(attr) || !!el.closest('[' + attr + ']');
	}

	/**
	 * Сохраняет текущее состояние всех коллапсов в localStorage
	 */
	#_saveCollapseState() {
		try {
			const stateToSave = {};
			for (const [id, c] of this.collapses) if (this.#_shouldSaveState(id)) stateToSave[id] = !c.DOM.classList.contains(c.hideClass || this.cfg.hideClass);
			localStorage.setItem(this.cfg.storageKey, JSON.stringify(stateToSave));
		} catch (e) { console.warn('[CollapseManager] ошибка localStorage:', e); }
	}

	/**
	 * Восстанавливает состояние коллапсов из localStorage
	 */
	#_restoreCollapseState() {
		try {
			const savedState = localStorage.getItem(this.cfg.storageKey);
			if (!savedState) return;

			const state = JSON.parse(savedState);

			Object.entries(state).forEach(([id, isVisible]) => {
				const collapseInstance = this.collapses.get(id);
				if (collapseInstance && this.#_shouldSaveState(id)) {
					if (isVisible) {
						this.#_setVisibilityOne(id, 'show', { animationClass: null });
					} else {
						this.#_setVisibilityOne(id, 'hide', { animationClass: null });
					}
				}
			});
		} catch (e) {
			console.warn('[CollapseManager] Ошибка localStorage:', e);
		}
	}

	/**
	 * Обновляет сохраненное состояние после изменения коллапса
	 * @param {string} id - ID коллапса
	 */
	#_updateSavedState(id) {
		if (this.#_shouldSaveState(id)) {
			this._saveStateDebounced();
		}
	}

	/**
	 * Очищает сохраненное состояние из localStorage
	 */
	#_clearSavedState() {
		try {
			localStorage.removeItem(this.cfg.storageKey);
			return true;
		} catch (e) {
			return "Ошибка localStorage";
		}
	}

	// !SECTION
	// SECTION Управление фокусом

	/**
	 * Управляет возможностью фокусировки коллапса и его содержимого
	 * @param {string} id - ID коллапса
	 * @param {boolean} isFocusable - Включить или отключить фокусировку
	 */
	#_updateFocusability(id, isFocusable) {
		const collapse = this.collapses.get(id);
		const origAttr = 'data-orig-tabindex';

		if (!collapse) return;
		collapse.DOM.querySelectorAll(
			'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'
		).forEach(el => {
			if (isFocusable) {
				const orig = el.getAttribute(origAttr) || '';
				el.toggleAttribute('tabindex', orig !== '');
				el.removeAttribute(origAttr);
			} else {
				if (!el.hasAttribute(origAttr)) {
					el.setAttribute(origAttr, el.getAttribute('tabindex') || '');
				}
				el.setAttribute('tabindex', '-1');
			}
		});
	}



	// !SECTION
	// SECTION destroy()

	destroy() {
		// Сохраняем состояние перед уничтожением
		this.#_saveCollapseState();
		
		// Восстанавливаем оригинальные tabindex для всех коллапсов
		for (const [id] of this.collapses) {
			this.#_updateFocusability(id, true);
		}
		
		this.#_removeGlobalClickListener();
		this.#_removeMouseAndFocusListeners();

		// Очищаем все активные таймеры и выполняем отложенные действия
		this.#_clearTimeouts();
		
		this.collapses.clear();
		
		this._state = {};
		
		// Очищаем ссылку на singleton
		CollapseManager._instance = null;
		
		return "CollapseManager выключен";
	}

	// !SECTION

}

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}
