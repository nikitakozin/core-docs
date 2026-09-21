/**
 * SliderManager
 *
 * Подробная инструкция по использованию класса SliderManager для новых пользователей.
 *
 * Описание
 * -------
 * SliderManager — лёгкий менеджер для горизонтальных/вертикальных слайдеров,
 * работающий на чистом JS и использующий IntersectionObserver для отслеживания
 * текущих (видимых) слайдов. Менеджер поддерживает различные триггеры в DOM,
 * опции конфигурации и (опционально) сохранение состояния в localStorage.
 *
 * Как подключить
 * --------------
 * - Поместите этот скрипт в ваш проект и инициализируйте менеджер:
 *
 *   const sm = new SliderManager();
 *
 *   По умолчанию класс использует singleton-паттерн: повторный вызов вернёт
 *   тот же экземпляр. Экземпляр также доступен через window.SliderManager.
 *
 * HTML-разметка (пример)
 * ---------------------
 * - Каждый слайдер — это контейнер с атрибутом data-slider (или с id).
 * - Слайды — дочерние элементы контейнера (любые элементы, например div).
 *
 * <div id="mySlider" data-slider data-slider-save>
 *   <div id="slide-0">Slide 0</div>
 *   <div id="slide-1">Slide 1</div>
 *   <div id="slide-2">Slide 2</div>
 * </div>
 *
 * Атрибуты и что они делают
 * -------------------------
 * - data-slider (по умолчанию, настраиваемый через cfg.sliderAttr):
 *     маркирует контейнер как слайдер. Можно вместо id указывать значение
 *     атрибута как идентификатор слайдера.
 *
 * - data-slider-type (cfg.sliderTypeAttr):
 *     "row" или "col" — логическая ориентация. (В текущей реализации
 *     используется для семантики/доп. логики.)
 *
 * - data-slider-animate (cfg.animateAttr):
 *     включить плавную прокрутку для конкретного слайдера (если глобальная
 *     анимация отключена).
 *
 * - data-slider-save (cfg.saveStateAttr):
 *     если установлен на слайдере или на любом родительском элементе,
 *     позиция слайдера будет сохраняться в localStorage (ключ по cfg.storageKey)
 *     и восстановлена при инициализации.
 *
 * Триггеры (кнопки/ссылки для навигации)
 * --------------------------------------
 * - data-slider-trigger (cfg.triggerSliderIdAttr):
 *     указывает id слайдера, которым управляет триггер.
 *
 * - data-slider-goto (cfg.triggerGoToAttr):
 *     управляет переходом на слайд. Допустимые значения:
 *       - "next", "prev", "start", "end"
 *       - относительные смещения: "+N" или "-N" (например "+2")
 *       - id слайда (например "slide-2") — найдётся по element.id
 *       - индекс (0 — первый слайд)
 *
 * - data-slider-next / data-slider-prev (cfg.triggerNextAttr / cfg.triggerPrevAttr):
 *     упрощённые триггеры для переключения на следующий/предыдущий слайд.
 *
 * Пример триггеров:
 * <button data-slider-trigger="mySlider" data-slider-goto="next">Next</button>
 * <button data-slider-trigger="mySlider" data-slider-goto="prev">Prev</button>
 * <button data-slider-trigger="mySlider" data-slider-goto="2">Go to #2 (index)</button>
 * <a data-slider-trigger="mySlider" data-slider-goto="slide-1">To slide with id</a>
 *
 * Конфигурация (cfg)
 * -------------------
 * При создании new SliderManager(options) можно переопределить опции:
 * - globalAnimation (boolean): глобально включить плавный скролл. Если false,
 *   то плавная прокрутка будет работать только там, где есть data-slider-animate.
 * - animateAttr (string): имя атрибута для включения анимации в DOM.
 * - smoothScrollSpeed (number): минимальная скорость непрерывной прокрутки,
 *   измеряемая в размерах viewport слайдера в секунду.
 * - smoothScrollEasing (number): время замедления возле цели в миллисекундах.
 *   Эти параметры управляют JS-анимацией для точного указателя. На устройствах
 *   с pointer: coarse используется нативный smooth scroll браузера.
 * - sliderAttr (string): имя атрибута, обозначающего контейнер слайдера.
 * - sliderTypeAttr (string): имя атрибута типа слайдера (row/col).
 * - endLeftAnimation / endRightAnimation (string): CSS классы для короткой
 *   анимации при достижении краёв слайдера.
 * - saveStateAttr (string): имя атрибута для включения сохранения состояния.
 * - triggerSliderIdAttr / triggerGoToAttr / triggerNextAttr / triggerPrevAttr:
 *   имена атрибутов для триггеров.
 * - storageKey (string): ключ localStorage, используемый для сохранения позиций.
 *
 * Публичные методы
 * -----------------
 * - autoInit(): просканирует DOM и зарегистрирует все контейнеры с
 *   атрибутом cfg.sliderAttr.
 * - registerSlider(id, sliderDOM): зарегистрировать конкретный DOM-элемент
 *   как слайдер. id — либо id элемента, либо значение атрибута data-slider.
 * - refresh(): alias для autoInit().
 * - goTo(sliderId, target, options = {}): перейти к слайду.
 *     target: "next"|"prev"|"start"|"end"|"+N"|"-N"|slideId|index
 *     options.animateScroll (boolean) — форсировать анимацию прокрутки
 *       для этой операции. По умолчанию берётся из cfg.globalAnimation.
 *     Повторные next/prev во время анимации продолжают текущее движение к
 *       новой цели без перезапуска easing.
 *     Возвращает undefined. После перехода будет вызвано событие sliderChange.
 * - getCurrentSlides(sliderId): получить массив DOM-элементов текущих (видимых)
 *   слайдов, отсортированных в порядке DOM.
 * - on(event, listener) / off(event, listener) / emit(event, ...args):
 *   работа через EventEmitter, если он доступен в window.EventEmitter.
 * - destroy(): отключает глобальные слушатели, обнуляет observers и очищает
 *   singleton.
 *
 * События
 * -------
 * - sliderChange:{id}
 *     эмиттируется когда изменился список видимых слайдов или выполнен goTo.
 *     Аргументы: { slider, currentSlides } — slider: internal объект менеджера,
 *     currentSlides: Set текущих видимых DOM-элементов.
 *
 * Поведение сохранения
 * --------------------
 * Если элемент обладает атрибутом cfg.saveStateAttr (например data-slider-save)
 * либо любой из его родителей его имеет — позиция (индекс первого видимого
 * слайда) будет сохраняться в localStorage под ключом cfg.storageKey.
 * Сохранение выполняется с debounce 300ms.
 *
 * Примеры использования в коде
 * ---------------------------
 * // Инициализация
 * const sm = new SliderManager({ globalAnimation: true });
 *
 * // Навигация программно
 * sm.goTo('mySlider', 'next');
 * sm.goTo('mySlider', '+2');
 * sm.goTo('mySlider', 0); // перейти на первый слайд по индексу
 * sm.goTo('mySlider', 'slide-2'); // перейти на слайд по id DOM-элемента
 *
 * // Подписка на изменения
 * sm.on('sliderChange:mySlider', ({ slider, currentSlides }) => {
 *   // currentSlides — Set
 *   console.log('Видимые слайды:', Array.from(currentSlides));
 * });
 *
 * Дополнительно
 * -------------
 * - Для работы событий ожидается глобальный EventEmitter в window.EventEmitter.
 *   Если его нет, .on/.off/.emit будут молча игнорироваться.
 * - IntersectionObserver threshold = 0.95 — слайд считается видимым, когда
 *   95% его площади внутри контейнера.
 * - Если нужно изменить поведение (например, уровень видимости), отредактируйте
 *   соответствующие места в коде (IntersectionObserver options).
 */
export default class SliderManager {

	// SECTION constructor()

	constructor(options = {}) {
		if (SliderManager._instance) return SliderManager._instance;

		this.emitter = window.EventEmitter || null;
		if (!this.emitter) {
		    console.warn('[FormManager] EventEmitter не найден в window.EventEmitter. Логика подписчиков будет отключена. Если EventEmitter был создан позже FormManager, выполните FormManager.autoInit(), затем создайте подписчиков');
		}

		if (SliderManager._instance) {
		    SliderManager._instance.emitter = this.emitter;
		    return SliderManager._instance;
		}

		this.cfg = Object.assign({
			globalAnimation: false, // Если указан false, то по умолчанию анимация не будет работать для всех, только для тех, где указан animateAttr
			animateAttr: 'data-slider-animate', // Плавная анимация скролла слайдера. Позволяет включать плавный скролл, если выключена глобальная анимация.
			centerClass: 'core-slider-center', // Привязка активного слайда и программного скролла к центру контейнера.

			sliderAttr: 'data-slider',
			sliderTypeAttr: 'data-slider-type', // Тип слайдера: "row", "col". По умолчанию "row"
			endLeftAnimation: 'core-slide-shake-left', // Класс анимации при достижении левого конца
			endRightAnimation: 'core-slide-shake-right', // Класс анимации при достижении правого конца

			saveStateAttr: 'data-slider-save', // При добавлении этого атрибута к слайдеру или любому родителю, его состояние будет сохраняться при перезагрузке страницы

			triggerSliderIdAttr: 'data-slider-trigger', // Указывает каким слайдером управляет триггер.
			triggerGoToAttr: 'data-slider-goto', // При добавлении этого атрибута к элементу с sliderAttr, он будет работать как триггер переключения на слайд. 
			// Значение атрибута 
			// - экшен "next"|"prev"|"start"|"end", 
			// — относительный отступ "+N"|"-N" (N – кол-во слайдов),
			// — id слайда,
			// — индекс (0 - первый слайд)
			
			triggerNextAttr: 'data-slider-next', // Упрощенный триггер переключения на следующий слайд.
			triggerPrevAttr: 'data-slider-prev', // Упрощенный триггер переключения на предыдущий слайд.

			smoothScrollSpeed: 1.8, // Минимальная скорость непрерывной прокрутки во viewport в секунду.
			smoothScrollEasing: 90, // Время замедления возле конечной позиции в миллисекундах.
			storageKey: 'sliderManager'
		}, options);

		this.sliders = new Map();

		this._state = {
			globListenersInit: false, // Флаг для проверки инициализации глобальных слушателей
		};

		this._handlers = {
			globalClick: this.#_handleGlobalClick.bind(this),
		};

		this.autoInit();

		// Восстанавливаем состояние после инициализации
		this.#_restoreSliderState();

		SliderManager._instance = this;

		window.SliderManager = SliderManager._instance; // Для глобального доступа к экземпляру
	}



	// !SECTION
	// SECTION Регистрация

	autoInit() {
		document.querySelectorAll('[' + this.cfg.sliderAttr + ']').forEach(sliderDOM => {
			const id = sliderDOM.id ||
				sliderDOM.getAttribute(this.cfg.sliderAttr);

			if (id) this.registerSlider(id, sliderDOM);
		});


		// Добавляем слушатели кликов по всему документу
		this.#_initGlobalClickListener();

		return "Новых слайдеров: " + this.sliders.size;
	}



	refresh() {
		this.autoInit();
	};



	registerSlider(id, sliderDOM) {
		if (!sliderDOM) throw new Error('DOM слайдера "' + id + '" не найден');
		const previousSlider = this.sliders.get(id);
		if (previousSlider) this.#_destroyRegisteredSlider(previousSlider);

		const slides = [...sliderDOM.children];

		const sliderData = {
			DOM: sliderDOM,
			isAnimating: false,
			slides,
			currentSlides: new Set(),
			targetIndex: null,
			animationFrame: null,
			animationTarget: null,
			animationTime: null,
			nativeAnimation: false,
			originalScrollSnapType: '',
			interactionHandlers: null,
		};
		sliderData.interactionHandlers = {
			pointerdown: () => this.#_cancelSliderAnimation(sliderData),
			touchstart: () => this.#_cancelSliderAnimation(sliderData),
			wheel: () => this.#_cancelSliderAnimation(sliderData),
		};
		Object.entries(sliderData.interactionHandlers).forEach(([event, handler]) => {
			sliderDOM.addEventListener(event, handler, { passive: true });
		});

		this.sliders.set(id, sliderData);

		// Отслеживание изменений контейнера
		this.#_setVisibleSlidesObserver(id);

		return "Новый слайдер " + id;
	}



	// !SECTION
	// SECTION on, off, emit

	on(event, listener) {
		if (!this.emitter) return;
		this.emitter.on(event, listener);
	}

	off(event, listener) {
		if (!this.emitter) return;
		this.emitter.off(event, listener);
	}

	emit(event, ...args) {
		if (!this.emitter) return;
		this.emitter.emit(event, ...args);
	}



	// !SECTION
	// SECTION Обработчики событий

	// Слушатели кликов по всему документу
	#_handleGlobalClick(e) {
		this.#_handleTriggerEvent(e);
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

	#_handleTriggerEvent(e) {
		const trigger = e.target.closest(`[${this.cfg.triggerSliderIdAttr}]`);
		if (!trigger) return;

		const id = trigger.dataset.sliderTrigger;
		const action = trigger.dataset.sliderGoto 
			|| (trigger.hasAttribute(this.cfg.triggerNextAttr) && "next")
			|| (trigger.hasAttribute(this.cfg.triggerPrevAttr) && "prev");

		if (action) {
			this.goTo(id, action, { animateScroll: trigger.hasAttribute(this.cfg.animateAttr) });
			e.preventDefault();
		}
	}




	// !SECTION
	// SECTION Публичный API

	goTo(sliderId, target, options = {}) {
		const slider = this.sliders.get(sliderId);
		if (!slider) return;

		this.#_updateSliderPosition(slider, target, options);
		this.#_updateSavedState(sliderId);
		
		return;
	}

	getCurrentSlides(sliderId) {
		const slider = this.sliders.get(sliderId);
		if (!slider) return [];

		return this.#_getSortedVisibleSlides(slider);
	}

	// !SECTION
	// SECTION Вспомогательные методы

	#_getCurrentIndex(slider) {
		if (slider.DOM.classList.contains(this.cfg.centerClass)) {
			const isColumn = slider.DOM.getAttribute(this.cfg.sliderTypeAttr) === 'col';
			const viewportCenter = isColumn
				? slider.DOM.scrollTop + (slider.DOM.clientHeight / 2)
				: slider.DOM.scrollLeft + (slider.DOM.clientWidth / 2);
			let currentIndex = 0;
			let minimumDistance = Infinity;

			slider.slides.forEach((slide, index) => {
				const slideCenter = isColumn
					? slide.offsetTop + (slide.offsetHeight / 2)
					: slide.offsetLeft + (slide.offsetWidth / 2);
				const distance = Math.abs(slideCenter - viewportCenter);

				if (distance < minimumDistance) {
					minimumDistance = distance;
					currentIndex = index;
				}
			});

			return { first: currentIndex, last: currentIndex };
		}

		// Получаем индексы первого и последнего видимых слайдов
		const visibleSlides = this.#_getSortedVisibleSlides(slider);

		if (visibleSlides.length > 0) {
			const firstIndex = slider.slides.indexOf(visibleSlides[0]);
			const lastIndex = slider.slides.indexOf(visibleSlides[visibleSlides.length - 1]);
			return { first: firstIndex, last: lastIndex };
		}
		// Если нет видимых слайдов, возвращаем первый слайд
		return { first: 0, last: 0 };
	}

	#_getSortedVisibleSlides(slider) {
		// Сортируем видимые слайды в порядке их появления в DOM
		return Array.from(slider.currentSlides).sort((a, b) => {
			return slider.slides.indexOf(a) - slider.slides.indexOf(b);
		});
	}

	#_getTargetIndex(slider, currentIndex, target) {
		const slides = slider.slides;

		// Сначала проверяем строки (включая относительные смещения)
		if (typeof target === 'string') {
			// Если строка начинается с + или - - относительное смещение
			if (target.startsWith('+') || target.startsWith('-')) {
				const offset = parseInt(target);
				return currentIndex + offset;
			}

			 // Проверяем, является ли строка числом
			if (!isNaN(target)) {
				return parseInt(target, 10);
			}

			// Команды
			switch (target) {
				case 'next': return currentIndex + 1;
				case 'prev': return currentIndex - 1;
				case 'start': return 0;
				case 'end': return slides.length - 1;
				default:
					// Поиск по ID слайда
					const slideIndex = slides.findIndex(slide => slide.id === target);
					return slideIndex >= 0 ? slideIndex : null;
			}
		}



		// Если число - возвращаем как есть (только чистые числа без знаков)
		// Если target — число или строка с числом, парсим
		if (!isNaN(target)) return parseInt(target, 10);

		return null;
	}

	#_updateSliderPosition(slider, target, { animateScroll = this.cfg.globalAnimation } = {}) {
		const slides = slider.slides;
		if (slides.length === 0) return null;

		// Получаем текущий индекс на основе первого видимого слайда
		const currentIndexes = this.#_getCurrentIndex(slider);
		const firstCurrentIndex = slider.targetIndex ?? currentIndexes.first;
		const lastCurrentIndex = slider.targetIndex ?? currentIndexes.last;

		let targetIndex = this.#_getTargetIndex(slider, firstCurrentIndex, target);
		if (targetIndex === null) return null;

		const originalTargetIndex = targetIndex;

		// Если цель больше или меньше кол-ва слайдов, то выбираем крайние
		targetIndex = Math.max(0, Math.min(targetIndex, slides.length - 1));

		// Если достигли начала
		if (originalTargetIndex < 0 && firstCurrentIndex === 0) {
			slider.DOM.classList.add(this.cfg.endRightAnimation);
			setTimeout(() => slider.DOM.classList.remove(this.cfg.endRightAnimation), 400);
			return;
		}

		// Если достигли конца
		if (lastCurrentIndex == slides.length - 1 && originalTargetIndex > firstCurrentIndex && lastCurrentIndex !== originalTargetIndex) {
			slider.DOM.classList.add(this.cfg.endLeftAnimation);
			setTimeout(() => slider.DOM.classList.remove(this.cfg.endLeftAnimation), 400);
			return;
		}

		if (firstCurrentIndex === targetIndex && slider.animationFrame === null) return;

		const targetSlide = slides[targetIndex];
		if (!targetSlide) return;

		// Повторная команда во время анимации меняет цель существующего движения,
		// не перезапуская native smooth scroll и его easing в Chrome.
		const shouldScrollAnimate = animateScroll || slider.DOM.hasAttribute(this.cfg.animateAttr);
		const isCentered = slider.DOM.classList.contains(this.cfg.centerClass);
		const isColumn = slider.DOM.getAttribute(this.cfg.sliderTypeAttr) === 'col';
		const computedStyle = getComputedStyle(slider.DOM);
		const scrollPaddingLeft = parseFloat(computedStyle.scrollPaddingLeft) || 0;
		const scrollPaddingTop = parseFloat(computedStyle.scrollPaddingTop) || 0;
		const left = isCentered && !isColumn
			? targetSlide.offsetLeft - ((slider.DOM.clientWidth - targetSlide.offsetWidth) / 2)
			: targetSlide.offsetLeft - scrollPaddingLeft;
		const top = isCentered && isColumn
			? targetSlide.offsetTop - ((slider.DOM.clientHeight - targetSlide.offsetHeight) / 2)
			: targetSlide.offsetTop - scrollPaddingTop;

		slider.targetIndex = targetIndex;
		if (shouldScrollAnimate) {
			this.#_animateSliderTo(slider, isColumn ? top : left, isColumn);
		} else {
			this.#_cancelSliderAnimation(slider, false);
			slider.DOM.scrollTo({ left, top, behavior: 'auto' });
			slider.targetIndex = null;
		}

		this.emitter.emit(`sliderChange:${slider.DOM.id}`, { slider, currentSlides: slider.currentSlides });

	}

	#_animateSliderTo(slider, target, isColumn) {
		const DOM = slider.DOM;
		const maximum = isColumn
			? Math.max(0, DOM.scrollHeight - DOM.clientHeight)
			: Math.max(0, DOM.scrollWidth - DOM.clientWidth);
		slider.animationTarget = Number.isFinite(maximum)
			? Math.min(Math.max(target, 0), maximum)
			: target;

		if (window.matchMedia?.('(pointer: coarse)').matches) {
			this.#_animateNativeSliderTo(slider, isColumn);
			return;
		}

		if (slider.animationFrame !== null) return;

		slider.isAnimating = true;
		slider.originalScrollSnapType = DOM.style.scrollSnapType;
		DOM.style.scrollSnapType = 'none';
		let scrollRemainder = 0;

		const move = time => {
			const previousTime = slider.animationTime ?? time;
			const elapsed = Math.min(32, time - previousTime);
			const current = (isColumn ? DOM.scrollTop : DOM.scrollLeft) + scrollRemainder;
			const distance = slider.animationTarget - current;
			slider.animationTime = time;

			if (Math.abs(distance) <= 0.5) {
				if (isColumn) DOM.scrollTop = slider.animationTarget;
				else DOM.scrollLeft = slider.animationTarget;
				this.#_finishSliderAnimation(slider);
				return;
			}

			const viewportSize = isColumn ? DOM.clientHeight : DOM.clientWidth;
			const easingStep = Math.abs(distance) * (1 - Math.exp(-elapsed / this.cfg.smoothScrollEasing));
			const continuousStep = viewportSize * this.cfg.smoothScrollSpeed * (elapsed / 1000);
			// Ограничиваем скорость на длинном участке и позволяем easing плавно
			// замедлить движение возле цели.
			const step = Math.min(Math.abs(distance), easingStep, continuousStep);
			const nextPosition = current + (Math.sign(distance) * step);
			if (isColumn) DOM.scrollTop = nextPosition;
			else DOM.scrollLeft = nextPosition;
			// Браузер может округлять scrollLeft/scrollTop. Сохраняем дробную
			// часть шага, чтобы easing не застревал в нескольких пикселях от цели.
			scrollRemainder = nextPosition - (isColumn ? DOM.scrollTop : DOM.scrollLeft);
			slider.animationFrame = requestAnimationFrame(move);
		};

		slider.animationFrame = requestAnimationFrame(move);
	}

	#_animateNativeSliderTo(slider, isColumn) {
		const DOM = slider.DOM;
		if (!slider.isAnimating) {
			slider.isAnimating = true;
			slider.originalScrollSnapType = DOM.style.scrollSnapType;
			DOM.style.scrollSnapType = 'none';
		}
		slider.nativeAnimation = true;
		// На touch-устройствах браузер сам выполняет плавную прокрутку:
		// не конкурируем с мобильным scroll compositor записью позиции каждый кадр.
		DOM.scrollTo({
			[isColumn ? 'top' : 'left']: slider.animationTarget,
			behavior: 'smooth',
		});
		if (slider.animationFrame !== null) return;

		const checkPosition = () => {
			const current = isColumn ? DOM.scrollTop : DOM.scrollLeft;
			if (Math.abs(slider.animationTarget - current) <= 0.5) {
				this.#_finishSliderAnimation(slider);
				return;
			}
			slider.animationFrame = requestAnimationFrame(checkPosition);
		};
		slider.animationFrame = requestAnimationFrame(checkPosition);
	}

	#_finishSliderAnimation(slider) {
		slider.nativeAnimation = false;
		slider.DOM.style.scrollSnapType = slider.originalScrollSnapType;
		slider.isAnimating = false;
		slider.animationFrame = null;
		slider.animationTarget = null;
		slider.animationTime = null;
		slider.targetIndex = null;
	}

	#_cancelSliderAnimation(slider, clearTarget = true) {
		if (slider.nativeAnimation) {
			slider.DOM.scrollTo({ left: slider.DOM.scrollLeft, top: slider.DOM.scrollTop, behavior: 'instant' });
			slider.nativeAnimation = false;
		}
		if (slider.animationFrame !== null) cancelAnimationFrame(slider.animationFrame);
		slider.DOM.style.scrollSnapType = slider.originalScrollSnapType;
		slider.isAnimating = false;
		slider.animationFrame = null;
		slider.animationTarget = null;
		slider.animationTime = null;
		if (clearTarget) slider.targetIndex = null;
	}

	#_destroyRegisteredSlider(slider) {
		this.#_cancelSliderAnimation(slider);
		if (slider._observer) slider._observer.disconnect();
		if (slider._saveStateTimeout) clearTimeout(slider._saveStateTimeout);
		Object.entries(slider.interactionHandlers || {}).forEach(([event, handler]) => {
			slider.DOM.removeEventListener(event, handler);
		});
	}

	#_animateSlide(slide) {
		const animClass = this.cfg.anim.activeShow.class;
		if (!animClass) return;
		
		slide.classList.remove(animClass);
		requestAnimationFrame(() => slide.classList.add(animClass));
		
		setTimeout(() => slide.classList.remove(animClass), this.cfg.anim.activeShow.duration);
	}

	#_setVisibleSlidesObserver(sliderId) {
		const slider = this.sliders.get(sliderId);
		if (!slider) return { count: 0, slides: [] };
		
		// Создадим список видимых слайдов (будет обновляться автоматически)
		if (!slider._observer) {
			slider.currentSlides = new Set();

			const observer = new IntersectionObserver(entries => {
				for (const entry of entries) {
					if (entry.intersectionRatio > 0.95) {
						// Слайд полностью виден
						slider.currentSlides.add(entry.target);
					} else {
						// Слайд вышел из полной видимости
						slider.currentSlides.delete(entry.target);
					}
				}

				// Уведомляем подписчиков, что изменился список текущих слайдов
				this.emitter.emit(`sliderChange:${slider.DOM.id}`, { slider, currentSlides: slider.currentSlides });

			}, { root: slider.DOM, threshold: 0.95 });

			// Начинаем наблюдать все слайды
			for (const slide of slider.slides) {
				observer.observe(slide);
			}
			

			slider._observer = observer; // сохраним, если захотите потом отключить
		}

		const slides = this.#_getSortedVisibleSlides(slider);

		return { count: slides.length, slides };
	}


	// !SECTION
	// SECTION Сохранение и восстановление состояния

	#_shouldSaveState(sliderId) {
		const slider = this.sliders.get(sliderId);
		if (!slider) return false;
		const attr = this.cfg.saveStateAttr;
		const el = slider.DOM;
		return el.hasAttribute(attr) || !!el.closest('[' + attr + ']');
	}

	#_updateSavedState(sliderId) {
		if (!this.#_shouldSaveState(sliderId)) return;

		const slider = this.sliders.get(sliderId);
		
		// Очищаем предыдущий таймер
		clearTimeout(slider._saveStateTimeout);
		
		// Устанавливаем дебаунс
		slider._saveStateTimeout = setTimeout(() => {
			const currentIndex = slider.targetIndex ?? this.#_getCurrentIndex(slider).first;
			const saved = JSON.parse(localStorage.getItem(this.cfg.storageKey) || "{}");

			if (saved[sliderId] !== currentIndex) {
				saved[sliderId] = currentIndex;
				localStorage.setItem(this.cfg.storageKey, JSON.stringify(saved));
			}
		}, 300);
	}

	#_restoreSliderState() {
		try {
			const savedState = localStorage.getItem(this.cfg.storageKey);
			if (!savedState) return;

			const state = JSON.parse(savedState);
			Object.entries(state).forEach(([id, index]) => {
				if (this.sliders.has(id) && this.#_shouldSaveState(id)) {
					this.goTo(id, index);
				}
			});
		} catch (e) {
			console.warn('[SliderManager] Ошибка localStorage:', e);
		}
	}

	// !SECTION
	// SECTION destroy()

	destroy() {
		this.#_removeGlobalClickListener();

		// Очищаем observers и timeouts
		this.sliders.forEach(slider => this.#_destroyRegisteredSlider(slider));

		this.sliders.clear();

		this._state = {};
		
		// Очищаем ссылку на singleton
		SliderManager._instance = null;

		return "SliderManager выключен";
	}

	// !SECTION

}
