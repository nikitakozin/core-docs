# Отступы, gap и радиусы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Gap: расстояние между детьми

`core-g-Nx` задаёт gap и синхронизирует параметры дробных flex-колонок. Подтверждённый набор множителей: **0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48**. Есть `t-core-g-*` и `m-core-g-*` с этим же рядом.

При `--x: 2px` `core-g-6x` — 12 px. Gap не создаёт внешний отступ у начала или конца контейнера. Изменение `gap` через собственный CSS не обновляет автоматически `--parent-g`, поэтому дробные `core-j` могут получить неверную ширину. В таких сочетаниях предпочтительнее штатный gap-класс.

В списках и таблицах gap-классы участвуют в особых правилах. В частности, правило таблицы адресует потомков элемента с `core-g-*` **внутри** `core-table`; его нельзя считать простым общим `gap` для `<table>`.

## Padding: общий и направленный

`core-p-Nx` использует тот же базовый ряд множителей, что gap. Направления: `core-p-t-*`, `core-p-r-*`, `core-p-b-*`, `core-p-l-*`; боковые одновременно — `core-p-side-*`. Есть адаптивные варианты. У некоторых направлений встречаются дополнительные значения: например, top 26x и 30x, side 2.5x. Не распространяйте их на все семейства по аналогии.

Общий селектор padding совпадает и с направленными именами. В v190 у каждой стороны есть fallback: например `padding-top: var(--p, var(--p-t))`, а нижняя сторона учитывает safe area. Отдельный направленный класс больше не требует общей базы только ради валидного значения. Для явного общего отступа с исключением используйте `core-p-8x core-p-l-12x`.

Сочетание `core-p-8x core-p-t-4x` означает 16 px на общей базе и 8 px сверху. Порядок этих классов в HTML не имеет значения.

## Margin

Подтверждены семейства `core-m-t-*`, `core-m-b-*`, `core-m-l-*`, а также их t/m-версии. Не обещается симметричный `core-m-r-*` или универсальный `core-m-*`. Для расстояния между повторяющимися детьми сначала используйте gap родителя: он проще при удалении первого/последнего элемента.

## Скругления

Утилиты `core-b-r-Nx`: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 48 и `full`. Они потребляют `--b-r`, устанавливают `border-radius` и форму угла. Адаптивные версии передают радиус непосредственным `.core-abs`-детям для углового позиционирования.

`core-b-r-full` возвращает обычную форму угла и задаёт большой радиус. Для круглого элемента нужны ещё равные ширина и высота. Само `full` не делает прямоугольник квадратом.

## Safe area

`core-h-100dvh` задаёт `--p-b-env: env(safe-area-inset-bottom)`, а некоторые padding-селекторы прибавляют эту величину к нижнему отступу. Это конкретная связь классов, а не универсальная автоматическая защита всего интерфейса от вырезов экрана.

### E09. Общая база padding и отдельные стороны

У всех карточек одна база 8x; второй класс изменяет только выбранную сторону.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">8x: все стороны</span>
    <div class="core-card core-p-8x "><span class="core-badge">Контент</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">left: 16x</span>
    <div class="core-card core-p-8x core-p-l-16x"><span class="core-badge">Контент</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">top: 16x</span>
    <div class="core-card core-p-8x core-p-t-16x"><span class="core-badge">Контент</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">bottom: 16x</span>
    <div class="core-card core-p-8x core-p-b-16x"><span class="core-badge">Контент</span></div>
  </div>
</div>
```

<!-- demo:E09 -->

### E10. Адаптивная плотность и сравнение gap

В первой секции padding и gap уменьшаются на мобильном. Ниже одинаковые карточки с разными интервалами.

```html
<div class="core-col core-g-8x">
  <section class="core-card core-col core-p-24x m-core-p-8x core-g-12x m-core-g-4x">
    <h2 class="core-text core-text-xl m-core-text-l core-text-bold">Пространство проекта</h2>
    <p class="core-text">На узком экране уменьшаются отступы, а не вся типографическая система.</p>
  </section>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-g-2x</span>
    <div class="core-grid core-grid-3c core-g-2x">
      <div class="core-card core-p-4x core-text core-text-center">01</div>
      <div class="core-card core-p-4x core-text core-text-center">02</div>
      <div class="core-card core-p-4x core-text core-text-center">03</div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-g-8x</span>
    <div class="core-grid core-grid-3c core-g-8x">
      <div class="core-card core-p-4x core-text core-text-center">01</div>
      <div class="core-card core-p-4x core-text core-text-center">02</div>
      <div class="core-card core-p-4x core-text core-text-center">03</div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-g-16x</span>
    <div class="core-grid core-grid-3c core-g-16x">
      <div class="core-card core-p-4x core-text core-text-center">01</div>
      <div class="core-card core-p-4x core-text core-text-center">02</div>
      <div class="core-card core-p-4x core-text core-text-center">03</div>
    </div>
  </div>
</div>
```

<!-- demo:E10 -->

### E11. Шкала радиусов на одинаковых карточках

Размер, фон и контур одинаковы; меняется только core-b-r-*.

```html
<div class="core-grid core-grid-4c m-core-grid-2c core-g-8x">
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-0x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-0x"><span class="core-text">0x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-2x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-2x"><span class="core-text">2x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-4x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-4x"><span class="core-text">4x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-8x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-8x"><span class="core-text">8x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-12x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-12x"><span class="core-text">12x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-16x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-16x"><span class="core-text">16x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-24x</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-24x"><span class="core-text">24x</span></div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">core-b-r-full</span>
    <div class="core-card core-bg-surface core-border core-h-48x core-col core-center core-b-r-full"><span class="core-text">full</span></div>
  </div>
</div>
```

<!-- demo:E11 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
