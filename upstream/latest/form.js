
/**
 * FormManager
 *
 * Подробная инструкция для новых пользователей по использованию FormManager.
 *
 * Кратко
 * -----
 * FormManager управляет формами на странице, собирает данные, сохраняет их
 * в localStorage/cookie, обрабатывает события ввода и отправки (submit),
 * поддерживает возможность перехвата отправки через подписчиков и показывает
 * состояние загрузки. Экземпляр использует глобальный EventEmitter, если он
 * доступен в window.EventEmitter.
 *
 * Как подключить
 * -------------
 * - Импортировать и создать экземпляр:
 *     import FormManager from './js/form.js';
 *     const fm = new FormManager();
 *
 * - FormManager использует singleton-паттерн: повторный new вернёт уже
 *   существующий экземпляр; экземпляр также доступен как window.FormManager
 *   после создания.
 *
 * HTML-разметка (пример)
 * ----------------------
 * - Отмечайте форму атрибутом data-form и давайте ей уникальный id:
 *
 * <form id="myForm" data-form data-form-submit="/api/save" data-form-save>
 *   <input name="email" type="email" />
 *   <input name="agree" type="checkbox" value="on" />
 *   <button type="submit">Отправить</button>
 * </form>
 *
 * Поля:
 * - Любое поле input/select/textarea будет обработано; для checkbox — возвращается
 *   значение или null, для radio — значение выбранной радиокнопки в группе.
 * - Для скрытых полей (type="hidden") сохраняется значение или null.
 * - Кнопки (button, submit, reset) игнорируются при сборе данных.
 *
 * Важные атрибуты (cfg по умолчанию)
 * ---------------------------------
 * - data-form (cfg.formAttr) — пометка формы для автоматической регистрации.
 * - data-form-silent (cfg.silentAttr) — если указан, FormManager не будет эмитить
 *     уведомления об изменениях (formChange/fieldChange).
 * - data-form-temp (cfg.tempAttr) — если указан, данные формы не сохраняются в localStorage.
 * - data-form-submit (cfg.submitAttr) — URL или путь, по которому отправлять форму.
 * - data-form-overlay (cfg.loadingOverlayAttr) — внутри формы может быть элемент
 *     с этим атрибутом, он будет показан/скрыт при отправке.
 * - data-field-private — пометить поле как приватное (пароль или чувствительные данные).
 *
 * Конфигурация конструктора (cfg)
 * -------------------------------
 * new FormManager({
 *   formAttr: 'data-form',
 *   silentAttr: 'data-form-silent',
 *   tempAttr: 'data-form-temp',
 *   submitAttr: 'data-form-submit',
 *   loadingOverlayAttr: 'data-form-overlay',
 *   loadingClass: 'core-loading',
 *   loadingOverlayClass: 'core-loading-overlay',
 *   timeout: 5000
 * });
 *
 * Основные публичные методы
 * -------------------------
 * - autoInit(): сканирует страницу и регистрирует все формы с атрибутом cfg.formAttr.
 * - registerForm(formId): регистрирует форму по id — добавляет обработчики и
 *     восстанавливает сохранённые данные из localStorage.
 * - collectFormData(formId, includePrivate = false): асинхронно собирает данные формы
 *     и возвращает массив объектов {id, type, name, value, required, disabled, private}.
 *     Параметр includePrivate управляет включением приватных полей (data-field-private или type=password).
 * - submit(formId): собирает данные (includePrivate=true) и отправляет их на URL,
 *     указанный в data-form-submit. Перед отправкой вызывает подписчиков события
 *     `formBeforeSubmit:${formId}` и ждёт их подтверждения.
 * - toggleFormFieldsState(formId, disable=true): блокирует/разблокирует поля формы
 *     и отображает/скрывает индикатор загрузки (overlay или CSS классы).
 * - destroy(): снимает обработчики и очищает внутреннее состояние.
 *
 * События и взаимодействие через EventEmitter
 * -------------------------------------------
 * (FormManager использует `this.emitter = window.EventEmitter || null`)
 *
 * - formChange:{formId} — эмитится при изменении данных формы. payload: { formId, data }
 * - fieldChange:{formId}:{fieldName} — эмитится при изменении отдельного поля.
 *     Если поле приватное, в payload поле data будет равно null и флаг private=true.
 * - formBeforeSubmit:{formId} — вызывается перед отправкой; FormManager использует
 *     emitWithAsyncResponse у EventEmitter и ждёт ответов подписчиков. Подписчики
 *     должны вернуть "accept" чтобы разрешить отправку. Если любой подписчик
 *     вернёт reject/не ответит в течение cfg.timeout — отправка отменяется.
 * - formSubmitResponse:{formId} — эмитится после попытки отправки с payload {formId, status: 'success'|'error', data|error}
 *
 * Пример подписчика перед отправкой
 * ---------------------------------
 * fm.on(`formBeforeSubmit:myForm`, async ({ formId, data }) => {
 *   // Асинхронная валидация, проверка на сервере и т.д.
 *   if (data.email && data.email.endsWith('@example.com')) return 'accept';
 *   return 'reject';
 * });
 *
 * Пример использования
 * -------------------
 * // Инициализация (автоматически найдёт все [data-form])
 * const fm = new FormManager();
 *
 * // Явная регистрация
 * fm.registerForm('myFormId');
 *
 * // Подписка на изменения формы
 * fm.on('formChange:myFormId', ({ formId, data }) => console.log('form changed', data));
 * fm.on('fieldChange:myFormId:email', ({ field, data }) => console.log('email changed', data));
 *
 * // Программная отправка
 * await fm.submit('myFormId');
 *
 * Особенности и примечания
 * ------------------------
 * - Данные формы сохраняются в localStorage под ключом `formData-{formId}`.
 *   Если форма отмечена `data-form-temp`, сохранение не выполняется.
 * - Приватные поля (data-field-private или type=password) по умолчанию при
 *   сборе не возвращают реального значения, если includePrivate=false; при
 *   includePrivate=true возвращается значение (перед отправкой).
 * - Для предотвращения гонок при быстрых вводах используется lastInputRequestId:
 *   только последний запрос обновит данные формы.
 * - При изменении формы, если форма не помечена silent (data-form-silent),
 *   FormManager эмитит события об изменении.
 * - Для массового или критичного изменения логики (например, хеширование паролей)
 *   есть закомментированные места в коде, где можно включить шифрование/хеширование.
 *
 * Безопасность
 * ------------
 * - Не храните в localStorage чувствительные данные (пароли/токены). FormManager
 *   не шифрует значения по умолчанию. Используйте data-field-private для полей,
 *   которые не должны передаваться подписчикам при простом оповещении.
 *
 * Если нужно, могу:
 * - добавить пример в README.md с полной разметкой и стилями для overlay/loading,
 * - включить опциональное хеширование паролей или pluggable hooks для фильтрации данных.
 */
export default class FormManager {



	// SECTION: constructor()

	constructor(options = {}) {
		// Получаем emitter при каждом создании экземпляра
		this.emitter = window.EventEmitter || null;
		if (!this.emitter) {
			console.warn('[FormManager] window.EventEmitter не найден, логика подписчиков не работает. Когда он будет создан, сделайте .autoInit(), затем .on()');
		}

		if (FormManager._instance) {
			FormManager._instance.emitter = this.emitter;
			return FormManager._instance;
		}

		this.cfg = Object.assign({
			formAttr: 'data-form',
			silentAttr: 'data-form-silent',
			tempAttr: 'data-form-temp',
			submitAttr: 'data-form-submit',
			loadingOverlayAttr: 'data-form-overlay',
			loadingClass: 'core-loading',
			loadingOverlayClass: 'core-loading-overlay',
			timeout: 5000,
		}, options);

		this.forms = new Map();

		this.autoInit();

		FormManager._instance = this;
	}


	
	// !SECTION
	// SECTION: Подписчики

	/**
	 * Подписывается на указанный тип события.
	 * 
	 * @param {string} event - Имя события, на которое необходимо подписаться.
	 * @param {Function} callback - Функция-обработчик, вызываемая при возникновении события.
	 * @returns {Object} Ссылка на объект подписки или результат метода on эмиттера.
	 */
	on(event, callback) {
		if (!this.emitter) return;
		return this.emitter.on(event, callback);
	}

	/**
	 * Отписывает обработчик от указанного события.
	 *
	 * @param {string} event - Имя события, от которого необходимо отписаться.
	 * @param {Function} callback - Функция-обработчик, которую нужно удалить.
	 */
	off(event, callback) {
		if (!this.emitter) return;
		this.emitter.off(event, callback);
	}

	/**
	 * Вызывает событие, уведомляя всех подписчиков с стэк эмиттера.
	 * 
	 *
	 * @param {string} event - Имя события, которое необходимо вызвать.
	 * @param {...any} args - Аргументы, передаваемые слушателям события.
	 */
	emit(event, ...args) {
		if (!this.emitter) return;
		this.emitter.emit(event, ...args);
	}

	/**
	 * Мгновенно вызывает события, уведомляя всех подписчиков, игонорируя стэк эмиттера.
	 *
	 * @param {string} event - Имя события, которое необходимо вызвать.
	 * @param {...any} args - Аргументы, передаваемые обработчикам события.
	 */
	emitImmediate(event, ...args) {
		if (!this.emitter) return;
		this.emitter.emitImmediate(event, ...args);
	}



	// !SECTION
	// SECTION: Регистрация

	/**
	 * Автоматически инициализирует все формы на странице, имеющие атрибут [data-form].
	 * Для каждой найденной формы регистрирует её с помощью метода registerForm,
	 * используя значение id элемента в качестве идентификатора.
	 *
	 * @returns {string} Строка с количеством инициализированных форм.
	 */
	async autoInit() {
		// Проверяем и обновляем emitter при каждом вызове autoInit
		this.emitter = window.EventEmitter || null;
		if (this._instance) {
			this._instance.emitter = this.emitter;
		}
		// Сохраняем все промисы регистрации
		const formPromises = [];

		for (const formDOM of document.querySelectorAll(`[${this.cfg.formAttr}]`)) {
			const id = formDOM.id;
			if (id) formPromises.push(this.registerForm(id));
		}

		await Promise.all(formPromises);

		return "Новые формы:  " + this.forms.size;
	}

	async refresh() {
		this.autoInit();
	}


	/**
	 * Регистрирует форму по заданному идентификатору, инициализирует обработчики событий,
	 * восстанавлиет данные из localStorage (если есть) и обновляет внутренние данные формы.
	 *
	 * @async
	 * @param {string} formId - Идентификатор формы (значение атрибута id).
	 * @throws {Error} Если форма с указанным идентификатором не найдена в DOM.
	 */
	async registerForm(formId) {
		const formDOM = document.querySelector(`[${this.cfg.formAttr}]#${formId}`);
		if (!formDOM) throw new Error(`Форма ${formId} не найдена.`);

		const formHandlers = {
			input: this.#_debounce(e => this.#_handleInput(e), 200),
			submit: e => this.#_handleSubmit(e)
		};

		this.forms.set(formId, {
			DOM: formDOM,
			silent: formDOM.hasAttribute(this.cfg.silentAttr),
			temp: formDOM.hasAttribute(this.cfg.tempAttr),
			isWaiting: false,
			data: [],
			submit: formDOM.getAttribute(this.cfg.submitAttr) || formDOM.getAttribute('action') || null,
			handlers: formHandlers
		});

		// Создает слушатель события input и submit для формы
		this.#_initFormHandlers(formId);

		// Восстанавливаем данные из localStorage, если они существуют
		await this.#_restoreFormData(formId);

		// Обновляем данные формы после восстановления
		this.forms.get(formId).data = await this.collectFormData(formId);
	}



	// !SECTION
	// SECTION: Хранение данных

	/**
	 * Сохраняет данные формы с указанным идентификатором в localStorage и cookie на 100 лет.
	 *
	 * @param {string} formId - Уникальный идентификатор формы, данные которой необходимо сохранить.
	 */
	#_saveFormData(formId) {
		const formData = this.forms.get(formId).data;

		// Фильтруем поля с пустыми значениями (null, undefined, пустая строка)
		const filteredData = formData
			.filter(field => field.value !== null && field.value !== undefined && field.value !== "")
			.map(field => ({
				// id: field.id,
				name: field.name,
				value: field.value
			}));

		// Сохраняем данные формы в localStorage
		localStorage.setItem(`formData-${formId}`, JSON.stringify(filteredData));

		// Сохраняем в cookie
		try {
			// 5 лет = 157680000 секунд
			document.cookie = `formData-${formId}=${encodeURIComponent(JSON.stringify(filteredData))}; path=/; max-age=157680000`;
		} catch (e) {
			console.warn('cookie не сохранен:', e);
		}
	}


	/**
	 * Очищает сохранённые данные формы из localStorage по заданному идентификатору формы.
	 *
	 * @param {string} formId - Уникальный идентификатор формы, данные которой необходимо удалить.
	 */
	#_clearSavedFormData(formId) {
		// Удаляем данные формы из localStorage
		localStorage.removeItem(`formData-${formId}`);
		
		// Удаляем cookie с тем же именем
		document.cookie = `formData-${formId}=; path=/; max-age=0`;
	}

	
	/**
	 * Восстанавливает данные формы из localStorage по заданному идентификатору формы.
	 * Если форма помечена как временная (temp), сохранённые данные очищаются.
	 * Если сохранённые данные найдены и успешно распарсены, значения полей формы восстанавливаются.
	 *
	 * @param {string} formId - Уникальный идентификатор формы, для которой требуется восстановить данные.
	 */
	#_restoreFormData(formId) {
		const formInstance = this.forms.get(formId);
		if (!formInstance || formInstance.temp) {
			if (formInstance && formInstance.temp) this.#_clearSavedFormData(formId);
			return;
		}

		const stored = localStorage.getItem(`formData-${formId}`);
		if (!stored) return;

		let savedData;
		try {
			savedData = JSON.parse(stored);
		} catch (err) {
			console.error(`localstorage не парсится ${formId}:`, err);
			return;
		}

		const formDOM = formInstance.DOM;
		savedData.forEach(field => {
			const fieldDOM = formDOM.querySelector(`[name="${field.name}"]`);
			if (fieldDOM) this.#_updateFieldValue(fieldDOM, field.value, formDOM);
		});
	}


	/**
	 * Обновляет значение поля формы в DOM в зависимости от его типа.
	 *
	 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} fieldDOM - DOM-элемент поля формы.
	 * @param {string|null} fieldValue - Значение, которое необходимо установить в поле.
	 * @param {HTMLElement} [formDOM] - DOM-элемент формы, необходим для поиска радиокнопок с одинаковым именем.
	 */
	#_updateFieldValue(fieldDOM, fieldValue, formDOM) {
		if (!fieldDOM) return;
		switch (fieldDOM.type) {
			case 'checkbox':
				fieldDOM.checked = (fieldValue === "on" || fieldValue === fieldDOM.value);
				break;
			case 'radio':
				if (fieldDOM.name && formDOM && formDOM.querySelectorAll) {
					const radios = formDOM.querySelectorAll(`input[type="radio"][name="${fieldDOM.name}"]`);
					radios.forEach(radio => radio.checked = fieldValue !== null && radio.value === fieldValue);
				}
				break;
			default:
				fieldDOM.value = fieldValue || "";
		}
	}



	// !SECTION
	// SECTION: Сбор данных

	/**
	 * Асинхронно собирает данные из формы по заданному идентификатору.
	 *
	 * @param {string} formId - Идентификатор формы, из которой необходимо собрать данные.
	 * @param {boolean} [includePrivate=false] - Включать ли приватные поля в сбор данных.
	 * @returns {Promise<Array>} Массив данных, собранных из полей формы.
	 * @throws {Error} Если форма с указанным идентификатором не найдена.
	 */
	async collectFormData(formId, includePrivate = false) {
		const formObj = this.forms.get(formId);
		const formDOM = formObj?.DOM;
		if (!formDOM?.querySelectorAll) throw new Error(`Форма ${formId} не найдена`);

		const fields = Array.from(formDOM.querySelectorAll('input, select, textarea'));
		const processedRadios = new Set();

		const fieldData = await Promise.all(
			fields.map(field => {
				if (!field) return null;
				return this.#_processField(field, formDOM, processedRadios, includePrivate);
			})
		);

		// Фильтруем null значения (например, для уже обработанных радиокнопок)
		const filteredFieldData = fieldData.filter(field => field !== null);

		const result = filteredFieldData;

		return result;
	}


	/**
	 * Обрабатывает отдельное поле формы, извлекая его значения и свойства.
	 * При необходимости шифрует значение (например, для паролей).
	 *
	 * @async
	 * @param {HTMLElement} fieldDOM - DOM-элемент поля формы.
	 * @param {HTMLElement} formDOM - DOM-элемент всей формы.
	 * @param {Set} processedRadios - Множество уже обработанных радиокнопок для предотвращения дублирования.
	 * @param {boolean} includePrivate - Флаг, указывающий, включать ли приватные поля (например, пароли) в результат.
	 * @returns {Promise<Object|null>} Объект с данными поля (id, type, name, value, required, disabled, private) или null в случае ошибки при шифровании.
	 */
	async #_processField(fieldDOM, formDOM, processedRadios, includePrivate) {
		if (!fieldDOM) return null;
		const { id, type, name, required, disabled } = fieldDOM;
		const isPrivate = fieldDOM.hasAttribute && (fieldDOM.hasAttribute('data-field-private') || type === 'password');

		let value = this.#_getFieldValue(fieldDOM, formDOM, processedRadios);

		if (value === undefined) {
			return null; // Игнорируем уже обработанные радиокнопки
		}

		// Шифруем только если поле приватно
		// if (isPrivate) {
		//     try {
		//         // value = await this._hashString(value);
		//     } catch (error) {
		//         console.error('Ошибка при хэшировании пароля:', error);
		//         return null;
		//     }
		// }

		if (isPrivate && !includePrivate) {
			value = null;
		}

		return { id, type, name, value, required, disabled, private: isPrivate };
	}


	/**
	 * Возвращает значение поля формы в зависимости от его типа.
	 *
	 * @param {HTMLElement} formFieldDOM - DOM-элемент поля формы.
	 * @param {HTMLElement} formDOM - DOM-элемент всей формы, содержащей поле.
	 * @param {Set<string>} processedRadios - Множество имён радиогрупп, которые уже были обработаны (для предотвращения дублирования).
	 * @returns {string|null|undefined} Значение поля формы:
	 *   - Для checkbox: значение, если отмечен, иначе null.
	 *   - Для radio: значение выбранной радиокнопки в группе, иначе null; undefined, если группа уже обработана.
	 *   - Для select, hidden и других: значение поля или null, если оно отсутствует.
	 *   - Для button, submit, reset: undefined.
	 */
	#_getFieldValue(formFieldDOM, formDOM, processedRadios) {
		if (!formFieldDOM) return undefined;
		switch (formFieldDOM.type) {
			case 'checkbox':
				return formFieldDOM.checked ? (formFieldDOM.value || "on") : null;

			case 'radio':
				if (formFieldDOM.name) {
					if (processedRadios.has(formFieldDOM.name)) {
						return undefined; // Пропускаем уже обработанную группу
					}
					processedRadios.add(formFieldDOM.name);
					// Ищем выбранную радиокнопку внутри всей формы, а не только внутри label
					if (!formDOM || !formDOM.querySelector) return null;
					const checked = formDOM.querySelector(`input[type="radio"][name="${formFieldDOM.name}"]:checked`);
					return checked ? checked.value : null;
				} else {
					return formFieldDOM.checked ? formFieldDOM.value : null;
				}

			case 'select':
				if (formFieldDOM.multiple) {
					return Array.from(formFieldDOM.selectedOptions).map(opt => opt.value);
				}
				return formFieldDOM.value;

			case 'button':
			case 'submit':
			case 'reset':
				return undefined;

			case 'hidden':
				return formFieldDOM.value || null;

			default:
				return formFieldDOM.value || null;
		}
	}


	/**
	 * Асинхронно вычисляет SHA-256 хэш для переданной строки пароля.
	 *
	 * @param {string} password - Строка пароля, которую необходимо захешировать.
	 * @returns {Promise<string>} Хэш пароля в виде шестнадцатеричной строки.
	 */
	// async _hashString(password) {
	//     const encoder = new TextEncoder();
	//     const data = encoder.encode(password);
	//     const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
	//     const hashArray = Array.from(new Uint8Array(hashBuffer));
	//     return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
	// }



	// !SECTION
	// SECTION: Обработчики

	/**
	 * Инициализирует обработчики событий для формы с указанным идентификатором.
	 * Добавляет обработчики событий 'input' и 'submit' к DOM-элементу формы,
	 * если форма и необходимые обработчики существуют.
	 *
	 * @param {string} formId - Идентификатор формы, для которой необходимо установить обработчики.
	 */
	#_initFormHandlers(formId) {
		const formInstance = this.forms.get(formId);
		if (!formInstance || !formInstance.DOM || !formInstance.handlers) return;

		if (formInstance.DOM.addEventListener) {
			formInstance.DOM.addEventListener('input', formInstance.handlers.input);
			formInstance.DOM.addEventListener('submit', formInstance.handlers.submit);
		}
	}


	/**
	 * Удаляет обработчики событий формы по её идентификатору.
	 *
	 * @param {string} formId - Идентификатор формы, для которой необходимо удалить обработчики событий.
	 */
	#_removeFormInteraction(formId) {
		const formInstance = this.forms.get(formId);
		if (!formInstance || !formInstance.DOM || !formInstance.handlers) return;
		
		if (formInstance.DOM.removeEventListener) {
			formInstance.DOM.removeEventListener('input', formInstance.handlers.input);
			formInstance.DOM.removeEventListener('submit', formInstance.handlers.submit);
		}
	}



		//// SECTION: input, change

		/**
		 * Обрабатывает событие ввода в форму.
		 * 
		 * Асинхронно собирает новые данные формы при каждом вводе пользователя, 
		 * сравнивает их с текущими данными и обновляет состояние формы только при изменениях.
		 * Для приватных полей сразу отправляет уведомление об изменении, не сохраняя данные.
		 * Для остальных полей сохраняет изменения в localStorage (если форма не временная) 
		 * и уведомляет подписчиков, если форма не находится в "тихом" режиме.
		 * 
		 * Использует идентификатор запроса для предотвращения гонки данных при быстрых вводах.
		 * 
		 * @param {Event} e - Событие ввода (input), инициированное пользователем в форме.
		 * @throws {Error} Если экземпляр формы с указанным id не найден.
		 */
		async #_handleInput(e) {
			const formDOM = e.currentTarget;
			const formId = formDOM.id;
			const inputDOM = e.target;
			const fieldName = inputDOM.name;
			
			const formInstance = this.forms.get(formId);
			if (!formInstance || !formInstance.DOM) throw new Error(`Форма ${formId} не найдена`);

			// Добавляем идентификатор запроса для отслеживания самого последнего запроса
			const requestId = Date.now();
			formInstance.lastInputRequestId = requestId;
			
			// Собираем данные формы
			const newFormData = await this.collectFormData(formId, false);

			// Проверяем, является ли этот ввод все еще самым последним запросом
			if (formInstance.lastInputRequestId !== requestId) {
				return; // Появился более новый запрос, этот игнорируем
			}
			
			// Получаем текущие данные формы, чтобы затем сравнить их со свежими
			const formData = formInstance.data;

			const changedField = newFormData.find(f => f.name === fieldName);
			if (changedField && changedField.private) {
				// Если изменено приватное поле, то отправляем уведомление сразу 
				// и выходим из функции, не обновляя данные формы
				if (!formInstance.silent) this.emitFormChange(formId, fieldName);
				return;
			} else {
				// Если изменено не приватное поле, то проверяем на изменения
				// Если данные не изменились, то выходим из функции
				if (this.#_deepEqual(formData, newFormData)) 
				return;
			}
			
			// Заменяем данные формы на новые
			formInstance.data = newFormData;

			// Сохраняем актуальные данные в localStorage, если форма не временная
			if (!formInstance.temp) this.#_saveFormData(formId);

			// Уведомление подписчиков только если форма не silent
			if (!formInstance.silent) this.emitFormChange(formId, fieldName);
		}


		/**
		 * Сравнивает два объекта на глубокое равенство.
		 * Корректно работает с массивами и объектами, не зависит от порядка ключей.
		 *
		 * @param {Object} obj1 - Первый объект для сравнения.
		 * @param {Object} obj2 - Второй объект для сравнения.
		 * @returns {boolean} Возвращает true, если объекты идентичны, иначе false.
		 */
		#_deepEqual(obj1, obj2) {
			if (obj1 === obj2) return true;

			if (typeof obj1 !== typeof obj2) return false;

			if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) return false;

			if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

			if (Array.isArray(obj1)) {
				if (obj1.length !== obj2.length) return false;
				// Сортируем массивы по JSON-строке каждого элемента для сравнения без учета порядка
				const sorted1 = [...obj1].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
				const sorted2 = [...obj2].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
				for (let i = 0; i < sorted1.length; i++) {
					if (!this.#_deepEqual(sorted1[i], sorted2[i])) return false;
				}
				return true;
			}

			const keys1 = Object.keys(obj1);
			const keys2 = Object.keys(obj2);
			if (keys1.length !== keys2.length) return false;

			const set2 = new Set(keys2);
			for (const key of keys1) {
				if (!set2.has(key)) return false;
				if (!this.#_deepEqual(obj1[key], obj2[key])) return false;
			}
			return true;
		}


		/**
		 * Генерирует событие изменения формы или отдельного поля формы.
		 *
		 * @param {string} formId - Идентификатор формы.
		 * @param {string|null} [fieldName=null] - Имя поля, для которого произошло изменение. Если не указано, уведомляются только подписчики всей формы.
		 * @throws {Error} Если форма с указанным идентификатором не найдена.
		 *
		 * @description
		 * Уведомляет подписчиков о изменении всей формы или конкретного поля.
		 * Если поле является приватным, данные поля не передаются подписчикам.
		 */
		emitFormChange(formId, fieldName = null) {
			if (!this.emitter) return;
			const form = this.forms.get(formId);
			if (!form) throw new Error(`Форма ${formId} не зарегистрирована`);

			// Уведомление подписчиков на изменение всей формы
			this.emitter.emit(`formChange:${formId}`, {
				formId: formId,
				data: form.data,
			});

			// Уведомление подписчиков на изменение конкретного поля
			const fieldData = form.data.find(f => f.name === fieldName) || null;

			// Если поле приватное, то уведомляем подписчиков, но не передаем данные
			if (fieldData && fieldData.private) {
				this.emitter.emit(`fieldChange:${formId}:${fieldName}`, {
					field: fieldName,
					formId: formId,
					data: null,
					private: true,
				});
				return;
			}

			// Уведомление подписчиков на изменение конкретного поля
			this.emitter.emit(`fieldChange:${formId}:${fieldName}`, {
				field: fieldName, 
				formId: formId,
				data: fieldData
			});
		}



		//// !SECTION
		//// SECTION: submit

		/**
		 * Обрабатывает событие отправки формы, вызванное клиентом нажатием кнопки submit.
		 * 
		 * @async
		 * @param {Event} e - Событие отправки формы.
		 * @throws {Error} Если форма с указанным id не найдена.
		 * @description
		 * Предотвращает стандартное поведение отправки формы, собирает данные формы,
		 * и отправляет их с помощью метода submit. В случае ошибки отправки выводит ошибку в консоль.
		 */
		async #_handleSubmit(e) {
			// e — содержит ссылку на форму, которая инициировала событие submit
			const formId = e.currentTarget.id;
			const form = this.forms.get(formId);
			if (!form) throw new Error(`Форма ${formId} не найдена`);

			e.preventDefault();
			
			try {
				await this.submit(formId);
			} catch (error) {
				console.error('Ошибка отправки:', error);
			}
		}


		/**
		 * Асинхронно отправляет данные формы и обрабатывает ответ.
		 * Позволяет отправлять данные не только форм, но и любых контейнеров с [data-form].
		 *
		 * @async
		 * @param {string} formId - Идентификатор формы, которую необходимо отправить.
		 * @param {Object} formData - Данные формы для отправки.
		 * 
		 * @description
		 * Выполняет отправку данных формы на указанный в data-form-submit путь (если он задан).
		 * Блокирует поля формы на время отправки, уведомляет подписчиков о результате отправки,
		 * а также ожидает ответа от подписчиков события. В случае ошибки отправки или получения ответа
		 * от подписчиков, логирует ошибку и уведомляет подписчиков о неудаче.
		 */
		async submit(formId) {
			const formInstance = this.forms.get(formId);
			if (!formInstance || !formInstance.DOM) throw new Error(`Форма ${formId} не найдена`);

			// Сохраняем ссылку на submit action, если он указан
			const submitAction = formInstance.submit;

			// Собираем данные полей формы
			const formData = await this.collectFormData(formId, true);

			// Блокируем форму на время ожидания ответа
			this.toggleFormFieldsState(formId, true);

			// Если есть хотя бы один слушатель на событие formBeforeSubmit, 
			// то уведомляем их и ожидаем подтверждения или отклонения
			// Если ни один подписчик не ответил по истечению таймера timeout, то форма не отправится
			if (
				this.emitter &&
				this.emitter.listeners &&
				typeof this.emitter.listenerCount === 'function' &&
				this.emitter.listeners.size &&
				this.emitter.listenerCount(`formBeforeSubmit:${formId}`) > 0
			) {
				const proceed = await this.#_handleBeforeSubmit(formId, formData, this.cfg.timeout);
				if (!proceed) {
					this.toggleFormFieldsState(formId, false);
					return;
				}
			}
			
			formInstance.isWaiting = true;
			try {
				if (submitAction) {
					try {
						const response = await fetch(submitAction, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(formData)
						});
						const data = await response;
						if (this.emitter) {
							this.emitter.emit(`formSubmitResponse:${formId}`, { 
								formId: formId,
								status: 'success',
								data
							});
						}
						this.toggleFormFieldsState(formId, false);
					}
					catch (error) {
						if (this.emitter) {
							this.emitter.emit(`formSubmitResponse:${formId}`, {
								formId: formId,
								status: 'error',
								error: error.message,
								errorStack: error.stack,
							});
						}
						this.toggleFormFieldsState(formId, false);
					}
				}
			} finally {
				formInstance.isWaiting = false;
			}
		}


		/**
		 * Асинхронно обрабатывает событие "beforeSubmit" для формы с заданным идентификатором.
		 * 
		 * Метод отправляет событие подписчикам через emitter и ожидает их ответа в течение указанного времени.
		 * Если хотя бы один из подписчиков не ответил "accept" или произошла ошибка/таймаут, возвращает false.
		 * 
		 * @async
		 * @param {string} formId - Уникальный идентификатор формы, для которой инициируется событие.
		 * @param {Object} formData - Данные формы, которые будут переданы подписчикам.
		 * @param {number} [timeout=3000] - Максимальное время ожидания ответа подписчиков в миллисекундах (по умолчанию 3000 мс).
		 * @returns {Promise<boolean>} Возвращает true, если все подписчики ответили "accept", иначе false.
		 * @throws {Error} В случае ошибки или истечения времени ожидания выводит ошибку в консоль и возвращает false.
		 * 
		 * 
		 * Структура подписчика для этого метода:
		 * 
		 * Подписчик должен подписаться на событие `formBeforeSubmit:${formId}` через emitter.on и вернуть Promise,
		 * который резолвится объектом вида:
		 * 
		 * {
		 *   status: "fulfilled", // или "rejected"
		 *   value: "accept"      // или любое другое значение для отказа
		 * }
		 * 
		 * Пример подписчика:
		 * 
		 * formManager.on(`formBeforeSubmit:myFormId`, async ({ formId, data }) => {
		 *   // Валидация или асинхронная проверка
		 *   if (data.someField === "bad") {
		 *     return "reject";
		 *   }
		 *   return "accept";
		 * });
		 * 
		 * Все подписчики должны вернуть "accept" (или Promise, который резолвится в "accept"),
		 * чтобы форма была отправлена.
		 */
		async #_handleBeforeSubmit(formId, formData, timeout = this.cfg.timeout) {
			if (!this.emitter) return false;
			try {
				let timeoutId;

				const timeoutPromise = new Promise((_, reject) => {
					timeoutId = setTimeout(() => {
						reject(new Error('[FormHandler] Время подписчиков истекло'));
					}, timeout);
				});

				const subscriberPromise = this.emitter.emitWithAsyncResponse(`formBeforeSubmit:${formId}`, {
					formId: formId,
					data: formData,
				});

				const results = await Promise.race([
					subscriberPromise.then(res => {
						clearTimeout(timeoutId);
						return res;
					}),
					timeoutPromise
				]);

				return results.every(result => result.status === 'fulfilled' && result.value === 'accept');
			} catch (error) {
				return false;
			}
		}

		//// !SECTION



	// !SECTION 
	// SECTION: Иные методы

	/**
	 * Переключает состояние полей формы (включает или отключает их) по заданному идентификатору формы.
	 * Если в форме присутствует элемент с атрибутом [data-form-overlay], управляет его отображением.
	 * В противном случае добавляет или удаляет CSS-классы для отображения состояния загрузки.
	 *
	 * @param {string} formId - Идентификатор формы, состояние которой требуется изменить.
	 * @param {boolean} [disable=true] - Флаг, указывающий, нужно ли отключить (true) или включить (false) поля формы.
	 * @throws {Error} Если форма с указанным идентификатором не найдена.
	 */
	toggleFormFieldsState(formId, disable = true) {
		const formInstance = this.forms.get(formId);
		if (!formInstance || !formInstance.DOM) throw new Error(`Форма ${formId} не найдена`);

		const overlay = formInstance.DOM.querySelector && formInstance.DOM.querySelector(`[${this.cfg.loadingOverlayAttr}]`);

		if (overlay) {
			overlay.style.display = disable ? '' : 'none';
		} else if (formInstance.DOM.classList) {
			formInstance.DOM.classList.toggle(this.cfg.loadingOverlayClass, disable);
			formInstance.DOM.classList.toggle(this.cfg.loadingClass, disable);
		}
	}


	/**
	 * Создаёт функцию-декоратор, которая откладывает вызов переданной функции `fn` на указанный интервал времени `wait`.
	 * Если декорированная функция вызывается повторно до истечения времени ожидания, таймер сбрасывается.
	 * 
	 * Особенность: если первым аргументом является объект события, то в аргументах функции сохраняются только свойства `currentTarget` и `target`.
	 *
	 * @param {Function} fn - Функция, вызов которой необходимо "задебаунсить".
	 * @param {number} wait - Время ожидания в миллисекундах перед вызовом функции.
	 * @returns {Function} Декорированная функция с поддержкой debounce.
	 */
	#_debounce(fn, wait) {
		let timeout;
		return function(...args) {
			if (args[0] && args[0].currentTarget && args[0].target) {
				const event = args[0];
				args[0] = { currentTarget: event.currentTarget, target: event.target };
			}
			clearTimeout(timeout);
			timeout = setTimeout(() => fn.apply(this, args), wait);
		};
	}


	
	// !SECTION
	// SECTION destroy()

	/**
	 * Уничтожает все формы, удаляя связанные с ними взаимодействия и очищая внутреннее состояние.
	 * После вызова метода все формы будут удалены, а состояние менеджера сброшено.
	 * @returns {string} Сообщение о выключении FormManager.
	 */
	destroy() {
		this.forms.forEach((form, formId) => {
			this.#_removeFormInteraction(formId);
		});

		this.forms.clear();
		return "FormManager выключен";
	}

	// !SECTION
	
}

