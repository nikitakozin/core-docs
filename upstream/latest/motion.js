/**
 * MotionManager
 *
 * Унифицирует запуск CSS/WAAPI-анимаций и ожидание transition. Все операции
 * возвращают Promise, имеют аварийный timeout, поддерживают AbortSignal и
 * автоматически учитывают prefers-reduced-motion.
 *
 * Подключение
 * -----------
 * import MotionManager from 'motion';
 * const motion = new MotionManager();
 *
 * Экземпляр является singleton и доступен как window.MotionManager.
 *
 * CSS-анимации
 * ------------
 * await motion.animate(element, 'core-animate:fade-in');
 * await motion.animate(element, [
 *   'core-animate:fade-out-left',
 *   'core-animate-time-1x',
 * ]);
 *
 * animate добавляет классы, при необходимости перезапускает анимацию, ждёт
 * animationend/animationcancel либо вычисленный timeout и затем удаляет классы.
 * Повторный animate для того же элемента отменяет предыдущий.
 *
 * Опции animate для CSS:
 * - delay: задержка в миллисекундах;
 * - fillMode: временный animation-fill-mode (по умолчанию 'both');
 * - restart: принудительно перезапустить уже добавленный класс (true);
 * - cleanup: удалить классы после завершения (true);
 * - timeout: собственный аварийный timeout;
 * - signal: AbortSignal внешней операции;
 * - cancelPrevious: отменять предыдущую анимацию элемента (true);
 * - reducedMotion: 'skip' (по умолчанию) либо 'allow'.
 *
 * Web Animations API
 * ------------------
 * await motion.animate(element, [
 *   { opacity: 0, transform: 'translateY(-8px)' },
 *   { opacity: 1, transform: 'translateY(0)' },
 * ], { duration: 200, easing: 'ease-out' });
 *
 * Для keyframes остальные опции передаются element.animate(). При reduced
 * motion длительность и задержка становятся нулевыми, чтобы сразу применилось
 * конечное состояние.
 *
 * Transition
 * ----------
 * await motion.transitionFinished(panel, { property: 'transform' });
 *
 * Метод ждёт transitionend/transitioncancel и всегда имеет fallback на основе
 * computed transition-duration + transition-delay. Если transition отсутствует
 * или пользователь выбрал reduced motion, Promise завершается сразу.
 *
 * Stagger и отмена
 * ----------------
 * await motion.stagger(cards, 'core-animate:fade-in', { stagger: 60 });
 * motion.cancel(element);
 * motion.cancelAll();
 *
 * animation в stagger может быть функцией (element, index) => classes/keyframes.
 * Результат каждой операции: { status, element }, где status — finished,
 * cancelled или skipped. Отмена является штатным результатом и не reject Promise.
 */

export default class MotionManager {
	constructor(options = {}) {
		if (MotionManager._instance) return MotionManager._instance;

		this.cfg = Object.assign({
			reducedMotionQuery: '(prefers-reduced-motion: reduce)',
			timeoutPadding: 50,
		}, options);
		this.active = new Map();

		MotionManager._instance = this;
		window.MotionManager = MotionManager._instance;
	}

	get reducedMotion() {
		return typeof window.matchMedia === 'function'
			&& window.matchMedia(this.cfg.reducedMotionQuery).matches;
	}

	/**
	 * Запускает CSS-классы либо keyframes Web Animations API.
	 *
	 * @param {Element} element
	 * @param {string|string[]|Object|Object[]} animation
	 * @param {Object} options
	 * @returns {Promise<{status: string, element: Element}>}
	 */
	animate(element, animation, options = {}) {
		this._assertElement(element, 'animate');
		if (this._isKeyframes(animation)) {
			return this._animateKeyframes(element, animation, options);
		}

		const classes = this._classes(animation);
		if (classes.length === 0) return Promise.resolve({ status: 'skipped', element });
		if (options.cancelPrevious !== false) this.cancel(element);

		const token = {};
		let finishTask;
		const promise = new Promise(resolve => {
			const originalDelay = element.style.animationDelay;
			const originalFillMode = element.style.animationFillMode;
			let settled = false;
			let waitCancel = null;
			let removeAbort = () => {};

			const finish = status => {
				if (settled) return;
				settled = true;
				waitCancel?.();
				removeAbort();
				if (options.cleanup !== false) element.classList.remove(...classes);
				if (options.delay !== undefined) element.style.animationDelay = originalDelay;
				if (options.fillMode !== false) element.style.animationFillMode = originalFillMode;
				if (this.active.get(element)?.token === token) this.active.delete(element);
				resolve({ status, element });
			};
			finishTask = finish;

			if (options.signal?.aborted) {
				finish('cancelled');
				return;
			}
			if (options.signal) {
				const abort = () => finish('cancelled');
				options.signal.addEventListener('abort', abort, { once: true });
				removeAbort = () => options.signal.removeEventListener('abort', abort);
			}

			if (this.reducedMotion && options.reducedMotion !== 'allow') {
				finish('skipped');
				return;
			}

			if (options.restart !== false) {
				element.classList.remove(...classes);
				// void element.offsetWidth;
			}
			if (options.delay !== undefined) element.style.animationDelay = `${Number(options.delay) || 0}ms`;
			if (options.fillMode !== false) element.style.animationFillMode = options.fillMode || 'both';
			element.classList.add(...classes);

			const wait = this._waitForCss(element, 'animation', options);
			waitCancel = wait.cancel;
			wait.promise.then(result => finish(result.status));
		});

		this.active.set(element, {
			token,
			cancel: () => finishTask?.('cancelled'),
			promise,
		});
		promise.then(() => {
			if (this.active.get(element)?.token === token) this.active.delete(element);
		});

		return promise;
	}

	/**
	 * Ожидает окончание CSS transition с гарантированным fallback timeout.
	 */
	transitionFinished(element, options = {}) {
		this._assertElement(element, 'transitionFinished');
		if (this.reducedMotion && options.reducedMotion !== 'allow') {
			return Promise.resolve({ status: 'skipped', element });
		}

		return this._waitForCss(element, 'transition', options).promise;
	}

	/**
	 * Запускает одну анимацию на коллекции элементов с последовательной задержкой.
	 */
	stagger(elements, animation, options = {}) {
		const list = Array.from(elements || []);
		const step = Math.max(0, Number(options.stagger ?? 60) || 0);
		const initialDelay = Math.max(0, Number(options.delay) || 0);
		const animateOptions = { ...options };
		delete animateOptions.stagger;

		return Promise.all(list.map((element, index) => this.animate(
			element,
			typeof animation === 'function' ? animation(element, index) : animation,
			{ ...animateOptions, delay: initialDelay + (index * step) },
		)));
	}

	cancel(element) {
		const task = this.active.get(element);
		if (!task) return false;

		task.cancel();
		return true;
	}

	cancelAll() {
		for (const element of [...this.active.keys()]) this.cancel(element);
	}

	destroy() {
		this.cancelAll();
		if (window.MotionManager === this) delete window.MotionManager;
		if (MotionManager._instance === this) MotionManager._instance = null;
	}

	_animateKeyframes(element, keyframes, options) {
		if (typeof element.animate !== 'function') {
			return Promise.resolve({ status: 'skipped', element });
		}
		if (options.cancelPrevious !== false) this.cancel(element);

		const managerKeys = new Set(['cancelPrevious', 'cleanup', 'reducedMotion', 'signal', 'timeout']);
		const animationOptions = Object.fromEntries(
			Object.entries(options).filter(([key]) => !managerKeys.has(key)),
		);
		if (this.reducedMotion && options.reducedMotion !== 'allow') {
			animationOptions.duration = 0;
			animationOptions.delay = 0;
		}

		const nativeAnimation = element.animate(keyframes, animationOptions);
		const token = {};
		let timeoutId = null;
		let settled = false;
		let removeAbort = () => {};
		let resolvePromise;
		const promise = new Promise(resolve => { resolvePromise = resolve; });
		const finish = status => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			removeAbort();
			if (options.cleanup === true) nativeAnimation.cancel();
			if (this.active.get(element)?.token === token) this.active.delete(element);
			resolvePromise({ status, element });
		};

		if (options.signal) {
			const abort = () => {
				nativeAnimation.cancel();
				finish('cancelled');
			};
			if (options.signal.aborted) abort();
			else {
				options.signal.addEventListener('abort', abort, { once: true });
				removeAbort = () => options.signal.removeEventListener('abort', abort);
			}
		}

		Promise.resolve(nativeAnimation.finished).then(
			() => finish(this.reducedMotion && options.reducedMotion !== 'allow' ? 'skipped' : 'finished'),
			() => finish('cancelled'),
		);
		if (Number.isFinite(options.timeout)) {
			timeoutId = setTimeout(() => finish('finished'), Math.max(0, options.timeout));
		}

		this.active.set(element, {
			token,
			cancel: () => {
				nativeAnimation.cancel();
				finish('cancelled');
			},
			promise,
		});
		promise.then(() => {
			if (this.active.get(element)?.token === token) this.active.delete(element);
		});

		return promise;
	}

	_waitForCss(element, type, options) {
		let settled = false;
		let timeoutId = null;
		let removeAbort = () => {};
		let resolvePromise;
		const promise = new Promise(resolve => { resolvePromise = resolve; });
		const endEvent = `${type}end`;
		const cancelEvent = `${type}cancel`;
		const duration = Number.isFinite(options.timeout)
			? Math.max(0, options.timeout)
			: this._cssDuration(element, type) + this.cfg.timeoutPadding;

		const cleanup = () => {
			clearTimeout(timeoutId);
			element.removeEventListener(endEvent, onEnd);
			element.removeEventListener(cancelEvent, onCancel);
			removeAbort();
		};
		const finish = status => {
			if (settled) return;
			settled = true;
			cleanup();
			resolvePromise({ status, element });
		};
		const matches = event => event.target === element
			&& (!options.property || event.propertyName === options.property);
		const onEnd = event => {
			if (matches(event)) finish('finished');
		};
		const onCancel = event => {
			if (matches(event)) finish('cancelled');
		};

		if (options.signal?.aborted) {
			finish('cancelled');
		} else if (duration <= this.cfg.timeoutPadding && !Number.isFinite(options.timeout)) {
			queueMicrotask(() => finish('skipped'));
		} else {
			element.addEventListener(endEvent, onEnd);
			element.addEventListener(cancelEvent, onCancel);
			timeoutId = setTimeout(() => finish('finished'), duration);
			if (options.signal) {
				const abort = () => finish('cancelled');
				options.signal.addEventListener('abort', abort, { once: true });
				removeAbort = () => options.signal.removeEventListener('abort', abort);
			}
		}

		return { promise, cancel: () => finish('cancelled') };
	}

	_cssDuration(element, type) {
		if (typeof window.getComputedStyle !== 'function') return 0;
		const style = window.getComputedStyle(element);
		const durations = this._timeList(style[`${type}Duration`]);
		const delays = this._timeList(style[`${type}Delay`]);
		const size = Math.max(durations.length, delays.length);
		let maximum = 0;

		for (let index = 0; index < size; index += 1) {
			const duration = durations[index % durations.length] || 0;
			const delay = delays[index % delays.length] || 0;
			maximum = Math.max(maximum, duration + delay);
		}

		return maximum;
	}

	_timeList(value = '0s') {
		return String(value).split(',').map(item => {
			const time = item.trim();
			if (time.endsWith('ms')) return Number.parseFloat(time) || 0;
			if (time.endsWith('s')) return (Number.parseFloat(time) || 0) * 1000;
			return Number.parseFloat(time) || 0;
		});
	}

	_classes(animation) {
		const values = Array.isArray(animation) ? animation : [animation];
		return [...new Set(values.flatMap(value => (
			typeof value === 'string' ? value.trim().split(/\s+/) : []
		)).filter(Boolean))];
	}

	_isKeyframes(animation) {
		if (!animation || typeof animation !== 'object') return false;
		if (!Array.isArray(animation)) return true;
		return animation.some(value => value && typeof value === 'object');
	}

	_assertElement(element, method) {
		if (!element || typeof element.addEventListener !== 'function') {
			throw new TypeError(`MotionManager.${method}: element должен быть DOM-элементом`);
		}
	}
}
