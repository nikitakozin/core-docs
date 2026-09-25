# Составное поле: core-input-box

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Зачем нужна обёртка

`core-input-box` собирает несколько частей в единый контрол: поле, декоративную иконку, действие, нативный select/date или textarea. Она получает оформление поля, но сама является flex-контейнером с padding 0 и небольшим внутренним gap. Это **не универсальный контейнер для любых произвольных кнопок**.

## Что происходит с детьми

У вложенных полей снимаются независимые границы и тени, ширина/высота привязываются к коробке, радиус наследуется. У кнопок исчезает самостоятельная оболочка, меняются padding и высота. Поэтому одна и та же `core-button` отдельно и внутри box выглядит по-разному — это предусмотренный адаптер, а не случайно «сломанное наследование».

Часть правил адресует любого потомка, часть — только непосредственного ребёнка, часть использует `:has()` и соседство. Дополнительная обёртка может сохранить одно правило и разорвать другое. Минимальная разметка с прямыми детьми — исходная точка для проверки.

## Focus зависит от содержимого

Есть ветка для box, **в котором нет `.core-button`**: при focus-within подсвечивается общая коробка, а контуры вложенных input/select/textarea снимаются. Добавление кнопки переключает условие. Не считайте поведение фокуса одинаковым у поискового поля с иконкой и у поля с отдельным submit-действием.

## Иконки и специальные поля

Наличие непосредственной иконки слева/справа меняет padding соседнего input. При date/select дополнительные правила позиционируют иконки и отключают для них pointer-events, чтобы клик попадал в контрол. Иконка внутри select-box не является отдельной кнопкой открытия сама по себе.

## Размеры

`core-input-box-xs/s/l` меняют коробку и ряд вложенных параметров. Но дочерний `core-input` назначает собственный размер шрифта. Не обещайте, что один суффикс на обёртке пропорционально изменяет абсолютно все внутренние элементы. Для ясного большого поля в рецепте задано `core-input-box-l` **и** `core-input-l`.

## Прозрачность, контур и подчёркивание

В исследованном CSS `core-input-transparent`, `core-input-outline`, `core-input-underline` находятся в правилах `core-input-box`. Поэтому в рецептах они применяются к box. Не переносите их на одинокий input, ожидая гарантированно того же контракта.

Underline-вариант меняет нижнюю границу, внутренние отступы, поведение фокуса и части иконок. Сначала используйте минимальную поддерживаемую структуру; нестандартная комбинация с несколькими кнопками требует отдельной проверки.

### E42. Отдельная кнопка и кнопка внутри поля

В каждом размере сопоставлены отдельная кнопка и составное поле. Контролы используют один размерный профиль.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-col core-g-8x">
      <button type="button" class="core-button core-button-xs">Найти</button>
      <div class="core-input-box core-input-box-xs">
        <input class="core-input core-input-xs" aria-label="Поиск · XS" placeholder="Документ">
        <button type="button" class="core-button core-button-xs">Найти</button>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-col core-g-8x">
      <button type="button" class="core-button core-button-s">Найти</button>
      <div class="core-input-box core-input-box-s">
        <input class="core-input core-input-s" aria-label="Поиск · S" placeholder="Документ">
        <button type="button" class="core-button core-button-s">Найти</button>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-col core-g-8x">
      <button type="button" class="core-button core-button-m">Найти</button>
      <div class="core-input-box">
        <input class="core-input" aria-label="Поиск · M" placeholder="Документ">
        <button type="button" class="core-button core-button-m">Найти</button>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-col core-g-8x">
      <button type="button" class="core-button core-button-l">Найти</button>
      <div class="core-input-box core-input-box-l">
        <input class="core-input core-input-l" aria-label="Поиск · L" placeholder="Документ">
        <button type="button" class="core-button core-button-l">Найти</button>
      </div>
    </div>
  </div>
</div>
```

<!-- demo:E42 -->

### E43. Поиск с иконкой в четырёх размерах

Иконка декоративна; доступное имя находится у поля. У оболочки и input согласован размер.

```html
<div class="core-col core-g-8x">
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск · XS</span>
    <div class="core-input-box core-input-box-xs">
      <span class="core-icon-search core-icon-6x" aria-hidden="true"></span>
      <input class="core-input core-input-xs" type="search" placeholder="Название документа">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск · S</span>
    <div class="core-input-box core-input-box-s">
      <span class="core-icon-search core-icon-7x" aria-hidden="true"></span>
      <input class="core-input core-input-s" type="search" placeholder="Название документа">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск · M</span>
    <div class="core-input-box">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input" type="search" placeholder="Название документа">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск · L</span>
    <div class="core-input-box core-input-box-l">
      <span class="core-icon-search core-icon-10x" aria-hidden="true"></span>
      <input class="core-input core-input-l" type="search" placeholder="Название документа">
    </div>
  </label>
</div>
```

<!-- demo:E43 -->

### E44. Select в оболочке: размеры и disabled

Варианты используют одну разметку с отдельным шевроном. Последний select нативно отключён.

```html
<div class="core-col core-g-8x">
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Этап · XS</span>
    <div class="core-input-box core-input-box-xs">
      <select class="core-select core-select-xs"><option>Исследование</option><option>Проектирование</option><option>Дизайн</option></select>
      <span class="core-icon-chevron-bottom core-icon-8x" aria-hidden="true"></span>
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Этап · S</span>
    <div class="core-input-box core-input-box-s">
      <select class="core-select core-select-s"><option>Исследование</option><option>Проектирование</option><option>Дизайн</option></select>
      <span class="core-icon-chevron-bottom core-icon-8x" aria-hidden="true"></span>
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Этап · M</span>
    <div class="core-input-box">
      <select class="core-select"><option>Исследование</option><option>Проектирование</option><option>Дизайн</option></select>
      <span class="core-icon-chevron-bottom core-icon-8x" aria-hidden="true"></span>
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Этап · L</span>
    <div class="core-input-box core-input-box-l">
      <select class="core-select core-select-l"><option>Исследование</option><option>Проектирование</option><option>Дизайн</option></select>
      <span class="core-icon-chevron-bottom core-icon-8x" aria-hidden="true"></span>
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Этап · disabled</span>
    <div class="core-input-box">
      <select class="core-select" disabled><option>Исследование</option></select>
      <span class="core-icon-chevron-bottom core-icon-8x" aria-hidden="true"></span>
    </div>
  </label>
</div>
```

<!-- demo:E44 -->

### E45. Поле с подчёркиванием: XS/S/базовый/L

Подчёркивание назначено оболочке, размер — оболочке и внутреннему input.

```html
<div class="core-col core-g-8x">
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск с подчёркиванием · XS</span>
    <div class="core-input-box core-input-box-xs core-input-underline">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input core-input-xs" placeholder="Поиск по базе знаний">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск с подчёркиванием · S</span>
    <div class="core-input-box core-input-box-s core-input-underline">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input core-input-s" placeholder="Поиск по базе знаний">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск с подчёркиванием · M</span>
    <div class="core-input-box core-input-underline">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input" placeholder="Поиск по базе знаний">
    </div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Поиск с подчёркиванием · L</span>
    <div class="core-input-box core-input-box-l core-input-underline">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input core-input-l" placeholder="Поиск по базе знаний">
    </div>
  </label>
</div>
```

<!-- demo:E45 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
