# Формы: FormManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Собирает поля, публикует события, сохраняет черновик и умеет отправлять JSON. Не заменяет серверную валидацию, авторизацию и защиту запроса.

## Подключение

```html
<form id="request-form" data-form data-form-temp data-form-submit="/api/requests" class="core-col">
  <label class="core-col">
    <span class="core-text">Название</span>
    <input class="core-input" name="title" required>
  </label>
  <button class="core-button core-button-primary" type="submit">Отправить</button>
</form>
<script type="module">
  import EventEmitter from 'https://cdn.sdelal.tech/core/latest/event.js';
  import FormManager from 'https://cdn.sdelal.tech/core/latest/form.js';
  const events = new EventEmitter();
  const forms = new FormManager();
  forms.on('formSubmitResponse:request-form', async ({ status, data, error }) => {
    if (status === 'error') return console.error(error);
    if (!data.ok) return console.error(`HTTP ${data.status}`);
    try { console.log(await data.json()); }
    catch (error) { console.error('Ответ не является JSON', error); }
  });
</script>
```

`/api/requests` — endpoint приложения. Конструктор сам запускает асинхронную регистрацию. FormManager — singleton, но **`window.FormManager` не назначается**. EventEmitter нужен до создания менеджера.

## Разметка

Форма должна иметь `id` и `data-form`. Адрес берётся из `data-form-submit`, затем из `action`. Отправка всегда `POST` с `Content-Type: application/json`; `method` и `enctype` формы не определяют транспорт.

`data-form-temp` отключает сохранение и очищает старый черновик. Без него обычные значения сохраняются в localStorage под `formData-ID` и в одноимённой cookie со сроком 157680000 секунд. Восстановление читает localStorage. **Для обычных примеров используйте `data-form-temp`; сохранение включайте осознанно.**

`data-field-private` на поле и `type="password"` скрывают значение из черновика и обычного сбора. При отправке private-значения включаются. Это не шифрование и не защита от другого JavaScript страницы.

`data-form-silent` отключает события изменения, но не события отправки. Потомок `[data-form-overlay]` служит оверлеем; без него на форме переключаются `core-loading` и `core-loading-overlay`.

## API

- `autoInit()` → Promise: регистрирует формы с ID. `registerForm(id)` → Promise.
- `refresh()` запускает `autoInit`, но не ожидает его завершения.
- `collectFormData(id, includePrivate = false)` → Promise с массивом полей.
- `submit(id)` → Promise завершения обработки, **не Response**.
- `toggleFormFieldsState(id, disable = true)` переключает загрузочный оверлей, но не HTML `disabled` полей.
- `emitFormChange(id, fieldName = null)` отправляет события изменения.
- `on`, `off`, `emit`, `emitImmediate` передают вызовы EventEmitter; `on` возвращает отписку.
- `destroy()` снимает слушатели форм и очищает их Map.

Формат поля: `{ id, type, name, value, required, disabled, private }`. Checkbox отдаёт значение или `null`; radio — один результат на имя. Поля без name и disabled-поля не исключаются автоматически. Это **не объект `{ name: value }` и не FormData**.

## События

`formChange:ID` передаёт `{ formId, data }`; `fieldChange:ID:NAME` — `{ field, formId, data }`. У private-поля отдельное событие содержит `data: null, private: true`. Изменения обрабатываются после 200 мс без ввода, затем проходят через очередь EventEmitter.

`formBeforeSubmit:ID` передаёт `{ formId, data }` и `{ accept, reject }`. Все подписчики должны разрешить отправку; тайм-аут по умолчанию 5000 мс. Это тайм-аут **подписчиков**, не fetch.

```js
const off = forms.on('formBeforeSubmit:request-form', ({ data }, { accept, reject }) => {
  const title = data.find(field => field.name === 'title')?.value;
  if (typeof title === 'string' && title.trim()) accept();
  else reject();
});
```

`formSubmitResponse:ID` передаёт либо `{ formId, status: 'success', data: Response }`, либо `{ formId, status: 'error', error, errorStack }`. HTTP 400/500 сами по себе попадают в `success`: проверяйте `Response.ok`. Тело ответа не разобрано.

## Ограничения

Не вызывайте повторно `autoInit/registerForm` для той же формы: старые DOM-слушатели перед заменой записи не снимаются. `destroy()` не сбрасывает статический singleton и не отписывает события EventEmitter; отписки храните отдельно.

Прямой `submit(id)` не проверяет native validity и не блокирует повторный запрос через `isWaiting`. Без адреса отправки загрузочный оверлей может остаться включённым. Ошибки localStorage не везде перехвачены. Нативный `select[multiple]` не собирается в массив из-за проверки `type === 'select'`; загрузка File также не реализована.

Для загрузки файлов, специальных заголовков, отмены запроса или иного API используйте собственный submit-обработчик. Не создавайте FormManager для той же формы параллельно с ним.

**Источник:** [form.js](https://cdn.sdelal.tech/core/latest/form.js), архив `core.zip` от 20.09.2026.
