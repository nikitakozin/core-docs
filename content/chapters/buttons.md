# Кнопки и группы действий

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Основание и семантика

`core-button` — flex-элемент с центрированием содержимого, gap 10 px, высотой 44 px, padding 8 px сверху/снизу и 16 px слева/справа при базовой теме. Шрифт и размеры берутся из компонентных токенов. Кнопка имеет fit-content ширину и не сжимается в flex по умолчанию.

Для действия используйте `<button type="button">`; для отправки формы — `type="submit"`; для навигации — `<a href="…" class="core-button">`. CSS не превращает `<div>` в доступную кнопку. У ссылки не работает нативный атрибут disabled как у button.

## Варианты

К основанию `core-button` добавьте один вариант оформления:

| Класс | Назначение |
| --- | --- |
| `core-button` | Обычная кнопка без дополнительного варианта |
| `core-button-primary` | Основное действие |
| `core-button-accent` | Акцентное действие |
| `core-button-outline` | Контурная кнопка |
| `core-button-transparent` | Прозрачная база |
| `core-button-danger` | Опасное действие |
| `core-button-warning` | Предупреждение |
| `core-button-success` | Положительное действие |

Не наслаивайте варианты как переключатели приоритетов.

`core-button-full` растягивает кнопку по ширине. `core-button-xs/s/m/l` — размерные модификаторы. Средний основан на default; нельзя гарантировать, что добавленный одновременно с другим размером `m` отменит все изменённые тем параметры. **Один размерный модификатор на компонент.**

## Размерная логика

XS: высота ×0,55, padding по вертикали /4 и по горизонтали /2, шрифт s. S: высота ×0,73, вертикальный padding /2, горизонтальный /1,6; шрифт при этом не обязательно меньше среднего. M: обычная высота. L: высота ×1,18, padding по вертикали ×1,5 и горизонтали ×1,25, шрифт l. Это оптически подобранные отношения, а не линейный scale.

Не переносите эти формулы автоматически на поля, бирки и checkbox. Например, у большого поля горизонтальный padding увеличивается иначе.

## Состояния

Hover применяется в media `(hover: hover)`, есть active, focus-visible и disabled. Focus-visible имеет отдельный контур. `disabled` кнопки использует opacity-токены и отключает нативное действие. `core-loading` визуально блокирует pointer-events и показывает загрузку, но не заменяет `disabled`, `aria-busy` и сообщение о результате.

## Иконки внутри

Используйте отдельный span со смыслово подходящим `core-icon-*` и размером. Декоративной иконке нужен `aria-hidden="true"`. Для кнопки только с иконкой используйте accessible name; размер самой иконки не равен размеру цели нажатия.

## Группа действий

`core-actions-box` создаёт ряд без переноса, минимальный шов и меняет скругления непосредственных детей: внешние края остаются, внутренние убираются. Это не меню и не radiogroup автоматически. Подпишите группу через role/group или fieldset по смыслу. Добавленная вокруг одной кнопки обёртка меняет, кто считается первым/последним ребёнком.

### E29. Варианты кнопок в четырёх размерах

В каждой строке один размер и пять вариантов оформления. Все элементы — настоящие button; проверьте focus клавишей Tab.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-xs">Обычная</button>
      <button type="button" class="core-button core-button-xs core-button-primary">Основная</button>
      <button type="button" class="core-button core-button-xs core-button-accent">Акцентная</button>
      <button type="button" class="core-button core-button-xs core-button-outline">Контурная</button>
      <button type="button" class="core-button core-button-xs core-button-transparent">Прозрачная</button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-s">Обычная</button>
      <button type="button" class="core-button core-button-s core-button-primary">Основная</button>
      <button type="button" class="core-button core-button-s core-button-accent">Акцентная</button>
      <button type="button" class="core-button core-button-s core-button-outline">Контурная</button>
      <button type="button" class="core-button core-button-s core-button-transparent">Прозрачная</button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-m">Обычная</button>
      <button type="button" class="core-button core-button-m core-button-primary">Основная</button>
      <button type="button" class="core-button core-button-m core-button-accent">Акцентная</button>
      <button type="button" class="core-button core-button-m core-button-outline">Контурная</button>
      <button type="button" class="core-button core-button-m core-button-transparent">Прозрачная</button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-l">Обычная</button>
      <button type="button" class="core-button core-button-l core-button-primary">Основная</button>
      <button type="button" class="core-button core-button-l core-button-accent">Акцентная</button>
      <button type="button" class="core-button core-button-l core-button-outline">Контурная</button>
      <button type="button" class="core-button core-button-l core-button-transparent">Прозрачная</button>
    </div>
  </div>
</div>
```

<!-- demo:E29 -->

### E30. Текст, иконка с текстом и только иконка

Одна и та же операция в трёх представлениях и четырёх размерах. У каждой кнопки только с иконкой есть доступное имя.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-xs">Создать</button>
      <button type="button" class="core-button core-button-xs"><span class="core-icon-plus core-icon-6x" aria-hidden="true"></span> Создать</button>
      <button type="button" class="core-button core-button-xs" aria-label="Создать · XS"><span class="core-icon-plus core-icon-6x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-s">Создать</button>
      <button type="button" class="core-button core-button-s"><span class="core-icon-plus core-icon-7x" aria-hidden="true"></span> Создать</button>
      <button type="button" class="core-button core-button-s" aria-label="Создать · S"><span class="core-icon-plus core-icon-7x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-m">Создать</button>
      <button type="button" class="core-button core-button-m"><span class="core-icon-plus core-icon-8x" aria-hidden="true"></span> Создать</button>
      <button type="button" class="core-button core-button-m" aria-label="Создать · M"><span class="core-icon-plus core-icon-8x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-l">Создать</button>
      <button type="button" class="core-button core-button-l"><span class="core-icon-plus core-icon-10x" aria-hidden="true"></span> Создать</button>
      <button type="button" class="core-button core-button-l" aria-label="Создать · L"><span class="core-icon-plus core-icon-10x" aria-hidden="true"></span></button>
    </div>
  </div>
</div>
```

<!-- demo:E30 -->

### E31. Статусы, disabled и загрузка

Статусы сравниваются в активном и нативно отключённом виде. core-loading показывает загрузку; disabled и aria-busy задают состояние элемента.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Статусы</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-warning">Осторожно</button>
      <button type="button" class="core-button core-button-warning" disabled>Осторожно</button>
      <button type="button" class="core-button core-button-success">Подтвердить</button>
      <button type="button" class="core-button core-button-success" disabled>Подтвердить</button>
      <button type="button" class="core-button core-button-danger">Удалить</button>
      <button type="button" class="core-button core-button-danger" disabled>Удалить</button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Состояния основной кнопки</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-button core-button-primary">Сохранить</button>
      <button type="button" class="core-button core-button-primary" disabled>Недоступно</button>
      <button type="button" class="core-button core-button-primary core-loading" disabled aria-busy="true" aria-label="Сохранение"><span class="core-ghost" aria-hidden="true">Сохранение…</span></button>
    </div>
  </div>
</div>
```

<!-- demo:E31 -->

### E32. Слипшиеся группы XS/S/M/L

Кнопки являются непосредственными детьми actions-box. Последняя кнопка каждой группы отключена; размеры всей группы согласованы.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-actions-box" role="group" aria-label="Действия с документом · XS">
      <button type="button" class="core-button core-button-xs" aria-label="Изменить · XS"><span class="core-icon-edit core-icon-6x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-xs" aria-label="Копировать · XS"><span class="core-icon-copy core-icon-6x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-xs" aria-label="Удалить · XS" disabled><span class="core-icon-bin core-icon-6x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-actions-box" role="group" aria-label="Действия с документом · S">
      <button type="button" class="core-button core-button-s" aria-label="Изменить · S"><span class="core-icon-edit core-icon-7x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-s" aria-label="Копировать · S"><span class="core-icon-copy core-icon-7x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-s" aria-label="Удалить · S" disabled><span class="core-icon-bin core-icon-7x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-actions-box" role="group" aria-label="Действия с документом · M">
      <button type="button" class="core-button core-button-m" aria-label="Изменить · M"><span class="core-icon-edit core-icon-8x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-m" aria-label="Копировать · M"><span class="core-icon-copy core-icon-8x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-m" aria-label="Удалить · M" disabled><span class="core-icon-bin core-icon-8x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-actions-box" role="group" aria-label="Действия с документом · L">
      <button type="button" class="core-button core-button-l" aria-label="Изменить · L"><span class="core-icon-edit core-icon-10x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-l" aria-label="Копировать · L"><span class="core-icon-copy core-icon-10x" aria-hidden="true"></span></button>
      <button type="button" class="core-button core-button-l" aria-label="Удалить · L" disabled><span class="core-icon-bin core-icon-10x" aria-hidden="true"></span></button>
    </div>
  </div>
</div>
```

<!-- demo:E32 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
