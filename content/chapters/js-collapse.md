# Раскрывающиеся блоки: CollapseManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Показывает и скрывает зарегистрированные блоки, управляет группами и при необходимости сохраняет состояние.

## Разметка и запуск

```html
<button type="button" class="core-button" data-collapse-toggle="details">Подробности</button>
<div id="details" data-collapse class="core-card core-hide">
  <p class="core-text">Содержимое раскрывающегося блока.</p>
  <button type="button" class="core-button" data-collapse-hide>Закрыть</button>
</div>
<script type="module">
  import CollapseManager from 'https://cdn.sdelal.tech/core/latest/collapse.js';
  const collapse = new CollapseManager();
</script>
```

Конструктор сам вызывает `autoInit()`. Это singleton, доступный как `window.CollapseManager`. Для прикладного управления сохраните экземпляр в модуле приложения.

## Атрибуты

На блоке: `data-collapse`, стабильный `id`, необязательные `data-collapse-group="group"` и `data-collapse-hide-class="class"`. Начальное скрытие задаёт `core-hide` либо выбранный hide-класс. Идентификатор регистрации выбирается из `id`, затем значения `data-collapse`, затем генерируется.

На кнопке: `data-collapse-show`, `data-collapse-hide`, `data-collapse-toggle`, `data-collapse-show-only`, `data-collapse-hide-only`. Значение — ID, имя группы или несколько целей через запятую, **без `#`**. При совпадении имени ID имеет приоритет над группой. Пустой `data-collapse-hide` закрывает ближайший блок со стабильным HTML `id`; остальные пустые действия не реализованы.

`data-collapse-show-only="a"` показывает `a` и скрывает остальных в его группе. В этой реализации `showOnly/hideOnly` **ничего не делают с блоком без группы**, вопреки комментарию в исходнике.

`data-collapse-hover` выполняет действие при наведении/фокусе, без обратного действия при уходе. `data-collapse-mouseon` выполняет действие при входе и обратное при выходе; `data-collapse-mouseover` — наоборот. Обычный click для этих триггеров пропускается.

`data-collapse-animate` читается с **триггера**. Пустой атрибут выбирает `core-pulse-in`; значение — один класс анимации. Установка атрибута только на блоке анимацию не включает.

`data-collapse-save` на блоке или предке включает localStorage. Ключ по умолчанию — `collapseManager`, запись отложена на 300 мс. Это данные браузера, не состояние сервера.

## API

- `autoInit()` ищет `[data-collapse]`; `refresh()` также пересоздаёт hover/focus-слушатели.
- `registerCollapse(id, element)` регистрирует элемент.
- `show(targets, options)`, `hide(targets, options)`, `toggle(targets, options)` принимают строку или массив строк.
- `showOnly(targets, options)`, `hideOnly(targets, options)` работают в группах.
- `isShow(id)` и `isHide(id)` → boolean. Неизвестный ID считается скрытым.
- `destroy()` сохраняет выбранные состояния, снимает основные обработчики и сбрасывает singleton.

Опции действия: `animationClass`; для `show/hide` также `only`. Методы изменения возвращают массивы ID либо объектов состояния, **не Promise окончания анимации**. Не используйте их возврат как единый стабильный формат результата.

## Настройки и ограничения

`animation: false`, `hideClass: 'core-hide'`, `anim: { show: { class: 'core-pulse-in', duration: 400 } }`, `storageKey: 'collapseManager'` — основные настройки конструктора. Настройки объединяются поверхностно: при замене `anim` передавайте весь вложенный объект.

Менеджер не обновляет `aria-expanded`, не добавляет `aria-controls` и не назначает роли. Для доступного accordion синхронизируйте их в приложении. Восстановление нестандартного `tabindex` ошибочно: исходное число заменяется пустым атрибутом. После `destroy()` глобальная ссылка `window.CollapseManager` остаётся; не используйте её как признак работающего экземпляра.

### E76. Группа раскрывающихся блоков

Core выполняет showOnly/hide. MutationObserver приложения синхронизирует aria-expanded с фактическим классом скрытия.

```html
<div class="core-col core-g-4x">
  <div class="core-row core-g-4x">
    <button type="button" class="core-button" data-collapse-show-only="brief" aria-controls="brief" aria-expanded="true">Бриф</button>
    <button type="button" class="core-button" data-collapse-show-only="files" aria-controls="files" aria-expanded="false">Файлы</button>
  </div>
  <section id="brief" data-collapse data-collapse-group="sections" class="core-card core-col core-g-4x">
    <h3 class="core-text core-text-bold">Задача проекта</h3>
    <p class="core-text">Обновить сайт, сохранить структуру контента и улучшить формы.</p>
    <button type="button" class="core-button core-button-transparent" data-collapse-hide="brief">Скрыть</button>
  </section>
  <section id="files" data-collapse data-collapse-group="sections" class="core-card core-col core-g-4x core-hide">
    <h3 class="core-text core-text-bold">Материалы</h3>
    <p class="core-text">Бриф.pdf · Структура.md · Макеты.fig</p>
    <button type="button" class="core-button core-button-transparent" data-collapse-hide="files">Скрыть</button>
  </section>
</div>
```

```js
import CollapseManager from 'https://cdn.sdelal.tech/core/latest/collapse.js';
const collapse = new CollapseManager();
const sync = () => document.querySelectorAll('[aria-controls]').forEach(button => {
  button.setAttribute('aria-expanded', String(collapse.isShow(button.getAttribute('aria-controls'))));
});
const observer = new MutationObserver(sync);
document.querySelectorAll('[data-collapse]').forEach(panel => observer.observe(panel, { attributes: true, attributeFilter: ['class'] }));
sync();
// При удалении компонента: observer.disconnect(); collapse.destroy();
```

<!-- demo:E76 -->

### E85. Независимые блоки и аккордеон

Два независимых переключателя и аккордеон с одним открытым пунктом. Код приложения синхронизирует aria-expanded и разрешает закрыть активный пункт повторным нажатием.

```html
<div id="e85" class="core-col core-g-8x">
  <h3 class="core-text core-text-l core-text-bold">Независимые блоки</h3>
  <div class="core-col core-g-4x">
    <button id="e85-note-toggle" type="button" class="core-button" data-collapse-toggle="e85-note" aria-controls="e85-note" aria-expanded="true">Примечание</button>
    <section id="e85-note" data-collapse class="core-card core-col" role="region" aria-labelledby="e85-note-toggle">
      <p class="core-text">Этот блок можно оставить открытым вместе с материалами.</p>
    </section>
    <button id="e85-files-toggle" type="button" class="core-button" data-collapse-toggle="e85-files" aria-controls="e85-files" aria-expanded="false">Материалы</button>
    <section id="e85-files" data-collapse class="core-card core-col core-hide" role="region" aria-labelledby="e85-files-toggle">
      <p class="core-text">Бриф.pdf · Структура.md · Макеты.fig</p>
    </section>
  </div>
  <h3 class="core-text core-text-l core-text-bold">Аккордеон</h3>
  <div class="core-col core-g-4x">
    <h4 class="core-text"><button id="e85-review-toggle" type="button" class="core-button core-w-full" data-accordion-toggle aria-controls="e85-review" aria-expanded="true">Согласование</button></h4>
    <section id="e85-review" data-collapse data-collapse-group="e85-accordion" class="core-card core-col" role="region" aria-labelledby="e85-review-toggle">
      <p class="core-text">Сначала согласуем содержание и структуру.</p>
    </section>
    <h4 class="core-text"><button id="e85-delivery-toggle" type="button" class="core-button core-w-full" data-accordion-toggle aria-controls="e85-delivery" aria-expanded="false">Передача</button></h4>
    <section id="e85-delivery" data-collapse data-collapse-group="e85-accordion" class="core-card core-col core-hide" role="region" aria-labelledby="e85-delivery-toggle">
      <p class="core-text">После согласования передадим исходники и инструкции.</p>
    </section>
  </div>
</div>
```

```js
import CollapseManager from 'https://cdn.sdelal.tech/core/latest/collapse.js';
const collapse = new CollapseManager();
const root = document.getElementById('e85');
root.querySelectorAll('[data-accordion-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('aria-controls');
    if (collapse.isShow(id)) collapse.hide(id);
    else collapse.showOnly(id);
  });
});
const sync = () => root.querySelectorAll('button[aria-controls]').forEach(button => {
  button.setAttribute('aria-expanded', String(collapse.isShow(button.getAttribute('aria-controls'))));
});
const observer = new MutationObserver(sync);
root.querySelectorAll('[data-collapse]').forEach(panel => observer.observe(panel, { attributes: true, attributeFilter: ['class'] }));
sync();
// При удалении iframe его document уничтожается вместе со слушателями и observer.
```

<!-- demo:E85 -->

**Источник:** [collapse.js](https://cdn.sdelal.tech/core/latest/collapse.js), проверенная версия и SHA-256 — в [манифесте](../reference/source-manifest.json); при обновлении байты модуля не изменились.

## Совместимость с текущим CSS

JS сохранил значение по умолчанию `core-pulse-in`, но этот анимационный класс удалён из текущего CSS. Для анимации задайте `data-collapse-animate="core-animate:pulse-in"` на триггере или полный объект `anim` с этим классом. Пустой атрибут по-прежнему выберет старое имя и не запустит CSS-анимацию.
