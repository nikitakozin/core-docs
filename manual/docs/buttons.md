# Кнопки и группы действий

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Основание и семантика

`core-button` — flex-элемент с центрированием содержимого, gap 10 px, высотой 44 px, padding 8 px сверху/снизу и 16 px слева/справа при базовой теме. Шрифт и размеры берутся из компонентных токенов. Кнопка имеет fit-content ширину и не сжимается в flex по умолчанию.

Для действия используйте `<button type="button">`; для отправки формы — `type="submit"`; для навигации — `<a href="…" class="core-button">`. CSS не превращает `<div>` в доступную кнопку. У ссылки не работает нативный атрибут disabled как у button.

## Варианты

Default — только основание. `core-button-primary` — основное действие; `core-button-accent` — акцент; `core-button-outline` — контур; `core-button-transparent` — прозрачная база; `core-button-danger`, `-warning`, `-success` — семантические цветные варианты. Выбирайте один основной вариант, не наслаивайте их как переключатели приоритетов.

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

### E29. Варианты основных действий

Все элементы — реальные button с указанным type. Посмотрите также focus клавишей Tab.

```html
<div class="core-row core-y-center">
  <button type="button" class="core-button">Обычная</button>
  <button type="button" class="core-button core-button-primary">Основная</button>
  <button type="button" class="core-button core-button-accent">Акцентная</button>
  <button type="button" class="core-button core-button-outline">Контурная</button>
  <button type="button" class="core-button core-button-transparent">Прозрачная</button>
</div>
```

<!-- demo:E29 -->

### E30. Четыре размера кнопки

Буквы — имена профилей, не единая линейная шкала.

```html
<div class="core-row core-y-center">
  <button type="button" class="core-button core-button-xs">XS</button>
  <button type="button" class="core-button core-button-s">S</button>
  <button type="button" class="core-button core-button-m">M</button>
  <button type="button" class="core-button core-button-l">L</button>
</div>
```

<!-- demo:E30 -->

### E31. Опасное действие и нативно отключённая кнопка

В реальном продукте удаление требует соответствующей логики подтверждения; пример её не реализует.

```html
<div class="core-row core-y-center">
  <button type="button" class="core-button core-button-danger">Удалить документ</button>
  <button type="button" class="core-button core-button-primary" disabled>Сохранение недоступно</button>
  <button type="button" class="core-button core-button-success">Подтвердить</button>
</div>
```

<!-- demo:E31 -->

### E32. Слипшаяся группа действий

Кнопки — непосредственные дети группы: так работают правила внешних углов.

```html
<div class="core-actions-box" role="group" aria-label="Действия с документом">
  <button type="button" class="core-button"><span class="core-icon-edit core-icon-m" aria-hidden="true"></span>Изменить</button>
  <button type="button" class="core-button"><span class="core-icon-copy core-icon-m" aria-hidden="true"></span>Копировать</button>
  <button type="button" class="core-button" aria-label="Удалить"><span class="core-icon-bin core-icon-m" aria-hidden="true"></span></button>
</div>
```

<!-- demo:E32 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).

