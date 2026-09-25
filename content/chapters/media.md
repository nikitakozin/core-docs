# Изображения, пропорции и обрезка

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Изображение и подпись

`core-img` делает изображение блочным, ограничивает максимальную ширину и использует auto-height; участвует рабочий параметр `--w`. У фоновой подложки в этом правиле найдено обращение к `--color-background-secondary`, не обнаруженному в базовом наборе токенов; не рассчитывайте на гарантированную подложку загрузки без собственной настройки.

`core-figure` — колонка для изображения и figcaption с gap 8 px и компактной типографикой. Смысловую картинку описывайте через alt; декоративную — `alt=""`. Размеры width/height в HTML помогают задать собственные пропорции до загрузки.

`core-bg-img` предназначен для абсолютного заполнения области изображением. Контейнер должен создавать соответствующий containing block. Фоновое изображение не заменяет содержательный img с альтернативным текстом.

## Пропорции

`core-ratio-1w-1h`, `-2w-3h`, `-3w-2h`, `-3w-4h`, `-4w-3h`, `-16w-9h`, `-9w-16h` и `-auto` управляют aspect-ratio. У ratio-семейства также есть общие изменения width/min-width/object-fit/max-size. Поэтому добавление одного ratio-класса — не исключительно `aspect-ratio`, и ширину стоит явно согласовать.

Есть t/m-варианты пропорций. При `core-img core-ratio-16w-9h core-w-full` width-full возвращает явно требуемую ширину. Для img с intrinsic-геометрией конечный crop зависит от сочетания width/height/aspect-ratio; проверяйте реальную картинку, а не пустую заливку.

## Overflow и маски

`core-overflow-hidden` и `core-crop` обрезают переполнение. `core-overflow-y-auto` и `core-h-scroll` дают вертикальную прокрутку. `core-x-scroll` — горизонтальную.

Маски `core-masked-left/right/top/bottom` используют градиенты и `--core-overflow-mask-size` с default 20 px. Несколько классов маски могут записывать одно свойство `mask-image`; не считайте, что их эффекты автоматически объединяются. Маска на контейнере также может обрезать визуальный focus-outline его детей.

## Иллюстрации в этом мануале

В следующих примерах используется простая встроенная SVG-заглушка. Она нужна только для наблюдения пропорций и не является новым набором фирменных иконок или изображением из showcase. Файлы шрифтов и чужие фотографии в архив не включены.

### E52. Одна картинка в пропорциях 1:1, 4:3 и 16:9

Изображение заполняет контейнер через core-bg-img. По расположению фигур видно, какая часть обрезается.

```html
<div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
  <figure class="core-figure">
    <div class="core-col core-ratio-1w-1h core-w-full core-crop core-b-r-8x">
      <img class="core-bg-img" alt="Прямоугольник и круг: обрезка 1w-1h" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23e8edf1'/%3E%3Crect x='100' y='90' width='260' height='220' rx='26' fill='%23b2ff35'/%3E%3Ccircle cx='420' cy='200' r='95' fill='%2321262b'/%3E%3C/svg%3E">
    </div>
    <figcaption>core-ratio-1w-1h · core-bg-img</figcaption>
  </figure>
  <figure class="core-figure">
    <div class="core-col core-ratio-4w-3h core-w-full core-crop core-b-r-8x">
      <img class="core-bg-img" alt="Прямоугольник и круг: обрезка 4w-3h" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23e8edf1'/%3E%3Crect x='100' y='90' width='260' height='220' rx='26' fill='%23b2ff35'/%3E%3Ccircle cx='420' cy='200' r='95' fill='%2321262b'/%3E%3C/svg%3E">
    </div>
    <figcaption>core-ratio-4w-3h · core-bg-img</figcaption>
  </figure>
  <figure class="core-figure">
    <div class="core-col core-ratio-16w-9h core-w-full core-crop core-b-r-8x">
      <img class="core-bg-img" alt="Прямоугольник и круг: обрезка 16w-9h" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23e8edf1'/%3E%3Crect x='100' y='90' width='260' height='220' rx='26' fill='%23b2ff35'/%3E%3Ccircle cx='420' cy='200' r='95' fill='%2321262b'/%3E%3C/svg%3E">
    </div>
    <figcaption>core-ratio-16w-9h · core-bg-img</figcaption>
  </figure>
</div>
```

<!-- demo:E52 -->

### E53. Исходные пропорции и заполнение квадрата

Слева core-img с собственной геометрией 640×400, справа та же картинка заполняет квадрат. В v191 нет утилиты object-fit:contain; первый вариант сохраняет исходные пропорции благодаря auto-height.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <figure class="core-figure core-m-w-xs">
    <img class="core-img core-b-r-8x" width="640" height="400" alt="Демонстрационная композиция: прямоугольник и круг"
         src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23e8edf1'/%3E%3Crect x='100' y='90' width='260' height='220' rx='26' fill='%23b2ff35'/%3E%3Ccircle cx='420' cy='200' r='95' fill='%2321262b'/%3E%3C/svg%3E">
    <figcaption>width/height задают исходную геометрию до загрузки.</figcaption>
  </figure>
  <figure class="core-figure">
    <div class="core-col core-ratio-1w-1h core-w-full core-crop core-b-r-8x">
      <img class="core-bg-img" alt="Прямоугольник и круг: обрезка 1w-1h" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23e8edf1'/%3E%3Crect x='100' y='90' width='260' height='220' rx='26' fill='%23b2ff35'/%3E%3Ccircle cx='420' cy='200' r='95' fill='%2321262b'/%3E%3C/svg%3E">
    </div>
    <figcaption>core-ratio-1w-1h · core-bg-img</figcaption>
  </figure>
</div>
```

<!-- demo:E53 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
