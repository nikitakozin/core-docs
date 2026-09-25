# Текст, заголовки и оптическое выравнивание

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Интерфейсный текст

`core-text` включает размер и межстрочный интервал через рабочие параметры. `core-text-xxs/xs/s/m/l/xl/xxl` — готовые размеры. Добавляйте `core-text-thin` (вес 300 с v191), `core-text-bold`, `core-text-italic`, `core-text-upper`, `core-text-nums` по задаче. Последний включает табличные цифры, если шрифт их поддерживает; старый алиас `core-text-b` удалён.

`core-text-primary`, `core-text-accent`, `core-text-mono` выбирают не только font-family, но и набор рабочих метрик. Семантический «акцентный шрифт» не равен акцентному цвету. Для цвета есть отдельные средства.

`core-text-center`, `core-text-right` и `core-text-left` задают выравнивание. Коротких алиасов `core-text-c` и `core-text-r` в архиве нет. `core-text-l` задаёт только крупный размер: он не сбрасывает унаследованное выравнивание.

В reset `:where([class*="core-"])` вложенный `&:is(b, strong, em, br)` использует `all: revert`: он относится к самим тегам с Core-классом. На таком элементе размер может сброситься. Для интерфейсного числа или подписи назначайте типографическую роль `span`; семантический `strong` при необходимости поместите внутрь.

## Заголовки

В `core-content` обычные `h1`…`h6` оформляются контекстом. В интерфейсной разметке удобнее сохранять семантический тег и явно задавать `core-text core-text-xl core-text-bold` или нужную конфигурацию.

В v190 основание заголовка выбирает точные `.core-h1` … `.core-h6`. Отдельный `core-h` не требуется. Адаптивные `t-core-h*` и `m-core-h*` удалены: для изменения размера используйте `t-core-text-*` и `m-core-text-*`, сохраняя семантический HTML-тег.

## Display-шкала

`core-text-display-1x`…`-6x` умножают `--f-s-xxl` на 1,2 / 1,4 / 1,7 / 2 / 2,5 / 3 и корректируют line-height. Есть адаптивные t/m-варианты. Эти классы подходят для коротких крупных чисел и заголовков, но не определяют смысловой уровень heading.

## Длинные строки

`core-text-ellipsis` сочетает `white-space: nowrap`, overflow hidden, многоточие и градиентную маску последних 32 px. Для сжатия внутри flex необходима разрешающая геометрия (`core-shrink` или `min-width: 0`). Многоточие — не средство скрыть критичную информацию без другого доступа к ней.

## Метрики и `sxHeight`

Оптическое центрирование — отдельная возможность Core. `core-sxHeight-middle` сдвигает элемент с учётом метрик шрифта и `--near-f-s`. Эту переменную генерирует `core-row`, если у него есть непосредственный текстовый сосед с распознаваемым размерным классом. Дополнительно нужен обычный геометрический контекст, например `core-y-center`.

Разметка `row → span(text-l)` рядом с `row → badge(sxHeight-middle)` соответствует механизму. Разметка `row → div → span(text-l)` уже не соответствует прямому соседству. Необёрнутый текстовый узел тоже не выбирается селектором класса. В строковом потоке для простой геометрической задачи используется `core-va-middle`, а не автоматический поиск соседнего шрифта.

`core-sxHeight-center` корректирует line-height/padding для оптического центрирования собственного текста. В showcase отмечено, что компенсация рассчитана на строчные, а не на заголовок полностью капсом. Значение метрик должно соответствовать реальному шрифту.

## Ссылки, mark и kbd

`core-link` по умолчанию использует основной цвет текста с мягким подчёркиванием; `core-link-blue` подключает цвет семантической ссылки. `core-link-nostroke` меняет базовое подчёркивание, но состояния всё равно нужно смотреть отдельно. `core-mark` — подсветка, `core-kbd` — оформление клавиши. Используйте соответствующие HTML-теги для смысла: `<a>`, `<mark>`, `<kbd>`.

### E23. Шкалы заголовков, текста и шрифтов

Три независимых сравнения: core-h1…h6, текстовые размеры xxs…xxl и семейства primary/accent/mono. Семантику заголовка задаёт HTML-тег.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Заголовки</h3>
    <div class="core-col core-g-8x">
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h1</span>
        <h1 class="core-h1">Заголовок 1</h1>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h2</span>
        <h2 class="core-h2">Заголовок 2</h2>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h3</span>
        <h3 class="core-h3">Заголовок 3</h3>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h4</span>
        <h4 class="core-h4">Заголовок 4</h4>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h5</span>
        <h5 class="core-h5">Заголовок 5</h5>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-h6</span>
        <h6 class="core-h6">Заголовок 6</h6>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Текст</h3>
    <div class="core-col core-g-8x">
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-xxs</span>
        <p class="core-text core-text-xxs">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-xs</span>
        <p class="core-text core-text-xs">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-s</span>
        <p class="core-text core-text-s">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-m</span>
        <p class="core-text core-text-m">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-l</span>
        <p class="core-text core-text-l">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-xl</span>
        <p class="core-text core-text-xl">Материалы проекта</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-xxl</span>
        <p class="core-text core-text-xxl">Материалы проекта</p>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Семейства</h3>
    <div class="core-col core-g-8x">
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-primary</span>
        <p class="core-text core-text-l core-text-primary">Проект 024 · Aa Бб</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-accent</span>
        <p class="core-text core-text-l core-text-accent">Проект 024 · Aa Бб</p>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-text core-text-s core-text-mono">core-text-mono</span>
        <p class="core-text core-text-l core-text-mono">Проект 024 · Aa Бб</p>
      </div>
    </div>
  </div>
</div>
```

<!-- demo:E23 -->

### E24. Бирка и текст: геометрическое и оптическое выравнивание

Для каждого размера первая строка использует только y-center, вторая добавляет sxHeight. Текст и бирка — прямые соседи.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">s · геометрический центр</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-s">Материалы</span>
      <span class="core-badge core-badge-s ">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">s · sxHeight</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-s">Материалы</span>
      <span class="core-badge core-badge-s core-sxHeight-middle">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">m · геометрический центр</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-m">Материалы</span>
      <span class="core-badge core-badge-s ">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">m · sxHeight</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-m">Материалы</span>
      <span class="core-badge core-badge-s core-sxHeight-middle">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">l · геометрический центр</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-l">Материалы</span>
      <span class="core-badge core-badge-s ">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">l · sxHeight</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-l">Материалы</span>
      <span class="core-badge core-badge-s core-sxHeight-middle">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">xl · геометрический центр</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-xl">Материалы</span>
      <span class="core-badge core-badge-s ">24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">xl · sxHeight</span>
    <div class="core-row core-y-center core-g-4x">
      <span class="core-text core-text-xl">Материалы</span>
      <span class="core-badge core-badge-s core-sxHeight-middle">24</span>
    </div>
  </div>
</div>
```

<!-- demo:E24 -->

### E25. Длинное имя в компактной строке

Кнопка здесь показывает оформление; реальное раскрытие полного имени — действие приложения. title не считается полноценной заменой доступного раскрытия на touch.

```html
<div class="core-row core-nowrap core-y-center core-w-full">
  <span class="core-icon-layers core-icon-8x" aria-hidden="true"></span>
  <span class="core-text core-text-ellipsis core-grow core-shrink" title="Исследование пользовательских сценариев и структура личного кабинета">
    Исследование пользовательских сценариев и структура личного кабинета
  </span>
  <button type="button" class="core-icon-button core-icon-external-link core-icon-8x" aria-label="Открыть полное название"></button>
</div>
```

<!-- demo:E25 -->

### E26. Иконка, ссылка, бирка и клавиши в строке

Один набор inline-элементов в трёх размерах текста. У иконки используется core-icon-inline, у бирки — core-badge-inline.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-text-s</span>
    <p class="core-text core-text-s"><span class="core-icon-search core-icon-8x core-icon-inline" aria-hidden="true"></span> Открыть <a href="#guide" class="core-link core-link-blue">руководство</a> <span class="core-badge core-badge-s core-badge-inline">24</span> · <kbd class="core-kbd">⌘</kbd> <kbd class="core-kbd">K</kbd> · <mark class="core-mark">Новое</mark></p>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-text-m</span>
    <p class="core-text core-text-m"><span class="core-icon-search core-icon-8x core-icon-inline" aria-hidden="true"></span> Открыть <a href="#guide" class="core-link core-link-blue">руководство</a> <span class="core-badge core-badge-s core-badge-inline">24</span> · <kbd class="core-kbd">⌘</kbd> <kbd class="core-kbd">K</kbd> · <mark class="core-mark">Новое</mark></p>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-text-l</span>
    <p class="core-text core-text-l"><span class="core-icon-search core-icon-8x core-icon-inline" aria-hidden="true"></span> Открыть <a href="#guide" class="core-link core-link-blue">руководство</a> <span class="core-badge core-badge-s core-badge-inline">24</span> · <kbd class="core-kbd">⌘</kbd> <kbd class="core-kbd">K</kbd> · <mark class="core-mark">Новое</mark></p>
  </div>
</div>
```

<!-- demo:E26 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Оптические примеры showcase](https://cdn.sdelal.tech/core-dev/showcase.php).
