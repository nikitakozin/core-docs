/**
 * PopupManager
 *
 * Описание
 * --------
 * PopupManager управляет всплывающими окнами (popups) на странице: регистрирует
 * элементы, открывает/закрывает их по триггерам, изолирует фокус внутри popup,
 * поддерживает стек открытых окон и интеграцию с историей браузера (popstate/hash).
 * Класс реализован как singleton — повторный вызов new вернёт тот же экземпляр,
 * а экземпляр будет доступен как window.PopupManager.
 *
 * HTML-разметка (основы)
 * ---------------------
 * - Пометьте элемент попапа атрибутом data-popup и дайте ему уникальный id:
 *
 * <div id="login" data-popup class="core-popup">
 *   <div class="core-popup-overlay"></div>
 *   <div class="core-popup__content"> ... </div>
 *   <button data-popup-close="login">Закрыть</button>
 * </div>
 *
 * - Один DOM-попап может иметь несколько hash-псевдонимов:
 * <div id="account" data-popup="profile,cart,wish"> ... </div>
 * Хеш `#cart#delivery` в таком случае открывает сначала `account` с hash `cart`,
 * затем обычный popup `delivery`.
 *
 * - Триггеры для открытия/закрытия/переключения могут выглядеть так:
 * <button data-popup-trigger="login">Открыть</button>
 * <button data-popup-toggle="login">Тоггл</button>
 * <button data-popup-close="login">Закрыть</button>
 *
 * Основные опции конфигурации (по умолчанию)
 * -----------------------------------------
 * При создании new PopupManager(options) можно передать настройки, по умолчанию:
 * {
 *   popupAttr: 'data-popup',
 *   silentAttr: 'data-popup-silent', // не обновлять историю
 *   requiredAttr: 'data-popup-req', // нельзя закрыть кликом вне/через back/esc
 *   triggerAttr: 'data-popup-trigger',
 *   closeAttr: 'data-popup-close',
 *   toggleAttr: 'data-popup-toggle',
 *   openedClass: '.opened', // CSS-класс, добавляемый при открытии (строка с точкой)
 *   popupSelector: '.core-popup',
 *   overlaySelector: '.core-popup-overlay'
 * }
 *
 * Поведение и особенности
 * ------------------------
 * - При open(target) менеджер:
 *   - добавляет класс opened к DOM-элементу;
 *   - сохраняет элемент, откуда пришёл фокус, чтобы восстановить его при закрытии;
 *   - изолирует фокус внутри popup (trap focus);
 *   - блокирует прокрутку страницы (document.body.style.overflow = 'hidden');
 *   - ставит z-index по стеку открытых окон;
 *   - обновляет историю браузера (pushState с хешем), если popup не помечен как silent;
 *   - подключает слушатели Esc, локальных кликов и beforeunload для required-попапов.
 *
 * - При close(target) менеджер удаляет класс opened, снимает изоляцию фокуса,
 *   восстанавливает скролл и фокус на источнике, обновляет историю при необходимости.
 * - Закрытые popup и открытые popup под верхним элементом стека получают inert.
 *   Поэтому их содержимое недоступно для Tab, включая динамически добавленные элементы.
 * - Клик по оверлею (элемент по селектору cfg.overlaySelector) закрывает popup,
 *   если он не помечен required (cfg.requiredAttr).
 * - Esc закрывает верхний popup в стеке, если он не required.
 * - Попапы поддерживают стек (несколько открытых одновременно) и корректное z-index
 *   управление (1000 + позиция в стеке).
 * - История браузера: PopupManager хранит весь стек в history.state и в hash
 *   (`#cart#delivery#address`) и восстанавливает его при загрузке и popstate.
 * - При активации hash попап отправляет всплывающее событие `popup:activate` с
 *   detail `{ id, hash }`. Библиотека не управляет содержимым.
 *
 * Публичные методы
 * -----------------
 * - autoInit(): сканирует DOM и регистрирует все элементы с cfg.popupAttr,
 *   восстанавливает цепочку попапов из hash URL.
 * - registerPopup(id): регистрирует конкретный DOM-элемент как попап.
 * - open(target, updateHistory = true): открывает попап по ID или hash-псевдониму.
 * - close(target, updateHistory = true): закрывает попап по ID или hash-псевдониму.
 * - toggle(target, updateHistory = true): переключает попап по ID или hash-псевдониму.
 * - closeAll(): закрывает все открытые попапы без изменения истории.
 * - destroy(): удаляет глобальные слушатели и очищает внутренние данные.
 *
 * События/Интеграция
 * ------------------
 * - `popup:activate` всплывает от DOM-попапа при открытии или смене его активного
 *   hash-псевдонима. Обработчик получает `event.detail.id` и `event.detail.hash`.
 *
 * Примеры
 * -------
 * // Инициализация (обычно автоматически при создании)
 * const pm = new PopupManager();
 *
 * // Программное открытие
 * pm.open('login');
 *
 * // Триггер в разметке
 * <button data-popup-trigger="login">Открыть логин</button>
 *
 * // Обязательный popup (нельзя закрыть кликом вне или нажатием ESC)
 * <div id="terms" data-popup data-popup-req> ... </div>
 *
 * Полезные рекомендации
 * ---------------------
 * - Стили: добавьте визуальные правила для класса, указанного в cfg.openedClass (без точки
 *   в CSS пишите .opened). Также добавьте стили для overlay (cfg.overlaySelector).
 * - Тестируйте поведение history + popstate, если ваше приложение активно использует
 *   маршрутизацию — возможно, потребуется интеграция с системой маршрутов.
 */
export default class PopupManager {

	// SECTION constructor()
	/**
	 * Конструктор класса PopupManager.
	 *
	 * Создаёт новый экземпляр PopupManager или возвращает уже существующий (реализация Singleton).
	 * Инициализирует коллекцию попапов, стеки открытых окон и фокуса, а также состояние и обработчики событий.
	 */
	constructor(options = {}) {
		if (PopupManager._instance) return PopupManager._instance;

		this.cfg = Object.assign({
			popupAttr: 'data-popup',
			silentAttr: 'data-popup-silent',
			requiredAttr: 'data-popup-req',
			triggerAttr: 'data-popup-trigger',
			closeAttr: 'data-popup-close',
			toggleAttr: 'data-popup-toggle',
			changeAttr: 'data-popup-change',
			openedClass: '.opened',
			popupSelector: '.core-popup',
			overlaySelector: '.core-popup-overlay'
		}, options);

		this.popups = new Map();
		this._hashToPopup = new Map();
		this._activeHashes = new Map();
		this._openedStack = [];
		this._sourceFocusStack = [];
		this._state = {};

		this._scrollTimeout = null;
		this._activeTrap = null;

		this._handlers = {
			esc: this.#_handleEsc.bind(this),
			popState: this.#_handlePopState.bind(this),
			globalClick: this.#_handleGlobalClick.bind(this),
			localClick: this.#_handleLocalClick.bind(this),
			beforeUnload: this.#_handleBeforeUnload.bind(this),
		};

		// Инициализируем PopupManager
		this.autoInit();

		PopupManager._instance = this;
		window.PopupManager = PopupManager._instance; // Для глобального доступа к экземпляру
	}



	// !SECTION
	// SECTION Регистрация

	/**
	 * Инициализирует элементы попапов на странице, сканируя элементы с атрибутом `[data-popup]`,
	 * регистрирует их и восстанавливает цепочку попапов из hash URL.
	 * Также настраивает глобальные обработчики событий click и popstate для управления попапами.
	 *
	 * @returns {string} Сообщение с количеством инициализированных попапов.
	 */
	autoInit() {
		document.querySelectorAll('[' + this.cfg.popupAttr + ']').forEach(popupDOM => {
			const id = popupDOM.id;
			if (id) this.registerPopup(id);
		});
		const initialTargets = this.#_parseHash();
		if (initialTargets.length) {
			requestAnimationFrame(() => {
				this.#_synchronizeStack(initialTargets);
				this.#_replaceHistory();
			});
		}

		this.#_initGlobalClickListener();
		this.#_initPopStateListener();

		return "Новых попапов: " + this.popups.size;
	}

	refresh() {
		this.autoInit();
	}

	/**
	 * Регистрирует всплывающее окно (popup) по заданному идентификатору.
	 * Инициализирует необходимые глобальные слушатели и элементы управления для popup.
	 *
	 * @param {string} id - Идентификатор всплывающего окна.
	 * @returns {string} Сообщение о успешной регистрации popup с указанным идентификатором.
	 * @throws {Error} Если элемент popup с заданным идентификатором не найден.
	 */
	registerPopup(id) {
		const popupDOM = document.querySelector('[' + this.cfg.popupAttr + ']#' + id);
		if (!popupDOM) throw new Error('DOM попапа "' + id + '" не найден');

		this.#_initGlobalClickListener();
		this.#_initPopStateListener();

		const hashValue = popupDOM.getAttribute(this.cfg.popupAttr)?.trim() || '';
		const silent = popupDOM.hasAttribute(this.cfg.silentAttr);
		const declaredHashes = hashValue
			? hashValue.split(',').map(hash => hash.trim()).filter(Boolean)
			: [];
		if (declaredHashes.length && silent) {
			throw new Error(`Popup "${id}" не может одновременно иметь hash-псевдонимы и ${this.cfg.silentAttr}`);
		}
		const hashes = [...new Set(declaredHashes.length ? declaredHashes : [id])];
		for (const hash of hashes) {
			const registeredId = this._hashToPopup.get(hash);
			if (registeredId && registeredId !== id) {
				throw new Error(`Hash popup "${hash}" уже зарегистрирован для "${registeredId}"`);
			}
		}

		const previousPopup = this.popups.get(id);
		previousPopup?.hashes.forEach(hash => {
			if (this._hashToPopup.get(hash) === id) this._hashToPopup.delete(hash);
		});
		for (const hash of hashes) {
			this._hashToPopup.set(hash, id);
		}

		this.popups.set(id, {
			DOM: popupDOM,
			hashes,
			silent,
			required: popupDOM.hasAttribute(this.cfg.requiredAttr),
		});
		this.#_syncPopupInteractivity();

		return "Новый попап " + id;
	}



	// !SECTION
	// SECTION Обработчики событий

		//// SECTION Before unload

		#_initBeforeUnloadListener() {
			window.addEventListener('beforeunload', this._handlers.beforeUnload);
		}

		#_removeBeforeUnloadListener() {
			window.removeEventListener('beforeunload', this._handlers.beforeUnload);
		}

		/**
		 * Обрабатывает событие beforeunload для предотвращения закрытия страницы,
		 * если открыт обязательный всплывающий элемент.
		 *
		 * @param {Event} e - Событие beforeunload.
		 * @returns {string|undefined} Возвращает пустую строку для отображения предупреждения пользователю,
		 * если открыт обязательный попап, иначе ничего не возвращает.
		 */
		#_handleBeforeUnload(e) {
			if (this.#_hasRequiredPopupOpen()) {
				e.preventDefault();
				e.returnValue = '';
				return '';
			}
		}



		// !SECTION
		// SECTION Escape

		// Глобальные слушатели для Escape
		#_initEscListener() {
			document.addEventListener('keydown', this._handlers.esc);
		}

		#_removeEscListener() {
			document.removeEventListener('keydown', this._handlers.esc);
		}

		/**
		 * Обрабатывает нажатие клавиши Escape.
		 * Если в стеке открытых попапов есть элементы, закрывает последний,
		 * если он не является обязательным для закрытия.
		 *
		 * @param {KeyboardEvent} e - Событие нажатия клавиши.
		 */
		#_handleEsc(e) {
			if (e.key === 'Escape' && this._openedStack.length) {
				// Получаем последний элемент из стека
				const lastPopupId = this._openedStack[this._openedStack.length - 1];
				const popupInstance = this.popups.get(lastPopupId);
				if (popupInstance && !popupInstance.required) {
					this.close(lastPopupId, true);
				}
			}
		}



		//// !SECTION
		//// SECTION Popstate

		// Глобальные слушатели для popstate (история браузера)
		#_initPopStateListener() {
			if (!this._state._popStateListenerInitialized) {
				window.addEventListener('popstate', this._handlers.popState);
				this._state._popStateListenerInitialized = true;
			}
		}

		#_removePopStateListener() {
			window.removeEventListener('popstate', this._handlers.popState);
		}

		/**
		 * Обрабатывает событие popstate для управления состоянием открытых попапов.
		 *
		 * Восстанавливает стек открытых попапов из полной цепочки в hash URL.
		 * Закрывает попапы, которые больше не должны быть открыты, и открывает те, которые должны быть видимы.
		 */
		#_handlePopState() {
			this.#_synchronizeStack(this.#_parseHash());
		}



		//// !SECTION
		//// SECTION Global click

		// Слушатели кликов по всему документу
		#_initGlobalClickListener() {
			if (!this._state._globalListenersInit) {
				document.addEventListener('click', this._handlers.globalClick);
				this._state._globalListenersInit = true;
			}
		}

		#_removeGlobalClickListener() {
			document.removeEventListener('click', this._handlers.globalClick);
		}

		/**
		 * Обрабатывает глобальные клики по элементам, связанным с попапами.
		 *
		 * В зависимости от атрибута на целевом элементе (data-popup-trigger, data-popup-close, data-popup-toggle)
		 * вызывает соответствующий метод для открытия, закрытия или переключения состояния попапа.
		 *
		 * @param {MouseEvent} e - Событие клика мыши.
		 */
		#_handleGlobalClick(e) {
			// Проверяем целевой элемент и его родителей на наличие управляющих атрибутов
			const attrs = [
				this.cfg.triggerAttr,
				this.cfg.closeAttr,
				this.cfg.toggleAttr,
				this.cfg.changeAttr,
			];

			let el = e.target;
			let foundAttr = null;
			let id = null;

			while (el && el !== document) {
				for (const attr of attrs) {
					if (el.hasAttribute(attr)) {
						foundAttr = attr;
						id = el.getAttribute(attr);
						break;
					}
				}
				if (foundAttr) break;
				el = el.parentElement;
			}

			if (foundAttr === this.cfg.triggerAttr) {
				this.open(id);
			} else if (foundAttr === this.cfg.closeAttr) {
				this.close(id);
			} else if (foundAttr === this.cfg.toggleAttr) {
				this.toggle(id);
			} else if (foundAttr === this.cfg.changeAttr) {
				this.change(id);
			}
		}



		//// !SECTION
		//// SECTION Local click (в пределах попапа)

		// Слушатели кликов в пределах попапа
		#_initLocalClickListener(popupDOM) {
			popupDOM.addEventListener('click', this._handlers.localClick);
		}

		#_removeLocalClickListener(popupDOM) {
			popupDOM.removeEventListener('click', this._handlers.localClick);
		}

		/**
		 * Обрабатывает локальные клики внутри всплывающего окна.
		 * Закрывает попап, если клик был по элементу с атрибутом [data-popup-close]
		 * или по оверлею с классом .core-popup-overlay (если не установлен атрибут data-popup-req).
		 *
		 * @param {MouseEvent} e - Событие клика.
		 */
		#_handleLocalClick(e) {
			const popupDOM = e.currentTarget;
			const id = popupDOM.id;

			if (e.target.matches('[' + this.cfg.closeAttr + ']')) {
				this.close(id);
			} else if (
				e.target.matches(this.cfg.overlaySelector) &&
				!popupDOM.hasAttribute(this.cfg.requiredAttr)
			) {
				this.close(id);
			}
		}


		//// !SECTION



	// !SECTION
	// SECTION Взаимодействие с попапами

	/**
	 * Открывает попап с заданным идентификатором.
	 *
	 * @param {string} target - ID попапа или один из его hash-псевдонимов.
	 * @param {boolean} [updateHistory=true] - Нужно ли обновлять историю браузера при открытии попапа.
	 *
	 * Метод выполняет следующие действия:
	 * - Снимает фокус с других открытых попапов.
	 * - Добавляет элемент с которого был открыт попап в стек фокуса.
	 * - Добавляет класс "opened" к элементу попапа.
	 * - Обновляет стек открытых попапов.
	 * - Устанавливает z-index для корректного отображения поверх других попапов.
	 * - Отключает прокрутку страницы.
	 * - Добавляет запись в историю браузера (если не установлен флаг silent).
	 * - Настраивает и изолирует фокус внутри попапа.
	 * - Включает обработчики событий для клавиши Esc, клика внутри попапа и обновления страницы (если требуется).
	 */
	open(target, updateHistory = true) {
		const resolved = this.#_resolveTarget(target);
		if (!resolved) return;

		const { id, hash } = resolved;
		const popupInstance = this.popups.get(id);
		const wasOpen = popupInstance.DOM.classList.contains(this.cfg.openedClass.substring(1));
		if (wasOpen) {
			if (this._activeHashes.get(id) === hash) return;
			this._activeHashes.set(id, hash);
			this.#_emitActivate(id, hash);
			if (updateHistory && !popupInstance.silent) this.#_updateHistory();
			return;
		}

		// Сначала снимаем фокус с другого активного попапа.
		this.#_releaseFocus();

		this._sourceFocusStack.push(document.activeElement);
		this._activeHashes.set(id, hash);
		popupInstance.DOM.classList.add(this.cfg.openedClass.substring(1));

		if (!this._openedStack.includes(id)) {
			this._openedStack.push(id);
		}

		// Разрешаем фокус только в верхнем попапе стека
		this.#_syncPopupInteractivity();

		// Показываем попап поверх других попапов
		this.#_setZIndex(popupInstance.DOM, this._openedStack.length);

		// Выключаем скролл страницы
		clearTimeout(this._scrollTimeout);
		document.body.style.overflow = 'hidden';

		// Синхронно сообщаем проекту, какой hash активировал попап.
		this.#_emitActivate(id, hash);

		// Добавляем запись в историю браузера
		if (updateHistory && !popupInstance.silent) this.#_updateHistory();

		// Изолируем фокус внутри попапа
		this.#_trapFocus(id);

		// Включаем слушатель Esc
		this.#_initEscListener();

		// Включаем слушатель клика внутри попапа
		this.#_initLocalClickListener(popupInstance.DOM);

		// Предупреждаем о выгрузке страницы, пока открыт required-попап.
		if (popupInstance.required) { this.#_initBeforeUnloadListener()}

	}

	/**
	 * Закрывает попап с указанным идентификатором.
	 *
	 * @param {string} target - ID попапа или один из его hash-псевдонимов.
	 * @param {boolean} [updateHistory=true] - Нужно ли обновлять историю браузера при закрытии попапа.
	 *
	 * Выполняет следующие действия:
	 * - Удаляет класс "opened" у попапа.
	 * - Снимает изоляцию фокуса с попапа.
	 * - Удаляет слушатели событий, связанные с попапом.
	 * - Обновляет стек открытых попапов и z-index.
	 * - Восстанавливает скролл страницы, если больше нет открытых попапов.
	 * - Обновляет историю браузера, если это необходимо.
	 * - Возвращает фокус на элемент, из которого был открыт попап, либо фокусирует верхний открытый попап.
	 */
	close(target, updateHistory = true) {

		const resolved = this.#_resolveTarget(target);
		if (!resolved) return;
		const { id } = resolved;
		const popupInstance = this.popups.get(id);
		if (!popupInstance || !popupInstance.DOM.classList.contains(this.cfg.openedClass.substring(1))) return;
		popupInstance.DOM.classList.remove(this.cfg.openedClass.substring(1));

		// Снимаем изоляцию фокуса с попапа
		this.#_releaseFocus();

		// Удаляем слушатель beforeunload, если попап является обязательным
		if (popupInstance.required) { this.#_removeBeforeUnloadListener() }

		// Удаляем слушатель клика конкретного попапа
		this.#_removeLocalClickListener(popupInstance.DOM);

		// Обновляем z-stack
		const indexInStack = this._openedStack.indexOf(id);
		if (indexInStack > -1) {
			this._openedStack.splice(indexInStack, 1);
		}
		this._activeHashes.delete(id);
		this.#_setZIndex(popupInstance.DOM, 0);

		// Блокируем закрытый попап и возвращаем доступность верхнему попапу стека
		this.#_syncPopupInteractivity();

		// Удаляем глобальный Esc, если больше нет открытых попапов
		if (this._openedStack.length === 0) { this.#_removeEscListener() }

		// Восстанавливаем скролл страницы
		if (!this._openedStack.length) {
			clearTimeout(this._scrollTimeout);

			this._scrollTimeout = setTimeout(() => {
				document.body.style.overflow = '';
			}, 170);
		}

		// Обновляем историю браузера
		if (updateHistory && !popupInstance.silent) {
			this.#_updateHistory();
		}

		// Возвращаем фокус на элемент из которого был открыт попап
		// Если есть еще открытые попапы, то фокусируем на верхнем попапе
		const lastFocused = this._sourceFocusStack.pop();
		if (this._openedStack.length === 0) {
			if (lastFocused && document.contains(lastFocused)) {
				lastFocused.focus();
			}
		} else {
			this.#_trapFocus(this._openedStack[this._openedStack.length - 1]);
		}
	}

	/**
	 * Переключает состояние попапа с указанным идентификатором между открытым и закрытым.
	 *
	 * @param {string} id - Идентификатор попапа, который необходимо переключить.
	 * @param {boolean} [updateHistory=true] - Нужно ли обновлять историю при переключении состояния.
	 */
	toggle(target, updateHistory = true) {
		const resolved = this.#_resolveTarget(target);
		if (!resolved) return;
		const popupInstance = this.popups.get(resolved.id);
		popupInstance.DOM.classList.contains('opened')
			? this.close(resolved.id, updateHistory)
			: this.open(target, updateHistory);
	}

	change(target) {
		const resolved = this.#_resolveTarget(target);
		if (!resolved) return;
		const { id } = resolved;
		const newPopup = this.popups.get(id);
		if (!newPopup) return;

		const currentId = this._openedStack[this._openedStack.length - 1];
		if (!currentId || currentId === id) return;

		const currentPopup = this.popups.get(currentId);
		if (!currentPopup) return;

		const currentDOM = currentPopup.DOM;
		const newDOM = newPopup.DOM;

		const disableTransition = (dom) => {
			const overlay = dom.querySelector(this.cfg.overlaySelector);
			const popup = dom.querySelector(this.cfg.popupSelector);

			dom.style.transition = 'none';
			if (overlay) overlay.style.transition = 'none';
			if (popup) popup.style.transition = 'none';

			return { overlay, popup };
		};

		// --- отключаем у обоих ---
		const currentParts = disableTransition(currentDOM);
		const newParts = disableTransition(newDOM);

		// --- мгновенно переключаем ---
		this.close(currentId, false);
		this.open(target, false);

		this.#_replaceHistory();

		requestAnimationFrame(() => {
			const restore = (dom, parts) => {
				dom.style.transition = '';
				if (parts.overlay) parts.overlay.style.transition = '';
				if (parts.popup) parts.popup.style.transition = '';
			};

			restore(currentDOM, currentParts);
			restore(newDOM, newParts);
		});
	}

	/**
	 * Закрывает все открытые элементы, перебирая их идентификаторы в стеке открытых элементов.
	 * Для каждого элемента вызывает метод close с передачей идентификатора и флагом false.
	 */
	closeAll() {
		while (this._openedStack.length) this.close(this._openedStack.at(-1), false);
	}

	#_resolveTarget(target) {
		if (typeof target !== 'string' || !target) return null;

		const idFromHash = this._hashToPopup.get(target);
		if (idFromHash) return { id: idFromHash, hash: target };

		const popupInstance = this.popups.get(target);
		if (!popupInstance) return null;

		return {
			id: target,
			hash: this._activeHashes.get(target) || popupInstance.hashes[0],
		};
	}

	#_emitActivate(id, hash) {
		const popupInstance = this.popups.get(id);
		popupInstance.DOM.dispatchEvent(new window.CustomEvent('popup:activate', {
			bubbles: true,
			detail: { id, hash },
		}));
	}

	/**
	 * Приводит открытый стек к цепочке из URL, сохраняя общий нижний уровень.
	 * Закрытие выполняется сверху вниз, затем недостающие попапы открываются
	 * в порядке, записанном в hash.
	 *
	 * @param {{ id: string, hash: string }[]} targets
	 */
	#_synchronizeStack(targets) {
		let commonLength = 0;
		while (
			commonLength < this._openedStack.length &&
			commonLength < targets.length &&
			this._openedStack[commonLength] === targets[commonLength].id
		) {
			commonLength += 1;
		}

		for (let index = this._openedStack.length - 1; index >= commonLength; index -= 1) {
			this.close(this._openedStack[index], false);
		}
		for (let index = 0; index < commonLength; index += 1) {
			const target = targets[index];
			if (this._activeHashes.get(target.id) === target.hash) continue;
			this._activeHashes.set(target.id, target.hash);
			this.#_emitActivate(target.id, target.hash);
		}
		targets.slice(commonLength).forEach(target => this.open(target.hash, false));
	}



	// !SECTION
	// SECTION Управление фокусом

	/**
	 * Ограничивает фокусировку внутри попапа с указанным идентификатором.
	 * Перехватывает нажатия клавиши Tab, чтобы фокус не выходил за пределы попапа.
	 * Если попап не найден или в нем нет фокусируемых элементов, метод ничего не делает.
	 *
	 * @param {string} id - Идентификатор попапа, для которого нужно ограничить фокусировку.
	 */
	#_trapFocus(id) {
		if (this._activeTrap) {
			this._activeTrap.destroy();
			this._activeTrap = null;
		}

		const popupInstance = this.popups.get(id);
		if (!popupInstance) return;

		const container = popupInstance.DOM;

		// Контейнер без интерактивных элементов должен оставаться доступным для фокуса.
		requestAnimationFrame(() => {
			const focusable = this.#_getFocusableElements(container);
			if (!focusable.length) container.setAttribute('tabindex', '-1');
		});

		const handleTab = (e) => {
			if (e.key !== 'Tab') return;

			const focusableElements = this.#_getFocusableElements(container);
			if (!focusableElements.length) return;

			const firstEl = focusableElements[0];
			const lastEl = focusableElements[focusableElements.length - 1];
			const active = document.activeElement;

			// Если фокус вне попапа — возвращаем внутрь
			if (!container.contains(active)) {
				e.preventDefault();
				firstEl.focus();
				return;
			}

			if (e.shiftKey) {
				if (active === firstEl) {
					e.preventDefault();
					lastEl.focus();
				}
			} else {
				if (active === lastEl) {
					e.preventDefault();
					firstEl.focus();
				}
			}
		};

		const enforceFocus = (e) => {
			if (!document.body.contains(container)) return;

			const active = document.activeElement;
			if (!container.contains(active)) {
				const focusable = this.#_getFocusableElements(container);
				if (focusable.length) {
					focusable[0].focus();
				} else {
					container.setAttribute('tabindex', '-1');
					container.focus();
				}
			}
		};

		// Сохраняем объект trap для возможности destroy
		this._activeTrap = {
			activate() {
				document.addEventListener('keydown', handleTab);
				document.addEventListener('focusin', enforceFocus);
			},
			destroy() {
				document.removeEventListener('keydown', handleTab);
				document.removeEventListener('focusin', enforceFocus);
			}
		};

		this._activeTrap.activate();
	}

	/**
	 * Снимает активную изоляцию фокуса.
	 * Удаляет глобальные обработчики клавиатуры и focusin.
	 */
	#_releaseFocus() {
		if (this._activeTrap) {
			this._activeTrap.destroy();
			this._activeTrap = null;
		}
	}


	/**
	 * Оставляет интерактивным только верхний открытый popup.
	 * inert применяется ко всему поддереву и автоматически охватывает
	 * элементы, которые были добавлены после инициализации.
	 */
	#_syncPopupInteractivity() {
		const topPopupId = this._openedStack.at(-1);

		this.popups.forEach((popupInstance, id) => {
			popupInstance.DOM.toggleAttribute('inert', id !== topPopupId);
		});
	}

	#_getFocusableElements(container) {
		const selectors = [
			'a[href]', 'area[href]', 'input:not([disabled]):not([type="hidden"])',
			'select:not([disabled])', 'textarea:not([disabled])',
			'button:not([disabled])', 'iframe', 'object', 'embed',
			'[tabindex]:not([tabindex="-1"])', '[contenteditable], video'
		];
		return Array.from(container.querySelectorAll(selectors.join(',')))
			.filter(el => !el.closest('[inert]'));
	}



	// !SECTION
	// SECTION Управление историей браузера

	/**
	 * Обновляет состояние истории браузера для управления открытыми popup-окнами.
	 *
	 * URL всегда строится по фактически открытому стеку, а не по предыдущему
	 * history.state, поэтому состояние корректно и после восстановления из hash.
	 */
	#_updateHistory() {
		const popups = Array.isArray(history.state?.popups) ? history.state.popups : [];
		const updatedPopups = this.#_getSerializableStack();
		const hash = this.#_serializeHash(updatedPopups);

		if (
			JSON.stringify(popups) !== JSON.stringify(updatedPopups) ||
			window.location.hash !== hash
		) {
			this.#_writeHistory('pushState', updatedPopups, hash);
		}
	}

	/**
	 * Заменяет текущую запись истории актуальным стеком попапов.
	 */
	#_replaceHistory() {
		const popups = this.#_getSerializableStack();
		const hash = this.#_serializeHash(popups);
		const currentPopups = Array.isArray(history.state?.popups) ? history.state.popups : [];
		if (
			JSON.stringify(currentPopups) === JSON.stringify(popups) &&
			window.location.hash === hash
		) return;

		this.#_writeHistory('replaceState', popups, hash);
	}

	#_writeHistory(method, popups, hash) {
		const currentState = history.state && typeof history.state === 'object'
			? history.state
			: {};
		const url = hash || window.location.pathname + window.location.search;
		history[method]({ ...currentState, popups }, '', url);
	}

	/**
	 * Возвращает открытые попапы, которые разрешено отражать в истории.
	 */
	#_getSerializableStack() {
		return this._openedStack
			.filter(id => !this.popups.get(id).silent)
			.map(id => this._activeHashes.get(id) || this.popups.get(id).hashes[0]);
	}

	/**
	 * Преобразует стек в hash вида #cart#delivery#address.
	 */
	#_serializeHash(popupIds) {
		return popupIds.length
			? `#${popupIds.map(id => encodeURIComponent(id)).join('#')}`
			: '';
	}

	/**
	 * Читает цепочку из hash. Неизвестные и повторяющиеся ID игнорируются.
	 */
	#_parseHash() {
		const seenPopups = new Set();

		return window.location.hash
			.slice(1)
			.split('#')
			.map(part => {
				try {
					return decodeURIComponent(part);
				} catch {
					return '';
				}
			})
			.map(hash => ({ hash, id: this._hashToPopup.get(hash) }))
			.filter(target => {
				if (!target.hash || !target.id || seenPopups.has(target.id)) return false;
				seenPopups.add(target.id);
				return true;
			});
	}

	/**
	 * Устанавливает значение z-index для указанного элемента на основе длины стека.
	 *
	 * @param {HTMLElement} popupDOM - DOM-элемент, для которого устанавливается z-index.
	 * @param {number} stackLength - Текущее количество элементов в стеке, используется для вычисления z-index.
	 */
	#_setZIndex(popupDOM, stackLength) {
		const newZIndex = 1000 + stackLength;
		if (popupDOM.style.zIndex !== newZIndex.toString()) {
			popupDOM.style.zIndex = newZIndex;
		}
	}



	// !SECTION
	// SECTION Иные методы

	/**
	 * Проверяет, открыт ли хотя бы один обязательный (required) попап.
	 *
	 * Проходит по всем открытым попапам в стеке и возвращает true,
	 * если найден хотя бы один попап с флагом required.
	 *
	 * @returns {boolean} true, если открыт хотя бы один обязательный попап, иначе false.
	 */
	#_hasRequiredPopupOpen() {
		for (const id of this._openedStack) {
			const popupInstance = this.popups.get(id);
			if (popupInstance && popupInstance.required) return true;
		}
		return false;
	}



	// !SECTION
	// SECTION destroy()

	/**
	 * Отключает PopupManager, удаляя все глобальные слушатели событий,
	 * закрывая все открытые всплывающие окна и очищая внутренние стеки состояния.
	 * @returns {string} Строка, подтверждающая отключение PopupManager.
	 */
	destroy() {
		this.#_removeGlobalClickListener();
		this.#_removePopStateListener();
		this.closeAll();
		this.popups.clear();
		this._hashToPopup.clear();
		this._activeHashes.clear();
		this._openedStack = [];
		this._sourceFocusStack = [];
		this._state = {};
		return "PopupManager выключен";
	}

	// !SECTION
}
