# Checkbox, radio и сегментированный выбор

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Нативное состояние как источник истины

Оформление строится вокруг реального input: checked, disabled и focus-visible берутся из браузера. Отдельный JS не нужен для изменения выбора. Сохраняйте `name`, `value`, тип и семантические группы; не заменяйте их произвольными div с классом `active`.

## Checkbox

`core-checkbox` — обёртка, внутри которой расположен input type=checkbox, а **сразу после него** — `.core-checkbox-label`. Удобнее сделать обёртку `<label>`, чтобы клик по подписи менял значение. Псевдоэлементы видимой подписи рисуют квадрат и галочку. Между input и span нельзя вставлять другой элемент: правило `input:checked + .core-checkbox-label` перестанет совпадать.

`core-checkbox-primary` — подтверждённый вариант; в исходнике рядом встречается историческая опечатка `core-ckeckbox-primary`. Используйте корректное написание. Отдельный disabled-стиль имеет спорную подстановку полного border-токена в border-color; это не отменяет нативный disabled, но визуальное состояние нужно проверить.

## Radio

`core-radio` с input type=radio и следующим `.core-radio-label` даёт одиночный оформленный вариант. Несколько radio с одинаковым `name` образуют взаимоисключающий выбор. Fieldset/legend обеспечивают название группы. Уникальные `name` у каждого пункта сломают взаимоисключение, даже если внешний вид выглядит правильно.

## Выбор, похожий на кнопки

`core-button-checkbox` оформляет независимый checkbox как кнопку. Размеры xs/s/m/l назначаются обёртке. Это подходит для включаемого фильтра, но не заменяет radio, когда нужен ровно один вариант.

`core-radio-group` и `core-radio-group-inline` — контейнеры для `.core-button-radio` с input + `.core-radio-label`. Первая группа имеет внутренние поля и рассчитанные радиусы сегментов, inline-вариант объединяет сегменты иначе. Размеры группы xs/s/m/l меняют контейнер и подписи внутри.

## Доступность и поведение

CSS скрывает сами input через прозрачность/позиционирование, но не должен заменять их `display: none` в приложении. Клавиатурная работа и передача значения зависят от сохранения нативных контролов. Состояние следует читать из `input.checked`, а не из фона подписи.

Группа визуально оформленных radio не становится вкладками: для tabs потребовались бы другие роли, связи с панелями и клавиатурная логика. Не присваивайте роль tablist только потому, что сегменты похожи на вкладки.

### E46. Checkbox с правильным соседством

Ввод и подпись идут непосредственно друг за другом; label оборачивает оба.

```html
<label class="core-checkbox core-checkbox-primary">
  <input type="checkbox" name="notify" value="1" checked>
  <span class="core-checkbox-label">Уведомлять об изменениях проекта</span>
</label>
```

<!-- demo:E46 -->

### E47. Нативная группа radio

Одинаковое имя access даёт взаимоисключающий выбор без Core JS.

```html
<fieldset class="core-col core-g-6x">
  <legend class="core-text core-text-bold">Доступ к документу</legend>
  <label class="core-radio"><input type="radio" name="access" value="team" checked><span class="core-radio-label">Вся команда</span></label>
  <label class="core-radio"><input type="radio" name="access" value="selected"><span class="core-radio-label">Выбранные участники</span></label>
</fieldset>
```

<!-- demo:E47 -->

### E48. Сегментированный выбор вида

Выбор radio работает; переключение настоящего списка/доски должно реализовать приложение.

```html
<fieldset class="core-col core-g-4x">
  <legend class="core-text">Представление материалов</legend>
  <div class="core-radio-group core-radio-group-m">
    <label class="core-button-radio"><input type="radio" name="view" value="list" checked><span class="core-radio-label">Список</span></label>
    <label class="core-button-radio"><input type="radio" name="view" value="cards"><span class="core-radio-label">Карточки</span></label>
    <label class="core-button-radio"><input type="radio" name="view" value="board"><span class="core-radio-label">Доска</span></label>
  </div>
</fieldset>
```

<!-- demo:E48 -->

### E49. Независимый фильтр как checkbox-кнопка

Это переключаемое состояние формы, не обычная push-button.

```html
<label class="core-button-checkbox core-button-checkbox-s">
  <input type="checkbox" name="mine" value="1">
  <span class="core-checkbox-label">Только мои материалы</span>
</label>
```

<!-- demo:E49 -->

### E72. Настройки уведомлений: группы выбора в адаптивной форме

На широком экране — две самостоятельные группы, на телефоне — одна колонка. Checkbox независимы, radio с одинаковым `name` взаимоисключающие. Выбор, ввод и сброс нативные; сохранения на сервере нет.

```html
<form class="core-card core-col core-g-12x" aria-labelledby="notify-title">
  <h3 id="notify-title" class="core-text core-text-xl core-text-bold">Уведомления проекта</h3>
  <div class="core-grid core-grid-2c m-core-grid-1c core-g-12x">
    <fieldset class="core-col core-g-6x core-shrink">
      <legend class="core-text core-text-bold">О каких событиях сообщать</legend>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="events" value="comments" checked><span class="core-checkbox-label">Новые комментарии</span></label>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="events" value="mentions" checked><span class="core-checkbox-label">Упоминания меня</span></label>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="events" value="versions"><span class="core-checkbox-label">Новые версии документов</span></label>
    </fieldset>
    <fieldset class="core-col core-g-6x core-shrink">
      <legend class="core-text core-text-bold">Частота писем</legend>
      <label class="core-radio"><input type="radio" name="frequency" value="instant" checked><span class="core-radio-label">Сразу</span></label>
      <label class="core-radio"><input type="radio" name="frequency" value="daily"><span class="core-radio-label">Один раз в день</span></label>
      <label class="core-radio"><input type="radio" name="frequency" value="off"><span class="core-radio-label">Без писем</span></label>
    </fieldset>
  </div>
  <hr class="core-hr">
  <div class="core-form-item">
    <label class="core-label" for="notify-email">Адрес для уведомлений</label>
    <input class="core-input" id="notify-email" name="email" type="email" autocomplete="email" value="team@example.org">
  </div>
  <div class="core-row m-core-col core-g-4x"><button class="core-button core-button-primary" type="submit">Проверить настройки</button><button class="core-button core-button-outline" type="reset">Сбросить</button></div>
</form>
```

<!-- demo:E72 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).

