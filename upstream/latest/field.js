/**
 * Менеджер для управелния поведением полей.
 * Устанавливает слушатель на клик по документу и затем проверяет, попал ли клик на элемент с data-field-type. Если да, то вызывает соответствующий обработчик.
 * 
 * Зарегистрировать можно любой тип поля data-field-type="customType" и назначить ему свой обработчик.
 * 
 * Можно создать или перенастроить обработчики по умолчанию через registerHendler
 *
 * @class
 *
 * @example
 * const manager = new FieldManager();
 * manager.registerHendler('anotherType', (el, event) => { ... });
 *
 */
export default class FieldManager {
	// SECTION: constructor()
	constructor(options = {}) {
		// Устанавливаем обработчики по умолчанию
		this.handlers = this.setDefaultHandlers();

		this.config = Object.assign({
			fieldAttr: 'data-field-type',
			fieldNumAttrs: {
				zeroClear: 'data-field-num-zero-clear',
				minus: 'data-field-num-minus',
				minus10x: 'data-field-num-minus-10x',
				plus: 'data-field-num-plus',
				plus10x: 'data-field-num-plus-10x',
			},
			fieldAttrs: {
				value: 'data-field-value',
				copy: 'data-field-copy',
			},
			fieldTooltip: {
				class: 'core-tooltip-visible',
				attr: 'data-tooltip',
				bottomClass: 'data-tooltip-bottom',
				topClass: 'data-tooltip-top',
				leftClass: 'data-tooltip-left',
				rightClass: 'data-tooltip-right',
			},
		}, options);

		this._handleGlobalClick = this._handleGlobalClick.bind(this);

		// Регистрируем глобальный обработчик кликов
		document.addEventListener('click', this._handleGlobalClick);
	}



	// !SECTION
	// SECTION: Регистрация обработчиков

	/**
	 * Регистрирует или переопределяет обработчик для типа элемента
	 * @param {string} type - Тип элемента (например, data-field-type)
	 * @param {Function} handler - Функция обработки (element, event)
	 */
	registerHendler(type, handler) {
		this.handlers.set(type, handler);
	}



	/**
	 * Глобальный обработчик кликов
	 * Ищет ближайший элемент с атрибутом data-field-type
	 * и вызывает соответствующий обработчик
	 * @param {MouseEvent} e
	 */
	_handleGlobalClick(e) {
		// Ищем ближайший элемент с атрибутом data-field-type
		const el = e.target.closest(`[${this.config.fieldAttr}]`);
		if (!el) return;

		const type = el.getAttribute(this.config.fieldAttr);
		const handler = this.handlers.get(type);
		if (handler) {
			handler(el, e);
		}
	}



	// !SECTION
	// SECTION: По умолчанию

	/**
	 * Устанавливает обработчики по умолчанию
	 * Например, для полей "search", "date", "number"
	 * @returns {Map<string, Function>}
	 */
	setDefaultHandlers() {
		const handlers = new Map();

		handlers.set('text', (el, event) => {
			this._handlerTextCopy(el, event);
		});

		handlers.set('textarea', (el, event) => {
			this._handlerTextCopy(el, event);
		});

		handlers.set('search', (el, event) => {
			console.log('search field clicked:', el);
			// Ваша логика здесь
		});

		handlers.set('date', (el, event) => {
			console.log('date field clicked:', el);
			// Ваша логика здесь
		});

		handlers.set('number', (el, event) => {
			this._handlerNumChange(el, event);
		});

		return handlers;
	}



	// !SECTION
	// SECTION: Действия с полями



		//// SECTION: textCopy

		/**
		 * Обрабатывает клик по кнопке копирования текста внутри элемента.
		 * Если клик был по элементу с атрибутом data-field-copy, копирует значение из элемента с data-field-value в буфер обмена.
		 * В случае успешного копирования показывает анимацию и тултип "Скопировано".
		 * Если значение для копирования отсутствует, показывает анимацию ошибки и тултип "Пусто".
		 *
		 * @param {HTMLElement} el - Родительский элемент, содержащий копируемое значение и кнопку копирования.
		 * @param {MouseEvent} event - Событие клика мыши.
		 */
		_handlerTextCopy(el, event) {
			// Находим кнопку копирования внутри поля
			const copyBtn = el.querySelector('[data-field-copy]');
			// Если клик был не по кнопке копирования — выходим
			if (!copyBtn || !copyBtn.contains(event.target)) return;

			// Находим элемент с копируемым значением
			const valueEl = el.querySelector('[data-field-value]');

			// Получаем значение для копирования (value для input/textarea, иначе textContent)
			const value = valueEl ? (valueEl.value ?? valueEl.textContent ?? '') : '';

			// Предотвращаем стандартное поведение и всплытие
			event.preventDefault();
			event.stopPropagation();

			// Если значение отсутствует — показываем ошибку (анимация + тултип "Пусто")
			if (!valueEl || !value) {
				if (valueEl) {
					// Анимация ошибки (shake)
					valueEl.classList.remove('core-shake');
					void valueEl.offsetWidth;
					valueEl.classList.add('core-shake');
					setTimeout(() => valueEl.classList.remove('core-shake'), 600);
				}
				// Показываем тултип "Пусто"
				this.showTooltipTimeout(copyBtn, 'Пусто', 1000, 'right');
				return;
			}

			// Копируем значение в буфер обмена
			navigator.clipboard.writeText(value);

			// Анимация успешного копирования (pulsing)
			valueEl.classList.remove('core-pulsing');
			void valueEl.offsetWidth;
			valueEl.classList.add('core-pulsing');
			setTimeout(() => valueEl.classList.remove('core-pulsing'), 600);

			// Показываем тултип "Скопировано"
			this.showTooltipTimeout(copyBtn, 'Скопировано', 1000, 'right');
		}



		//// !SECTION
		//// SECTION: numChange

		/**
		 * Обработчик для поля типа "number".
		 * 
		 * При нажатии на кнопки увеличения или уменьшения значения (определяются по атрибутам, заданным в this.config.fieldNumAttrs.minus и this.config.fieldNumAttrs.plus),
		 * значение поля изменяется на величину шага (step), с учетом минимального (min) и максимального (max) значений.
		 * После изменения значения инициируется событие 'input' для синхронизации состояния.
		 * Предотвращает стандартное поведение и всплытие события.
		 */
		_handlerNumChange(el, event) {
			const input = el.querySelector(`[${this.config.fieldAttrs.value}]`);
			if (!input) return;

			const adjustValue = (delta) => {
				const step = parseFloat(input.step) || 1;
				const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
				const max = input.max !== '' ? parseFloat(input.max) : Infinity;
				const value = parseFloat(input.value) || 0;
				let newValue = value + delta * step;
				newValue = Math.min(Math.max(newValue, min), max);

				// Если есть zeroClear и результат 0 — очищаем поле
				if (input.hasAttribute(this.config.fieldNumAttrs.zeroClear) && newValue === 0) {
					input.value = '';
				} else {
					input.value = newValue;
				}

				input.dispatchEvent(new Event('input', { bubbles: true }));
				event.preventDefault();
				event.stopPropagation();
			};

			// Используем querySelectorAll для поддержки нескольких кнопок плюс/минус внутри поля
			const minusBtns = el.querySelectorAll(`[${this.config.fieldNumAttrs.minus}]`);
			const plusBtns = el.querySelectorAll(`[${this.config.fieldNumAttrs.plus}]`);
			const minus10xBtns = el.querySelectorAll(`[${this.config.fieldNumAttrs.minus10x}]`);
			const plus10xBtns = el.querySelectorAll(`[${this.config.fieldNumAttrs.plus10x}]`);

			minusBtns.forEach(btn => {
				if (btn.contains(event.target)) {
					adjustValue(-1);
				}
			});

			plusBtns.forEach(btn => {
				if (btn.contains(event.target)) {
					adjustValue(1);
				}
			});

			minus10xBtns.forEach(btn => {
				if (btn.contains(event.target)) {
					adjustValue(-10);
				}
			});

			plus10xBtns.forEach(btn => {
				if (btn.contains(event.target)) {
					adjustValue(10);
				}
			});
		}

		// !SECTION



	// !SECTION
	// SECTION: Тултипы
	
	/**
	 * Показывает тултип на элементе на заданное время (мс), затем скрывает его.
	 * @param {HTMLElement} el - Элемент, на котором показать тултип
	 * @param {string} text - Текст тултипа
	 * @param {number} [timeout=1000] - Время отображения в миллисекундах
	 * @param {string} [position='top'] - Позиция тултипа
	 */
	showTooltipTimeout(el, text, timeout = 1000, position = 'top') {
		this.showTooltip(el, text, position);
		setTimeout(() => this.hideTooltip(el), timeout);
	}

	/**
	 * Показывает тултип на элементе.
	 * Теперь автоматически определяет оптимальную позицию тултипа (top, bottom, left, right) в зависимости от доступного пространства,
	 * если заданная позиция не помещается на экране. Для input/textarea/select тултип отображается на родительском элементе.
	 * @param {HTMLElement} el - Элемент, на котором показать тултип
	 * @param {string} text - Текст тултипа
	 * @param {string} [position] - Предпочтительная позиция: top, bottom, left, right (по умолчанию top)
	 */
	showTooltip(el, text, position = 'top') {
		// Если text не передан, берем из title
		if (!text && el.hasAttribute('title')) {
			text = el.getAttribute('title');
		}
		// Проверяем, поддерживает ли элемент псевдоэлементы ::before/::after (например, input не поддерживает)
		// Если нет, используем родителя
		const canHavePseudo = (node) => {
			return !(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement);
		};

		let target = canHavePseudo(el) ? el : el.parentElement;
		if (!target) return;

		// Создаем временный элемент для измерения размеров тултипа
		const temp = document.createElement('div');
		Object.assign(temp.style, {
			position: 'absolute',
			visibility: 'hidden',
			pointerEvents: 'none',
			zIndex: '-1'
		});
		temp.className = this.config.fieldTooltip.class + (position ? ` core-tooltip-${position}` : '');
		temp.textContent = text;
		document.body.appendChild(temp);

		const targetRect = target.getBoundingClientRect();
		const tooltipRect = temp.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
		const scrollY = window.pageYOffset || document.documentElement.scrollTop;

		// Определяем оптимальную позицию
		let finalPosition = position;
		const margin = 8; // небольшой отступ

		const fits = {
			top: (targetRect.top + scrollY) - tooltipRect.height - margin > scrollY,
			bottom: (targetRect.bottom + scrollY) + tooltipRect.height + margin < scrollY + viewportHeight,
			left: (targetRect.left + scrollX) - tooltipRect.width - margin > scrollX,
			right: (targetRect.right + scrollX) + tooltipRect.width + margin < scrollX + viewportWidth,
		};

		if (position === 'top' && !fits.top) {
			if (fits.bottom) finalPosition = 'bottom';
			else if (fits.right) finalPosition = 'right';
			else if (fits.left) finalPosition = 'left';
		} else if (position === 'bottom' && !fits.bottom) {
			if (fits.top) finalPosition = 'top';
			else if (fits.right) finalPosition = 'right';
			else if (fits.left) finalPosition = 'left';
		} else if (position === 'right' && !fits.right) {
			if (fits.left) finalPosition = 'left';
			else if (fits.top) finalPosition = 'top';
			else if (fits.bottom) finalPosition = 'bottom';
		} else if (position === 'left' && !fits.left) {
			if (fits.right) finalPosition = 'right';
			else if (fits.top) finalPosition = 'top';
			else if (fits.bottom) finalPosition = 'bottom';
		}

		document.body.removeChild(temp);

		target.setAttribute(this.config.fieldTooltip.attr, text);
		target.classList.add(this.config.fieldTooltip.class);
		target.classList.remove('core-tooltip-bottom', 'core-tooltip-left', 'core-tooltip-right');
		if (finalPosition && finalPosition !== 'top') {
			target.classList.add(`core-tooltip-${finalPosition}`);
		}
	}

	/**
	 * Скрывает тултип на элементе
	 * @param {HTMLElement} el
	 */
	hideTooltip(el) {
		const canHavePseudo = (node) => {
			return !(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement);
		};

		let target = canHavePseudo(el) ? el : el.parentElement;
		if (!target) return;

		target.removeAttribute(this.config.fieldTooltip.attr);
		target.classList.remove(this.config.fieldTooltip.class, 'core-tooltip-bottom', 'core-tooltip-left', 'core-tooltip-right');
	}



	// !SECTION
	// SECTION: desctroy()

	/**
	 * Удаляет обработчик клика с документа и очищает коллекцию обработчиков.
	 * @returns {string} Сообщение об успешном завершении
	 */
	destroy() {
		document.removeEventListener('click', this._handleGlobalClick);
		this.handlers.clear();
		return "FieldManager выключен";
	}
	// !SECTION
}