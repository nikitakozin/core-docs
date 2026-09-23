# Всплывающие окна: PopupManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Регистрирует окна, управляет стеком, hash-псевдонимами, Escape и клавиатурным фокусом. CSS-анатомия описана в [разделе окон](popups.md).

## Разметка и запуск

```html
<button type="button" class="core-button" data-popup-trigger="settings">Настройки</button>
<div id="settings" data-popup data-popup-silent class="core-popup-box">
  <div class="core-popup-overlay" aria-hidden="true"></div>
  <section class="core-popup core-popup-center core-popup-s core-card core-bg core-col"
           role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <h2 id="settings-title" class="core-text core-text-bold">Настройки проекта</h2>
    <button type="button" class="core-button" data-popup-close="settings">Закрыть</button>
  </section>
</div>
<script type="module">
  import PopupManager from 'https://cdn.sdelal.tech/core/latest/popup.js';
  const popups = new PopupManager();
  document.getElementById('settings').addEventListener('popup:activate', () => {
    requestAnimationFrame(() => document.querySelector('#settings button').focus());
  });
</script>
```

Конструктор сам регистрирует `[data-popup]` с ID. Singleton доступен как `window.PopupManager`. Имена в атрибутах передаются **без `#`**.

## Атрибуты

`data-popup="alias-a,alias-b"` задаёт hash-псевдонимы одного окна. Без значения используется ID. Псевдонимы должны быть уникальны; конфликт вызывает ошибку.

`data-popup-silent` отключает запись этого окна в URL. Его нельзя сочетать с непустыми псевдонимами. Для мануала и локальных служебных окон удобен именно silent-режим.

`data-popup-req` запрещает закрытие Escape и кликом по оверлею, включает предупреждение при уходе со страницы. Явный `close()` и кнопка закрытия всё равно работают.

Триггеры: `data-popup-trigger`, `data-popup-close`, `data-popup-toggle`, `data-popup-change`. Внутри окна пустой `data-popup-close` работает только когда click попадает в сам элемент, не во вложенную иконку; надёжнее всегда указывать ID.

## API

- `autoInit()`, `refresh()` сканируют документ; `registerPopup(id)` регистрирует окно.
- `open(target, updateHistory = true)`, `close(target, updateHistory = true)`, `toggle(target, updateHistory = true)`; target — ID или псевдоним.
- `change(target)` заменяет верхнее открытое окно без переходной анимации и с `replaceState`. При пустом стеке ничего не делает.
- `closeAll()` закрывает стек **без обновления URL**.
- `destroy()` снимает основные слушатели и закрывает окна, но не сбрасывает singleton и `window.PopupManager`.

Это синхронные команды, не Promise завершения CSS-перехода. Конструктор позволяет переименовать атрибуты и селекторы через `cfg`, однако `toggle` жёстко проверяет класс `opened`; оставляйте `openedClass: '.opened'`.

## URL и события

Стек сериализуется как `#alias-a#alias-b`, а также в `history.state.popups`. Чужие поля history-state сохраняются. Управление Back/Forward идёт через `popstate`; отдельного слушателя `hashchange` у PopupManager нет. Не делите этот hash с независимой навигацией приложения.

На контейнере отправляется всплывающее DOM-событие `popup:activate` с `detail: { id, hash }`. Оно вызывается и при смене псевдонима уже открытого окна. Это не событие EventEmitter. Специального публичного события закрытия нет.

## Доступность и очистка

Закрытые и нижние окна получают `inert`; верхнее — клавиатурную ловушку. Менеджер не назначает `role`, `aria-modal`, имя диалога и не переносит начальный фокус автоматически. Это сделано в примере кодом приложения. Список focusable-элементов не исключает все CSS-скрытые узлы — проверяйте состав окна.

После закрытия последнего окна возвращается сохранённый фокус, если элемент остался в документе. Пока в стеке есть окно, менеджер только меняет ловушку Tab. Прокрутка body разблокируется с задержкой 170 мс после закрытия последнего окна. Исходное inline-значение `overflow` не сохраняется. Для сложного стека проверьте закрытие не только верхнего окна.

Не пересоздавайте менеджер через `new` после `destroy` как независимый экземпляр. Для повторной работы используйте сохранённый экземпляр и явную регистрацию; проверяйте URL и слушатели приложения отдельно.

### E80. Диалог без изменения URL

Silent-окно работает внутри примера. Имя диалога и начальный фокус задаёт приложение; Core управляет открытием, Escape и возвратом фокуса.

```html
<button type="button" class="core-button core-button-primary" data-popup-trigger="settings">Настройки проекта</button>
<div id="settings" data-popup data-popup-silent class="core-popup-box">
  <div class="core-popup-overlay" aria-hidden="true"></div>
  <section class="core-popup core-popup-center core-popup-s core-card core-bg core-col core-g-6x" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <h2 id="settings-title" class="core-text core-text-bold">Настройки проекта</h2>
    <label class="core-col core-g-2x"><span class="core-text">Название</span><input id="project-name" class="core-input" value="Сайт театра"></label>
    <p class="core-text core-text-s">Ввод сохраняется при закрытии окна и переключении темы.</p>
    <button type="button" class="core-button core-button-primary" data-popup-close="settings">Готово</button>
  </section>
</div>
```

```js
import PopupManager from 'https://cdn.sdelal.tech/core/latest/popup.js';
const popups = new PopupManager();
document.getElementById('settings').addEventListener('popup:activate', () => {
  requestAnimationFrame(() => document.getElementById('project-name').focus());
});
```

<!-- demo:E80 -->

**Источник:** [popup.js](https://cdn.sdelal.tech/core/latest/popup.js), проверенная версия и SHA-256 — в [манифесте](../reference/source-manifest.json); при обновлении байты модуля не изменились.
