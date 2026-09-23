# Адаптивность и точные префиксы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Модель desktop-first

Непрефиксные классы действуют на всех ширинах. `t-core-*` включаются при `max-width: 997px`, `m-core-*` — при `max-width: 720px`. На мобильном одновременно активны и базовые, и tablet-, и mobile-правила. Mobile-блоки соответствующих семейств расположены позже, но специфичность по-прежнему имеет значение.

Это ширина viewport, а не ширина ближайшей карточки. В iframe мануала viewport принадлежит iframe. Если один и тот же компонент стоит в узкой боковой панели на широком экране, mobile-классы не обязаны включаться.

`--w-max-mobile`, `--w-max-tablet`, `--w-max-desktop` используются как CSS-значения размеров. Их переопределение **не переписывает** числовые условия media query. Для иных breakpoint понадобится собственное правило или изменение исходного CSS.

## Подтверждённые семейства

Адаптивные варианты присутствуют у row/col/slider, конфигураций grid, текстовых и display-размеров, числовых иконок, долей j, многих ширин и высот, gap/padding/margin, радиусов, выравнивания, видимости, pointer-events, sticky, теней и позиционирования.

Это перечисление семейств, а не обещание, что **любое** основание и **каждое** значение поддерживает любой префикс. Например, поле базового среднего размера не требует `core-input-m`, а `m-core-button-l` не следует создавать по аналогии с `m-core-text-l`.

## Исключения имён

В v185 адаптивные ограничения названы `t-core-nogrow`, `t-core-noshrink`, `m-core-nogrow`, `m-core-noshrink`. Старые имена без `core-` удалены.

Иконки используют числовые размеры: `core-icon-8x m-core-icon-6x`. Именованные размеры удалены. Для заголовков оставляйте `core-h1` … `core-h6` и меняйте размер текстовыми t/m-утилитами; адаптивных `t-core-h*` и `m-core-h*` больше нет.

## Что сравнивать в мануале

Сетка из шести карточек — [E06](layout.md); форма с парными полями — [E65](forms.md); два варианта реестра — [E67/E68](lists-tables.md); рабочая панель с двумя breakpoint — [E70](recipes.md). Ни один из этих сценариев не подменяет перестройку обрезкой.

## Устойчивые проверки

Проверяйте по обе стороны границ: 998/997 px и 721/720 px. Затем проверьте типичный узкий экран, длинные тексты, увеличение размера шрифта, focus и действия без hover. Для новой композиции тест на одной ширине 390 px не заменяет проверку границ.

Не скрывайте единственный способ выполнить действие на touch-устройствах, рассчитывая на hover. Не меняйте смысловой порядок через reverse только ради красивого ряда на одном разрешении.

### E16. Крупная иконка, уменьшающаяся на мобильном

У иконки числовая, а не именованная основа: --i-s наследуется псевдоэлементом и может меняться по media query.

```html
<div class="core-row core-y-center">
  <span class="core-icon-layers core-icon-24x m-core-icon-12x" aria-hidden="true"></span>
  <span class="core-text core-text-xl m-core-text-m">Библиотека компонентов</span>
</div>
```

<!-- demo:E16 -->

### E17. Контент по ширине, без потери доступного имени

Текст скрывается только визуально через display, но кнопка сохраняет явное accessible name. Размер кликабельной области нужно проверять отдельно.

```html
<button type="button" class="core-button core-button-primary" aria-label="Создать документ">
  <span class="core-icon-plus core-icon-8x" aria-hidden="true"></span>
  <span class="m-core-hide">Создать документ</span>
</button>
```

<!-- demo:E17 -->

### E69. Панель инструментов: строка → вертикальная форма

При ≤720 px `m-core-col` переводит поиск, фильтр и кнопку в вертикальный поток. Поиск растёт через `core-grow`, длинный placeholder не задаёт минимальную ширину благодаря `core-shrink`. Это компоновка формы; фильтрация данных не реализована.

```html
<form class="core-card core-row m-core-col core-g-6x" role="search" aria-label="Поиск материалов">
  <div class="core-col core-g-4x core-grow core-shrink">
    <label class="core-text core-text-s" for="library-search">Материал</label>
    <div class="core-input-box">
      <span class="core-icon-search core-icon-8x" aria-hidden="true"></span>
      <input class="core-input" id="library-search" name="q" type="search" placeholder="Название или фрагмент текста">
    </div>
  </div>
  <div class="core-col core-g-4x core-shrink">
    <label class="core-text core-text-s" for="library-status">Статус</label>
    <select class="core-select" id="library-status" name="status"><option>Все материалы</option><option>На проверке</option><option>Согласовано</option></select>
  </div>
  <div class="core-col core-g-4x core-x-start">
    <span class="core-text core-text-s">Действие</span>
    <button type="submit" class="core-button core-button-primary">Найти</button>
  </div>
</form>
```

<!-- demo:E69 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
