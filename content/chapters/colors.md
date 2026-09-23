# Цвет, прозрачность, границы и тени

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Семантика прежде оттенка

Главные роли: `--color-background`, `--color-foreground`, `--color-surface`, `--color-surface-alt`, инверсные поверхности, `--color-text-primary`, `--color-text-inverse`, `--color-accent`, `--color-link`, `--color-focus`, `--color-mark`, `--color-success`, `--color-danger`, `--color-warning`.

Для обычной поверхности используйте `core-bg-surface`, для цвета по теме — `core-color` или подходящий semantic-класс. Светлый/тёмный режим меняет роли. Жёсткий `core-bg-white` останется белым в тёмной теме; это допустимо для специального случая, но не заменяет `core-bg`.

Подтверждённые фоновые роли: `core-bg`, `core-bg-transparent`, `core-bg-currentColor`, `core-bg-foreground`, `core-bg-white`, `core-bg-black`, `core-bg-surface`, `core-bg-surface-alt`, `core-bg-surface-inverse`, `core-bg-surface-inverse-alt`, `core-bg-accent`, `core-bg-focus`. Регистр в `currentColor` сохраняйте.

## Палитра и оттенки

Семейства `core-color-{hue}`, `core-bg-{hue}`, `core-border-{hue}` используют red, orange, yellow, green, blue, purple, pink, grey; есть чёрная шкала для соответствующих цветовых правил. Точные оттенки в HTML записываются с двоеточием: `core-bg-blue:100`, `core-color-blue:700`, `core-border-blue:300`. Это имя класса, не псевдокласс.

Основные ступени: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900. Цветовой движок использует смешивание в OKLCH, затем прозрачность. Для цветной базовой шкалы 50…400 добавляют белый, 500 соответствует исходному оттенку, 600…900 добавляют чёрный. **Чёрная шкала и поправки интерактивных фонов имеют собственные значения**; не считайте все палитры тождественной математикой.

## Чёрная шкала фона

`core-bg-black:50/100/200/300/400/500/600/700/800/900` смешивает чёрный соответственно с **98/95/89/82/73/62/50/38/28/20% белого**. Поэтому `core-bg-black:500` — серый, не исходный чёрный. Для чёрного без осветления есть `core-bg-black`.

Эти ступени относятся именно к фону. У `core-color-black:*` другая шкала; одинаковый суффикс не гарантирует одинаковый цвет.

## Как рассчитывается фон

`--bgc` и `--bgcm` задают исходный цвет и примесь; `--bgc-mix` смешивает их в OKLCH. Затем `--bgco` задаёт долю цвета при смешивании с прозрачным в sRGB; результат — `--bgc-result`.

`--bgch` и `--bgchd` задают цвет и интенсивность изменения интерактивного фона. Они различаются между чёрным, белым, семантическими ролями и ступенями палитры. Не воспроизводите hover одной общей формулой с фиксированным процентом поверх всех вариантов.

## Цвет кнопки — особый адаптер

Если у `core-button` есть `core-bg-*`, результат цветового движка становится источником background-токенов кнопки и её состояний. `core-color-*` аналогично настраивает текстовые состояния, `core-border-*` — границы. Это полезнее простого однократного `background-color`, но сочетания нескольких вариантов требуют проверки при hover/active/focus.

Управляющие параметры: `--bgc` (база), `--bgcm` (примесь), `--bgc-mix` (результат оттенка), `--bgco` (альфа), `--bgc-result` (итог), `--bgch` и `--bgchd` (направление и поправка интерактивного изменения). Для текста аналогичны `--tc`, `--tcm`, `--tco`, `--tc-result`; для границы `--bc`, `--bcm`, `--bco`, `--bc-result`.

## Прозрачность не всегда одна и та же

`core-bg-opacity:50`, `core-color-opacity:50`, `core-border-opacity:50` меняют соответствующий цвет, не прозрачность всей группы. Ступени этих opacity-модификаторов — 0, 10, 20, …, 100. Выбирайте их вместе с источником цвета.

`core-muted` и `core-muted-2x/4x/6x/8x` используют opacity всего элемента. Иконки и другие дети становятся прозрачными вместе с родителем. Значения шкалы: 0,8 / 0,6 / 0,4 / 0,2. Это не размер и не прямое значение одноимённого root-токена. Старые алиасы `core-text-muted*` удалены; для инверсного текста используйте цветовой API, например `core-color-inverse`.

## Граница

`core-border` задаёт семантический цвет и включает solid border. `core-border-1x/2x/3x` — **1/2/3 px**, а не множители базового `--x`. `core-border-t/r/b/l` оставляют заданные стороны, `core-border-dash` меняет стиль. Не используйте одно только `core-border-2x`, ожидая гарантированный цвет: задайте `core-border` либо цветовой класс.

Для односторонней границы также нужен источник цвета: например, `core-border core-border-b`. Один `core-border-b` задаёт сторону и ширину, но не инициализирует `--bc`; при невалидном вычисленном цвете браузер может использовать `currentColor`. Модификатор прозрачности не заменяет основание цвета.

`core-border-none` делает источник цвета прозрачным, а не обязательно обнуляет толщину. Когда нужно исключить геометрию границы, используйте явно проектное правило `border-width: 0` и не маскируйте его названием существующего Core-класса.

Утилиты толщины передают `--parent-bw` прямым `core-abs`/`core-fix`-детям. Геометрия углов и краёв зависит от этой связи.

## Тени и фоновые фильтры

`core-shadow-none/xs/s/m/l/xl` выбирают `--sh-*`; есть t/m-варианты. `core-backdrop-blur-Nx` доступен для 0, 1, 2, 3, 4, 6, 8, 12, 16; он размывает фон **за элементом**, а не сам элемент. Для видимого эффекта поверхность обычно должна быть полупрозрачной. Сложные маски, тени и backdrop-фильтры оценивайте по производительности на целевом устройстве, а не по количеству строк CSS.

### E18. Семантические поверхности и цветной акцент

При переключении темы первый блок следует семантике; выбранный синий оттенок остаётся цветовым решением автора.

```html
<div class="core-grid core-grid-3c m-core-grid-1c">
  <div class="core-card core-bg-surface">Поверхность темы</div>
  <div class="core-card core-bg-blue:100 core-color-blue:800">Синий оттенок</div>
  <div class="core-card core-bg-accent core-color-black">Акцент</div>
</div>
```

<!-- demo:E18 -->

### E19. Цветная кнопка со штатными состояниями

Наведение и нажатие обрабатывает адаптер Core, а не дополнительный CSS мануала.

```html
<div class="core-row">
  <button type="button" class="core-button core-bg-blue:700 core-color-white">Сохранить</button>
  <button type="button" class="core-button core-bg-purple:100 core-color-purple:900 core-border-purple:300">Предпросмотр</button>
</div>
```

<!-- demo:E19 -->

### E20. Альфа фона и opacity контейнера — разные результаты

У правого блока opacity действует на всю отрисованную группу.

```html
<div class="core-row core-g-8x">
  <div class="core-card core-bg-blue:500 core-bg-opacity:30 core-color-black">Полупрозрачный только фон</div>
  <div class="core-card core-bg-blue:500 core-color-white core-muted-6x">Прозрачны фон и текст</div>
</div>
```

<!-- demo:E20 -->

### E21. Контур и тень как разные уровни выделения

Последняя карточка явно задаёт и цвет, и толщину, и стиль границы.

```html
<div class="core-row core-g-12x">
  <div class="core-card core-bg core-border core-border-1x">Контур 1 px</div>
  <div class="core-card core-bg core-shadow-m">Тень m</div>
  <div class="core-card core-bg core-border-blue:400 core-border-2x core-border-dash">Контур 2 px</div>
</div>
```

<!-- demo:E21 -->

### E81. Ступени чёрного фона

Одинаковый суффикс у фона и текста не означает одинаковый цвет. Сетка перестраивается 5 → 3 → 2 колонки.

```html
<div class="core-grid core-grid-5c t-core-grid-3c m-core-grid-2c core-g-4x">
  <div class="core-card core-bg-black:50 core-color-black core-text">50</div>
  <div class="core-card core-bg-black:100 core-color-black core-text">100</div>
  <div class="core-card core-bg-black:200 core-color-black core-text">200</div>
  <div class="core-card core-bg-black:300 core-color-black core-text">300</div>
  <div class="core-card core-bg-black:400 core-color-black core-text">400</div>
  <div class="core-card core-bg-black:500 core-color-black core-text">500</div>
  <div class="core-card core-bg-black:600 core-color-white core-text">600</div>
  <div class="core-card core-bg-black:700 core-color-white core-text">700</div>
  <div class="core-card core-bg-black:800 core-color-white core-text">800</div>
  <div class="core-card core-bg-black:900 core-color-white core-text">900</div>
</div>
```

<!-- demo:E81 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
