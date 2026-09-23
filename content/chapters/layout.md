# Компоновки: секция, строка, колонка, сетка

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## `core-section`: крупная вертикальная область

Секция — относительный flex-контейнер с вертикальным потоком, центрированием через `margin: 0 auto`, базовым gap 32 px и ограничениями ширины. Она не добавляет автоматически содержательные padding-отступы. `core-section-h-full` задаёт минимальную высоту 100dvh. Для страницы обычно нужны собственный max-width и отступы.

## `core-row`: строка с переносом

Строка — `display: flex`, направление row, **wrap по умолчанию**, gap 12 px. Для панели, которая должна оставаться в одну линию, добавьте `core-nowrap` / `core-nw`. Для растягивающегося текста используйте `core-shrink` или `core-grow` по смыслу; это не синонимы.

`core-shrink` задаёт `flex-shrink: 1`, `min-width: 0` и рабочий `--core-shrink: 1`: элемент может сжиматься, но сам по себе не получает свободное место. `core-grow` задаёт `flex-grow: 1`. Для одновременно растягиваемой и сжимаемой области используйте оба класса. `core-noshrink` запрещает сжатие. Длинный текст без `min-width: 0` может вытеснять соседнюю кнопку даже в правильно созданной строке.

## `core-col`: вертикальный flex

Колонка — вертикальный поток с базовым gap 12 px, ограничением ширины и сбросом унаследованных настроек осевого выравнивания. Это не самостоятельная карточка. В v190 `core-col-reverse` и `core-row-reverse` включают основание сами: отдельный row/col не обязателен. Reverse меняет визуальный порядок, но не порядок чтения DOM и клавиатурного фокуса.

## `core-inline`

Переключает отображение в `inline-flex`. Он не воспроизводит весь набор отступов и контекстных настроек `core-row`. Для встроенной в текст группы нужно осознанно выбирать line box, vertical-align и gap, а не считать `inline` полным аналогом строки.

## `core-grid`

Основание включает grid, gap 12 px и потребляет `--grid`. Равные колонки: `core-grid-2c` … `core-grid-6c`. Старые классы неравных треков удалены. Для них задавайте штатную переменную, например `style="--grid: 3fr 1fr"`. В адаптивном примере E07 переменная находится на обёртке: дочерний `core-grid` наследует треки, а `m-core-grid-1c` переопределяет их на самом grid. Inline-значение на самом grid было бы сильнее адаптивного класса.

Это доли доступного пространства **за вычетом gap**, а не буквальные проценты всей ширины. Треки на `1fr` не эквивалентны `minmax(0, 1fr)`: длинный неразрывный контент может расширять минимум. Примените `core-shrink` к проблемному ребёнку, задайте перенос текста либо явно используйте собственное `--grid: repeat(3, minmax(0, 1fr))`. Последнее — явная настройка, не новый Core-класс.

## Физические оси и flex-оси

`core-x-start/center/end` и `core-y-start/center/end` задают физическое выравнивание по X/Y через переменные. У строки X соответствует `justify-content`, Y — `align-items`; у колонки наоборот. `core-y-baseline` предназначен для строчного сценария.

`core-center` задаёт центрирование по обеим осям. `core-justify` означает `justify-content: space-between`. `core-justify-start/center/end` и `core-align-start/center/end/baseline` относятся непосредственно к flex-свойствам: их смысл поворачивается вместе с направлением потока. Не смешивайте две модели без причины.

## Выбор конструкции

Строка подходит для панели действий и коротких последовательностей; grid — для строк и колонок с общей системой треков; колонка — для вертикального стека; секция — для крупного блока страницы. Карточка — поверхность, которую можно соединить с любым из этих потоков. Слайдер — отдельный горизонтальный сценарий, см. [ширины и ленты](dimensions.md).

### E05. Панель: растягиваемый текст и фиксированное действие

core-grow и core-shrink расположены на текстовой колонке. Кнопка не сжимается; порядок DOM соответствует порядку чтения.

```html
<div class="core-row core-nowrap core-y-center core-g-8x">
  <div class="core-col core-grow core-shrink core-g-2x">
    <h2 class="core-text core-text-l core-text-bold">Редакционный план студии</h2>
    <p class="core-text core-text-s">Материалы, сроки и ответственные.</p>
  </div>
  <button type="button" class="core-button core-button-primary core-noshrink">Добавить</button>
</div>
```

<!-- demo:E05 -->

### E06. Сетка из шести карточек: 3 → 2 → 1

1200/998 px — три колонки; 997/721 px — две; 720/390 px — одна. Меняется число колонок, а не масштаб карточек. `core-grow` в описании выравнивает действия в пределах ряда. Кнопки демонстрационные.

```html
<div class="core-grid core-grid-3c t-core-grid-2c m-core-grid-1c core-g-8x">
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">Готово</span>
      <span class="core-text core-text-xs">8 материалов</span>
    </div>
    <h3 class="core-text core-text-bold">Исследование</h3>
    <p class="core-text core-text-s core-grow">Интервью, ограничения и карта задач.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">В работе</span>
      <span class="core-text core-text-xs">12 материалов</span>
    </div>
    <h3 class="core-text core-text-bold">Архитектура</h3>
    <p class="core-text core-text-s core-grow">Структура сайта и связи между разделами.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">В работе</span>
      <span class="core-text core-text-xs">6 материалов</span>
    </div>
    <h3 class="core-text core-text-bold">Прототипы</h3>
    <p class="core-text core-text-s core-grow">Пользовательские сценарии и первые проверки.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">На проверке</span>
      <span class="core-text core-text-xs">24 материала</span>
    </div>
    <h3 class="core-text core-text-bold">Дизайн-система</h3>
    <p class="core-text core-text-s core-grow">Токены, компоненты и состояния.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">В работе</span>
      <span class="core-text core-text-xs">18 материалов</span>
    </div>
    <h3 class="core-text core-text-bold">Контент</h3>
    <p class="core-text core-text-s core-grow">Тексты страниц и иллюстрации.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
  <article class="core-card core-col core-g-6x core-shrink">
    <div class="core-row core-y-center core-justify">
      <span class="core-badge">План</span>
      <span class="core-text core-text-xs">4 материала</span>
    </div>
    <h3 class="core-text core-text-bold">Передача</h3>
    <p class="core-text core-text-s core-grow">Макеты, спецификация и критерии приёмки.</p>
    <button type="button" class="core-button core-button-outline core-button-s">Открыть раздел</button>
  </article>
</div>
```

<!-- demo:E06 -->

### E07. Неравные колонки: содержание и боковая панель

Ссылки демонстрационные; внутри iframe переход к ним не загружает приложение.

```html
<div class="core-col" style="--grid: 3fr 1fr">
<div class="core-grid m-core-grid-1c core-g-12x">
  <article class="core-content core-card">
    <h2>Обновление проекта</h2>
    <p>Основной текст занимает три доли доступной ширины.</p>
  </article>
  <aside class="core-card core-col">
    <strong class="core-text core-text-bold">Материалы</strong>
    <a class="core-link" href="#brief">Бриф проекта</a>
    <a class="core-link" href="#decisions">Принятые решения</a>
  </aside>
</div>
</div>
```

<!-- demo:E07 -->

### E08. Оси остаются физическими при смене потока

Адаптивное основание сбрасывает рабочие настройки осей; нужные мобильные значения повторены явно. Высота 160 px задана только для демонстрации.

```html
<div class="core-card core-row m-core-col core-x-center core-y-center m-core-x-center m-core-y-center core-h-80x">
  <span class="core-badge">Первый</span>
  <span class="core-badge core-badge-primary">Второй</span>
</div>
```

<!-- demo:E08 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
