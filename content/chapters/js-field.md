# Поведение полей: FieldManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Делегирует клики по `[data-field-type]`. Встроены числовой шаг и копирование текста. Обработчики `search` и `date` только пишут сообщение в консоль — поиска и календаря в них нет.

## Числовое поле

```html
<div class="core-input-box core-row core-nowrap" data-field-type="number">
  <button type="button" class="core-button" data-field-num-minus aria-label="Уменьшить">−</button>
  <input class="core-input" type="number" min="0" max="20" step="1"
         value="2" data-field-value aria-label="Количество">
  <button type="button" class="core-button" data-field-num-plus aria-label="Увеличить">+</button>
</div>
<script type="module">
  import FieldManager from 'https://cdn.sdelal.tech/core/latest/field.js';
  const fields = new FieldManager();
</script>
```

Это **не singleton**. Достаточно одного экземпляра на документ; иначе каждый клик обработается несколько раз. Глобальная ссылка на экземпляр не создаётся.

`data-field-num-minus/plus` изменяют значение на `step`; варианты `-minus-10x/-plus-10x` — на десять шагов. Учитываются `min/max`; пустое/нечисловое значение считается нулём. `data-field-num-zero-clear` ставится на input и очищает его, если результат равен нулю. После изменения отправляется всплывающее событие `input`, не `change`.

Кнопки сами не учитывают `readonly`/`disabled` поля. Отключайте и кнопки, если изменение запрещено.

## Копирование

Для `data-field-type="text"` или `"textarea"` нужны потомок `[data-field-value]` и кнопка `[data-field-copy]`. Берётся `value`, а при его отсутствии — `textContent`.

Встроенный обработчик вызывает Clipboard API без ожидания результата и обработки отказа. Поэтому его анимация не доказывает, что текст скопирован. Для надёжного подтверждения переопределите обработчик и используйте `await navigator.clipboard.writeText(...)` с `try/catch` в приложении.

## API

- `registerHendler(type, handler)` регистрирует `(element, event)`. **В API именно `Hendler`, не `Handler`.**
- `setDefaultHandlers()` возвращает Map встроенных обработчиков.
- `showTooltip(element, text, position = 'top')`.
- `showTooltipTimeout(element, text, timeout = 1000, position = 'top')`.
- `hideTooltip(element)`.
- `destroy()` снимает глобальный click-слушатель и очищает обработчики.

```js
fields.registerHendler('custom', (element, event) => {
  if (!event.target.closest('[data-custom-action]')) return;
  element.dispatchEvent(new CustomEvent('app:field-action', { bubbles: true }));
});
```

## Настройки и ограничения

Конструктор принимает `fieldAttr`, `fieldNumAttrs`, `fieldAttrs`, `fieldTooltip`. Вложенные настройки заменяются целиком. В копировании часть селекторов записана жёстко (`data-field-copy`, `data-field-value`), поэтому переименование настроек не меняет весь контракт.

Tooltip-методы выставляют `data-tooltip` и классы `core-tooltip-*`. **Соответствующий CSS в этой сборке закомментирован**: готовую видимую подсказку они не обеспечивают. Таймеры анимаций и подсказок не отменяются через `destroy()`.

### E77. Количество с ограничениями

Шаг 2, диапазон 0–20. Кнопки обрабатывает FieldManager, итоговую сумму обновляет приложение по событию input.

```html
<div class="core-card core-col core-g-6x">
  <label for="quantity" class="core-text core-text-bold">Количество лицензий</label>
  <div class="core-input-box core-row core-nowrap" data-field-type="number">
    <button type="button" class="core-button" data-field-num-minus aria-label="Уменьшить">−</button>
    <input id="quantity" class="core-input" type="number" min="0" max="20" step="2" value="2" data-field-value>
    <button type="button" class="core-button" data-field-num-plus aria-label="Увеличить">+</button>
  </div>
  <output id="total" class="core-text" for="quantity" aria-live="polite"></output>
</div>
```

```js
import FieldManager from 'https://cdn.sdelal.tech/core/latest/field.js';
const fields = new FieldManager();
const quantity = document.getElementById('quantity');
const render = () => {
  document.getElementById('total').textContent = `Итого: ${Number(quantity.value) * 1200} ₽`;
};
quantity.addEventListener('input', render);
render();
// При удалении компонента: quantity.removeEventListener('input', render); fields.destroy();
```

<!-- demo:E77 -->

**Источник:** [field.js](https://cdn.sdelal.tech/core/latest/field.js), проверенная версия и SHA-256 — в [манифесте](../reference/source-manifest.json); при обновлении байты модуля не изменились.

## Совместимость с текущим CSS

Копирование пустого значения добавляет `core-shake`, которого больше нет в текущем CSS. Успешное копирование добавляет `core-pulsing`, которого в проверенном CSS также нет. Эти имена зашиты в обработчик; обещать видимую анимацию нельзя. Сам Clipboard API и его ограничения остаются прежними. Для собственного подтверждения используйте обработку результата и доступный текст статуса, как в кнопках копирования мануала.
