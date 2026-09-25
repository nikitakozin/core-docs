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

### E18. Семантические поверхности текущей темы

Все образцы переключаются вместе с темой. Инверсным поверхностям соответствует инверсный цвет текста.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg</span>
    <div class="core-card core-border core-bg "><span class="core-text">Поверхность</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-surface</span>
    <div class="core-card core-border core-bg-surface "><span class="core-text">Поверхность</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-surface-alt</span>
    <div class="core-card core-border core-bg-surface-alt "><span class="core-text">Поверхность</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-surface-inverse</span>
    <div class="core-card core-border core-bg-surface-inverse core-color-inverse"><span class="core-text">Поверхность</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-surface-inverse-alt</span>
    <div class="core-card core-border core-bg-surface-inverse-alt core-color-inverse"><span class="core-text">Поверхность</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-accent</span>
    <div class="core-card core-border core-bg-accent core-color-black"><span class="core-text">Поверхность</span></div>
  </div>
</div>
```

<!-- demo:E18 -->

### E19. Цветные кнопки со штатными состояниями

Сравните обычное состояние, hover и клавиатурный focus. Цвет задан утилитами Core, а поведение остаётся поведением button.

```html
<div class="core-row core-y-center core-g-6x">
  <button type="button" class="core-button core-bg-blue:700 core-color-white"><span class="core-icon-check core-icon-8x" aria-hidden="true"></span> blue</button>
  <button type="button" class="core-button core-bg-green:700 core-color-white"><span class="core-icon-check core-icon-8x" aria-hidden="true"></span> green</button>
  <button type="button" class="core-button core-bg-red:700 core-color-white"><span class="core-icon-check core-icon-8x" aria-hidden="true"></span> red</button>
  <button type="button" class="core-button core-bg-purple:700 core-color-white"><span class="core-icon-check core-icon-8x" aria-hidden="true"></span> purple</button>
</div>
```

<!-- demo:E19 -->

### E20. Альфа фона и opacity всей карточки

Три одинаковые карточки лежат на одной серой подложке. Альфа меняет только фон, opacity — также текст и иконку.

```html
<div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">Без прозрачности</span>
    <div class="core-bg-grey:200 core-p-8x core-b-r-8x">
      <div class="core-card core-bg-blue:500 core-color-black ">
        <span class="core-icon-layers core-icon-12x" aria-hidden="true"></span>
        <p class="core-text core-text-bold">Материалы</p>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-bg-opacity:30</span>
    <div class="core-bg-grey:200 core-p-8x core-b-r-8x">
      <div class="core-card core-bg-blue:500 core-color-black core-bg-opacity:30">
        <span class="core-icon-layers core-icon-12x" aria-hidden="true"></span>
        <p class="core-text core-text-bold">Материалы</p>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-muted-6x</span>
    <div class="core-bg-grey:200 core-p-8x core-b-r-8x">
      <div class="core-card core-bg-blue:500 core-color-black core-muted-6x">
        <span class="core-icon-layers core-icon-12x" aria-hidden="true"></span>
        <p class="core-text core-text-bold">Материалы</p>
      </div>
    </div>
  </div>
</div>
```

<!-- demo:E20 -->

### E21. Шкала теней и толщины контура

Одинаковые поверхности показывают тени none–xl, затем контуры 1/2/3x со сплошной и пунктирной линией.

```html
<div class="core-col core-g-8x core-p-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Тени</h3>
    <div class="core-row core-y-center core-g-6x">
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">none</span>
        <div class="core-card core-bg core-border core-shadow-none"><span class="core-text">Тень</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">xs</span>
        <div class="core-card core-bg core-border core-shadow-xs"><span class="core-text">Тень</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">s</span>
        <div class="core-card core-bg core-border core-shadow-s"><span class="core-text">Тень</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">m</span>
        <div class="core-card core-bg core-border core-shadow-m"><span class="core-text">Тень</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">l</span>
        <div class="core-card core-bg core-border core-shadow-l"><span class="core-text">Тень</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">xl</span>
        <div class="core-card core-bg core-border core-shadow-xl"><span class="core-text">Тень</span></div>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Контуры</h3>
    <div class="core-row core-y-center core-g-6x">
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">1x · solid</span>
        <div class="core-card core-bg core-border core-border-1x "><span class="core-text">Контур</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">1x · dash</span>
        <div class="core-card core-bg core-border core-border-1x core-border-dash"><span class="core-text">Контур</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">2x · solid</span>
        <div class="core-card core-bg core-border core-border-2x "><span class="core-text">Контур</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">2x · dash</span>
        <div class="core-card core-bg core-border core-border-2x core-border-dash"><span class="core-text">Контур</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">3x · solid</span>
        <div class="core-card core-bg core-border core-border-3x "><span class="core-text">Контур</span></div>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">3x · dash</span>
        <div class="core-card core-bg core-border core-border-3x core-border-dash"><span class="core-text">Контур</span></div>
      </div>
    </div>
  </div>
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

### E84. Восемь цветовых шкал

Каждый ряд — одно семейство с 10 ступенями. Подписи вынесены за цветные образцы; отдельная чёрная шкала сохранена в E81.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-red:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-red:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-red:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-red:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-orange:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-orange:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-orange:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-yellow:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-yellow:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-yellow:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-green:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-green:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-green:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-green:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-blue:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-blue:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-blue:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-purple:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-purple:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-purple:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-pink:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-pink:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-pink:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">core-bg-grey:50…900</h3>
    <div class="core-grid core-grid-5c m-core-grid-2c core-g-8x">
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:50 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:50"></div>
        <span class="core-text core-text-s core-text-mono">50</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:100 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:100"></div>
        <span class="core-text core-text-s core-text-mono">100</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:200 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:200"></div>
        <span class="core-text core-text-s core-text-mono">200</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:300 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:300"></div>
        <span class="core-text core-text-s core-text-mono">300</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:400 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:400"></div>
        <span class="core-text core-text-s core-text-mono">400</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:500 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:500"></div>
        <span class="core-text core-text-s core-text-mono">500</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:600 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:600"></div>
        <span class="core-text core-text-s core-text-mono">600</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:700 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:700"></div>
        <span class="core-text core-text-s core-text-mono">700</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:800 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:800"></div>
        <span class="core-text core-text-s core-text-mono">800</span>
      </div>
      <div class="core-col core-g-8x">
        <div class="core-bg-grey:900 core-h-24x core-b-r-4x core-border" role="img" aria-label="core-bg-grey:900"></div>
        <span class="core-text core-text-s core-text-mono">900</span>
      </div>
    </div>
  </div>
</div>
```

<!-- demo:E84 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
