# Текст, заголовки и оптическое выравнивание

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Интерфейсный текст

`core-text` включает размер и межстрочный интервал через рабочие параметры. `core-text-xxs/xs/s/m/l/xl/xxl` — готовые размеры. При необходимости добавляйте `core-text-bold` / `core-text-b`, `core-text-italic`, `core-text-upper`, `core-text-nums`. Последний включает табличные цифры, если шрифт их поддерживает.

`core-text-primary`, `core-text-accent`, `core-text-mono` выбирают не только font-family, но и набор рабочих метрик. Семантический «акцентный шрифт» не равен акцентному цвету. Для цвета есть отдельные средства.

`core-text-center`, `core-text-right` и `core-text-left` задают выравнивание. Коротких алиасов `core-text-c` и `core-text-r` в архиве нет. `core-text-l` задаёт только крупный размер: он не сбрасывает унаследованное выравнивание.

## Заголовки

В `core-content` обычные `h1`…`h6` оформляются контекстом. В интерфейсной разметке удобнее сохранять семантический тег и явно задавать `core-text core-text-xl core-text-bold` или нужную конфигурацию.

В v185 общий селектор заголовка использует `[class*="core-h"]` с исключениями для `core-h-`, `core-hide` и `core-hover`. Он больше не требует точного `class="core-h"`: `core-h core-h2` работает в композиции. Поскольку селектор подстрочный, не используйте собственные имена, случайно содержащие `core-h`. Для явной текстовой роли также доступны `core-text core-text-xl core-text-bold`.

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

### E23. Текстовая иерархия без спорного core-h

Семантические уровни задаются тегами, визуальные размеры — текстовыми классами.

```html
<div class="core-col core-g-6x">
  <h1 class="core-text core-text-xxl m-core-text-xl core-text-bold">Материалы команды</h1>
  <p class="core-text core-text-l">Общее пространство для работы с документами.</p>
  <p class="core-text core-text-s">Последнее обновление: сегодня, 12:30.</p>
</div>
```

<!-- demo:E23 -->

### E24. Оптическое выравнивание бирки с соседним текстом

Сверху только геометрический центр, снизу — sxHeight-компенсация. Сравнение корректно при загруженном шрифте и соответствующих метриках.

```html
<div class="core-col core-g-12x">
  <div class="core-row core-y-center core-g-4x">
    <span class="core-text core-text-xl">Материалы</span>
    <span class="core-badge core-badge-s">24</span>
  </div>
  <div class="core-row core-y-center core-g-4x">
    <span class="core-text core-text-xl">Материалы</span>
    <span class="core-badge core-badge-s core-sxHeight-middle">24</span>
  </div>
</div>
```

<!-- demo:E24 -->

### E25. Длинное имя в компактной строке

Кнопка здесь показывает оформление; реальное раскрытие полного имени — действие приложения. title не считается полноценной заменой доступного раскрытия на touch.

```html
<div class="core-row core-nowrap core-y-center core-w-full">
  <span class="core-icon-layers core-icon-m" aria-hidden="true"></span>
  <span class="core-text core-text-ellipsis core-grow core-shrink" title="Исследование пользовательских сценариев и структура личного кабинета">
    Исследование пользовательских сценариев и структура личного кабинета
  </span>
  <button type="button" class="core-icon-button core-icon-external-link core-icon-m" aria-label="Открыть полное название"></button>
</div>
```

<!-- demo:E25 -->

### E26. Семантическая ссылка и сочетание клавиш

Это только представление подсказки: обработчик сочетания клавиш в примере отсутствует.

```html
<p class="core-text">
  Откройте <a href="#guide" class="core-link core-link-blue">руководство проекта</a>
  или нажмите <kbd class="core-kbd">⌘</kbd> <kbd class="core-kbd">K</kbd>.
  <mark class="core-mark">Новая версия</mark> уже доступна.
</p>
```

<!-- demo:E26 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Оптические примеры showcase](https://cdn.sdelal.tech/core-dev/showcase.php).
