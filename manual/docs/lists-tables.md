# Списки и таблицы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Списки

`core-list` и списки в `core-content` оформлены через CSS grid: колонка маркера и колонка содержимого. Прямые li занимают нужную сеточную область; вложенные ol/ul продолжают систему. У нумерованных списков используются CSS counters, у вложенных ol — составные номера. Ветка ol внутри ul имеет отдельную логику счётчика.

Роль HTML остаётся принципиальной: используйте `<ol>` для порядка и `<ul>` для перечисления. Не заменяйте семантику просто красивым номером в span.

`core-list-flat` использует другой режим колонок и subgrid для вложения. `core-list-xs/s` меняют параметры маркеров, не обязательно весь текст. Параметры `--list-bullet-gap`, `--list-g` и `--p-l` участвуют в геометрии списка. Gap-класс внутри такого контекста не равен обычной flex-расстановке: он влияет на ритм пунктов.

## Таблица

`core-table` задаёт табличное отображение, схлопывание границ и оформление ячеек. Базовые внутренние отступы — 8 px по вертикали и 16 px по горизонтали, но крайние ячейки могут иметь обрезанные внешние отступы. Точная логика зависит от присутствия thead/tbody/tfoot и первого/последнего элемента.

`core-table-bordered-v` добавляет внутренние вертикальные границы, `core-table-bordered-h` — горизонтальные, `core-heading-underline` — нижнюю линию заголовка. `core-table-noscroll` устанавливает table и width 100%; сам он не создаёт прокрутку.

## Широкие данные

Для горизонтальной прокрутки есть `core-table-container`: flex-контейнер с max-width 100%, overflow-x auto и overflow-y hidden. Его вариант `core-table-container-masked` добавляет крайние градиентные маски, padding, scroll-padding и отрицательные margins по 20 px. Более универсальная обёртка — `core-x-scroll`. Не путайте с `core-h-scroll`: тот в исследованном CSS управляет **overflow-y**. Чтобы данные не сжимались до нечитаемого состояния, можно явно задать минимальную ширину таблицы как проектное решение.

Используйте caption, scope у заголовков и настоящую структуру таблицы. Два сценария перестройки ниже: E67 — список с grid, целиком на Core; E68 — настоящая таблица с отдельным CSS приложения. Один `m-core-col` на table не создаёт корректную карточную раскладку.

### E50. Вложенный нумерованный список

Нумерация создаётся CSS-счётчиками, но порядок и вложенность заданы корректными ol/li.

```html
<ol class="core-list">
  <li>Исследование
    <ol><li>Сбор материалов</li><li>Интервью</li></ol>
  </li>
  <li>Проектирование</li>
  <li>Дизайн и проверка</li>
</ol>
```

<!-- demo:E50 -->

### E51. Широкая таблица: контролируемая прокрутка

Сравните 1200 и 390 px. При нехватке места таблица прокручивается внутри своей области; страница не расширяется. `min-width: 680px` — открытое ограничение этого рецепта. Перестройка без прокрутки показана ниже, в E67 и E68.

```html
<div class="core-col core-g-6x">
  <h3 class="core-text core-text-bold">План выпуска</h3>
  <p class="core-text core-text-s">Пять этапов, ответственные и сроки. Суммы условные.</p>
  <div class="core-x-scroll" tabindex="0" role="region" aria-label="План выпуска; таблицу можно прокручивать">
    <table class="core-table core-table-noscroll core-table-bordered-h core-heading-underline" style="min-width: 680px">
      <caption>Согласованный объём работ</caption>
      <thead><tr><th scope="col">Этап</th><th scope="col">Ответственный</th><th scope="col">Срок</th><th scope="col">Часы</th><th scope="col">Статус</th></tr></thead>
      <tbody>
        <tr><th scope="row">Исследование</th><td>Арт-директор</td><td>18 сентября</td><td>24</td><td><span class="core-badge">Готово</span></td></tr>
        <tr><th scope="row">Прототип</th><td>UX-дизайнер</td><td>23 сентября</td><td>40</td><td><span class="core-badge core-badge-primary">В работе</span></td></tr>
        <tr><th scope="row">Визуальная система</th><td>Дизайнер</td><td>28 сентября</td><td>56</td><td>На проверке</td></tr>
        <tr><th scope="row">Разработка</th><td>Разработчик</td><td>12 октября</td><td>80</td><td>План</td></tr>
        <tr><th scope="row">Приёмка</th><td>Команда</td><td>16 октября</td><td>16</td><td>План</td></tr>
      </tbody>
      <tfoot><tr><th scope="row" colspan="3">Всего</th><td>216</td><td>5 этапов</td></tr></tfoot>
    </table>
  </div>
</div>
```

<!-- demo:E51 -->

### E67. Реестр проектов: строки → карточки, только Core

При >720 px каждая запись — grid 3:1:1; при ≤720 px — одна колонка. Это семантический список, визуально похожий на таблицу: `ul/li`, а не поддельные роли table. Подписи полей остаются видимыми, все данные сохраняются.

```html
<ul class="core-col core-g-4x" aria-label="Проекты команды">
  <li class="core-card core-grid core-grid-3c-3fr-1fr-1fr m-core-grid-1c core-g-8x">
    <div class="core-col core-g-2x core-shrink"><h4 class="core-text core-text-bold">Культурный центр</h4><p class="core-text core-text-s">Сайт и афиша</p></div>
    <div class="core-col core-g-2x"><span class="core-text core-text-xs">Ответственный</span><span class="core-text">Анна</span></div>
    <div class="core-col core-g-4x"><span class="core-badge">На проверке</span><button type="button" class="core-button core-button-outline core-button-s">Открыть</button></div>
  </li>
  <li class="core-card core-grid core-grid-3c-3fr-1fr-1fr m-core-grid-1c core-g-8x">
    <div class="core-col core-g-2x core-shrink"><h4 class="core-text core-text-bold">Личный кабинет</h4><p class="core-text core-text-s">Документы и уведомления</p></div>
    <div class="core-col core-g-2x"><span class="core-text core-text-xs">Ответственный</span><span class="core-text">Илья</span></div>
    <div class="core-col core-g-4x"><span class="core-badge">В работе</span><button type="button" class="core-button core-button-outline core-button-s">Открыть</button></div>
  </li>
  <li class="core-card core-grid core-grid-3c-3fr-1fr-1fr m-core-grid-1c core-g-8x">
    <div class="core-col core-g-2x core-shrink"><h4 class="core-text core-text-bold">Интернет-магазин</h4><p class="core-text core-text-s">Каталог и заказ</p></div>
    <div class="core-col core-g-2x"><span class="core-text core-text-xs">Ответственный</span><span class="core-text">Мария</span></div>
    <div class="core-col core-g-4x"><span class="core-badge">План</span><button type="button" class="core-button core-button-outline core-button-s">Открыть</button></div>
  </li>
</ul>
```

<!-- demo:E67 -->


### E68. Настоящая таблица → карточки: Core + CSS приложения

До 720 px строки становятся отдельными карточками с подписями. Перестройку обеспечивает CSS `app-stack-table`, приведённый вместе с HTML; у Core нет заявленного универсального table-to-card класса. Сохранены caption, headers и роли; работу со скринридерами нужно проверять отдельно.

```html
<table class="core-table core-table-noscroll core-table-bordered-h app-stack-table" role="table">
  <caption>Документы для согласования</caption>
  <thead role="rowgroup"><tr role="row">
    <th id="docs-name" scope="col" role="columnheader">Документ</th>
    <th id="docs-owner" scope="col" role="columnheader">Автор</th>
    <th id="docs-state" scope="col" role="columnheader">Статус</th>
  </tr></thead>
  <tbody role="rowgroup">
    <tr role="row">
      <th id="docs-brief" headers="docs-name" scope="row" role="rowheader"><span class="app-cell-label" aria-hidden="true">Документ</span><span>Бриф проекта</span></th>
      <td headers="docs-owner docs-brief" role="cell"><span class="app-cell-label" aria-hidden="true">Автор</span><span>Анна</span></td>
      <td headers="docs-state docs-brief" role="cell"><span class="app-cell-label" aria-hidden="true">Статус</span><span>Согласовано</span></td>
    </tr>
    <tr role="row">
      <th id="docs-structure" headers="docs-name" scope="row" role="rowheader"><span class="app-cell-label" aria-hidden="true">Документ</span><span>Структура и сценарии</span></th>
      <td headers="docs-owner docs-structure" role="cell"><span class="app-cell-label" aria-hidden="true">Автор</span><span>Илья</span></td>
      <td headers="docs-state docs-structure" role="cell"><span class="app-cell-label" aria-hidden="true">Статус</span><span>На проверке</span></td>
    </tr>
    <tr role="row">
      <th id="docs-components" headers="docs-name" scope="row" role="rowheader"><span class="app-cell-label" aria-hidden="true">Документ</span><span>Описание компонентов</span></th>
      <td headers="docs-owner docs-components" role="cell"><span class="app-cell-label" aria-hidden="true">Автор</span><span>Мария</span></td>
      <td headers="docs-state docs-components" role="cell"><span class="app-cell-label" aria-hidden="true">Статус</span><span>В работе</span></td>
    </tr>
  </tbody>
</table>
```

**CSS приложения — не встроенный API Core:**

```css
/* Расширение приложения; подключается после Core. */
.app-stack-table .app-cell-label { display: none; }
@media (max-width: 720px) {
  .core-table.app-stack-table { display: block; }
  .app-stack-table > thead {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap;
  }
  .app-stack-table > tbody { display: grid; gap: var(--s-8x); }
  .app-stack-table > tbody > tr {
    display: block; padding: var(--s-8x);
    background: var(--color-surface); border-radius: var(--theme-card-radius);
  }
  .app-stack-table > tbody > tr > :is(th, td) {
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: var(--s-6x); padding: var(--s-4x) 0; border: 0;
    overflow-wrap: anywhere;
  }
  .app-stack-table .app-cell-label { display: block; font-weight: 400; }
}
```

<!-- demo:E68 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).

