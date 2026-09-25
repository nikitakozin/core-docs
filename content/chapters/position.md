# Позиционирование, края и скруглённые углы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Основание отдельно от координат

`core-abs` включает absolute, `core-fix` — fixed. Координаты читаются из `--t`, `--r`, `--b`, `--l`, transform — из `--tr`. Модификаторы положения задают эти переменные, но не заменяют основание. `core-card`, row/col/grid/section создают относительный контекст, но реальный containing block зависит и от внешних CSS-свойств.

Для overlay внутри карточки нужен её ребёнок `core-abs`; для fixed-элемента viewport может измениться как containing block при наличии трансформированных предков. Не переносите позиционированный элемент в произвольную обёртку без проверки.

В v191 добавлены верхние координаты `core-t-56x` и `core-t-64x` (112 и 128 px при стандартном `--x: 2px`) и их `t-`/`m-` варианты. Они назначают `--t`, а не margin или padding; используйте их с основанием позиционирования.

## Классические позиции

`core-abs-center` / `-c`; top/t, right/r, bottom/b, left/l; сочетания top-left, top-right, bottom-left, bottom-right и обратный порядок слов; варианты full для заполнения области или стороны. Внутренние t/r/b/l — не margin: они становятся координатами позиционированного элемента.

`core-fix-top`, `-bottom`, `-left`, `-right`, `-full` и угловые варианты относятся к fixed-композиции. Не добавляйте несколько противоречивых координатных модификаторов на один элемент.

## Edge и corner

`core-abs-top-edge` и другие стороны центрируют элемент на границе, учитывая половину толщины контура. `core-abs-top-right-corner` и другие углы используют радиус родителя, поправку к форме угла и border-width. Это позволяет поставить бирку на визуальную кромку скруглённой поверхности, а не на геометрическую вершину прямоугольника.

Обязательные связи: родитель должен передать `--parent-b-r` и при необходимости `--parent-bw`; многие правила делают это только для прямого `.core-abs`. Обёртка между карточкой и меткой нарушает передачу. Нестандартный радиус, заданный вне Core, не обязательно заполняет эти внутренние параметры.

В вычислении используются cqw/cqh, но объявления `container-type` в прочитанном Core CSS не найдено. Поэтому нельзя обещать, что эти единицы всегда измеряют именно нужную карточку: необходимо проверить контекст контейнерных единиц и fallback конкретного браузера.

## Адаптивные позиции требуют особой проверки

В v190 короткие tablet-алиасы имеют префикс `t-`: например, `t-core-fix-t` действует при ≤997 px. `m-core-fix-t` действует только при ≤720 px. Исправлены выражения `--x` у адаптивного основания absolute; координаты `--t` и `--b` больше не наследуются. Это не заменяет проверку угловой геометрии конкретной композиции и обеих сторон breakpoint.

## Sticky

`core-sticky` — sticky top 0 с z-index 100; `core-nosticky` возвращает relative и z-index revert. Есть t/m-варианты. Sticky ограничен своим прокручиваемым/содержащим контекстом: наличие класса не гарантирует прилипание при произвольных overflow-предках.

## Transform не складывается автоматически

Позиционирование использует transform. Вращение, mirror, анимация и sxHeight-компенсация также могут его назначать. Если нужно одновременно позиционировать и анимировать, разделите обязанности на два элемента: внешний отвечает за координаты, внутренний — за анимацию.

### E54. Карта краёв, углов и центра

Метки — прямые дети карточки. Два одинаковых стенда сравнивают малый и крупный радиус, а также толщину контура. Внешний padding оставляет место меткам на кромке.

```html
<div class="core-col core-g-8x">
  <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
    <div class="core-col core-g-8x">
      <span class="core-text core-text-s core-text-mono">core-b-r-4x · border-1x</span>
      <div class="core-p-12x">
        <div class="core-card core-bg-surface core-border core-border-1x core-b-r-4x core-h-80x">
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-left-corner" aria-label="core-abs-top-left-corner">TL</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-edge" aria-label="core-abs-top-edge">T</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-right-corner" aria-label="core-abs-top-right-corner">TR</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-right-edge" aria-label="core-abs-right-edge">R</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-right-corner" aria-label="core-abs-bottom-right-corner">BR</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-edge" aria-label="core-abs-bottom-edge">B</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-left-corner" aria-label="core-abs-bottom-left-corner">BL</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-left-edge" aria-label="core-abs-left-edge">L</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-center" aria-label="core-abs-center">C</span>
        </div>
      </div>
    </div>
    <div class="core-col core-g-8x">
      <span class="core-text core-text-s core-text-mono">core-b-r-16x · border-3x</span>
      <div class="core-p-12x">
        <div class="core-card core-bg-surface core-border core-border-3x core-b-r-16x core-h-80x">
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-left-corner" aria-label="core-abs-top-left-corner">TL</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-edge" aria-label="core-abs-top-edge">T</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-top-right-corner" aria-label="core-abs-top-right-corner">TR</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-right-edge" aria-label="core-abs-right-edge">R</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-right-corner" aria-label="core-abs-bottom-right-corner">BR</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-edge" aria-label="core-abs-bottom-edge">B</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-bottom-left-corner" aria-label="core-abs-bottom-left-corner">BL</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-left-edge" aria-label="core-abs-left-edge">L</span>
          <span class="core-badge core-badge-xs core-badge-accent core-abs core-abs-center" aria-label="core-abs-center">C</span>
        </div>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <span class="core-text core-text-s core-text-mono">T/R/B/L — края карточки</span>
    <span class="core-text core-text-s core-text-mono">TL/TR/BL/BR — скруглённые углы</span>
    <span class="core-text core-text-s core-text-mono">C → core-abs-center</span>
  </div>
</div>
```

<!-- demo:E54 -->

### E55. Кнопка в углу и отдельный анимируемый потомок

Inline-переменные явно задают внутренний отступ от угла. Вращение не перезаписывает transform позиционирующего узла.

```html
<article class="core-card core-col core-h-unset core-p-12x" style="--h: 160px">
  <h3 class="core-text core-text-l core-text-bold">Состояние синхронизации</h3>
  <p class="core-text">Координаты и вращение находятся на разных узлах.</p>
  <span class="core-abs core-abs-top-right" style="--t: 12px; --r: 12px">
    <span class="core-icon-spinner core-icon-8x core-animate:spin core-animate-time-4x" role="img" aria-label="Синхронизация"></span>
  </span>
</article>
```

<!-- demo:E55 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
