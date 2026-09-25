# Checkbox, radio и сегментированный выбор

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Нативное состояние как источник истины

Оформление строится вокруг реального input: checked, disabled и focus-visible берутся из браузера. Отдельный JS не нужен для изменения выбора. Сохраняйте `name`, `value`, тип и семантические группы; не заменяйте их произвольными div с классом `active`.

## Checkbox

`core-checkbox` — обёртка, внутри которой расположен input type=checkbox, а **сразу после него** — `.core-checkbox-label`. Удобнее сделать обёртку `<label>`, чтобы клик по подписи менял значение. Псевдоэлементы видимой подписи рисуют квадрат и галочку. Между input и span нельзя вставлять другой элемент: правило `input:checked + .core-checkbox-label` перестанет совпадать.

В v190 disabled checkbox/radio используют `border: var(--theme-input-border-disabled)` с полным токеном границы. Старая ошибка подстановки такого токена в border-color снята; проверяйте нативный disabled и визуальное состояние отдельно.

## Radio

`core-radio` с input type=radio и следующим `.core-radio-label` даёт одиночный оформленный вариант. Несколько radio с одинаковым `name` образуют взаимоисключающий выбор. Fieldset/legend обеспечивают название группы. Уникальные `name` у каждого пункта сломают взаимоисключение, даже если внешний вид выглядит правильно.

## Выбор, похожий на кнопки

`core-button-checkbox` оформляет независимый checkbox как кнопку. Размеры xs/s/m/l назначаются обёртке. Это подходит для включаемого фильтра, но не заменяет radio, когда нужен ровно один вариант.

`core-radio-group` и `core-radio-group-inline` — контейнеры для `.core-button-radio` с input + `.core-radio-label`. Первая группа имеет внутренние поля и рассчитанные радиусы сегментов, inline-вариант объединяет сегменты иначе. Размеры группы xs/s/m/l меняют контейнер и подписи внутри.

## Доступность и поведение

CSS скрывает сами input через прозрачность/позиционирование, но не должен заменять их `display: none` в приложении. Клавиатурная работа и передача значения зависят от сохранения нативных контролов. Состояние следует читать из `input.checked`, а не из фона подписи.

Группа визуально оформленных radio не становится вкладками: для tabs потребовались бы другие роли, связи с панелями и клавиатурная логика. Не присваивайте роль tablist только потому, что сегменты похожи на вкладки.

### E46. Checkbox: оформление и состояния

Пустой, выбранный и два disabled-состояния показаны для обычного и primary-варианта. Каждый checkbox переключается независимо.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Обычный checkbox</h3>
    <div class="core-col core-g-8x">
      <label class="core-checkbox"><input type="checkbox" name="notify-0"><span class="core-checkbox-label">Не выбран</span></label>
      <label class="core-checkbox"><input type="checkbox" name="notify-1" checked><span class="core-checkbox-label">Выбран</span></label>
      <label class="core-checkbox"><input type="checkbox" name="notify-2" disabled><span class="core-checkbox-label">Недоступен</span></label>
      <label class="core-checkbox"><input type="checkbox" name="notify-3" checked disabled><span class="core-checkbox-label">Выбран и недоступен</span></label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">primary</h3>
    <div class="core-col core-g-8x">
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="notify-0-primary"><span class="core-checkbox-label">Не выбран</span></label>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="notify-1-primary" checked><span class="core-checkbox-label">Выбран</span></label>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="notify-2-primary" disabled><span class="core-checkbox-label">Недоступен</span></label>
      <label class="core-checkbox core-checkbox-primary"><input type="checkbox" name="notify-3-primary" checked disabled><span class="core-checkbox-label">Выбран и недоступен</span></label>
    </div>
  </div>
</div>
```

<!-- demo:E46 -->

### E47. Radio: выбор, disabled и клавиатура

В каждой группе выбирается один вариант. Стрелки переключают доступные radio; disabled пропускается.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <fieldset class="core-col core-g-6x">
    <legend class="core-text core-text-bold">Доступ к документу</legend>
    <label class="core-radio"><input type="radio" name="access-0" value="0" checked><span class="core-radio-label">Вся команда</span></label>
    <label class="core-radio"><input type="radio" name="access-0" value="1"><span class="core-radio-label">Выбранные участники</span></label>
    <label class="core-radio"><input type="radio" name="access-0" value="2" disabled><span class="core-radio-label">Закрытый архив</span></label>
  </fieldset>
  <fieldset class="core-col core-g-6x">
    <legend class="core-text core-text-bold">Недоступная группа</legend>
    <label class="core-radio"><input type="radio" name="access-1" value="0" checked disabled><span class="core-radio-label">Чтение</span></label>
    <label class="core-radio"><input type="radio" name="access-1" value="1" disabled><span class="core-radio-label">Редактирование</span></label>
  </fieldset>
</div>
```

<!-- demo:E47 -->

### E48. Сегментированный выбор XS/S/M/L

Четыре независимые группы с текстом и иконками. На мобильном остаются иконки; имена вариантов сохранены через aria-label. Третий сегмент отключён.

```html
<div class="core-col core-g-8x">
  <fieldset class="core-col core-g-4x">
    <legend class="core-text core-text-bold">Представление · XS</legend>
    <div class="core-radio-group core-radio-group-xs">
      <label class="core-button-radio"><input type="radio" name="view-xs" value="list" aria-label="Список" checked><span class="core-radio-label"><span class="core-icon-layers core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Список</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-xs" value="cards" aria-label="Карточки"><span class="core-radio-label"><span class="core-icon-54 core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Карточки</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-xs" value="archive" aria-label="Архив" disabled><span class="core-radio-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Архив</span></span></label>
    </div>
  </fieldset>
  <fieldset class="core-col core-g-4x">
    <legend class="core-text core-text-bold">Представление · S</legend>
    <div class="core-radio-group core-radio-group-s">
      <label class="core-button-radio"><input type="radio" name="view-s" value="list" aria-label="Список" checked><span class="core-radio-label"><span class="core-icon-layers core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Список</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-s" value="cards" aria-label="Карточки"><span class="core-radio-label"><span class="core-icon-54 core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Карточки</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-s" value="archive" aria-label="Архив" disabled><span class="core-radio-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Архив</span></span></label>
    </div>
  </fieldset>
  <fieldset class="core-col core-g-4x">
    <legend class="core-text core-text-bold">Представление · M</legend>
    <div class="core-radio-group core-radio-group-m">
      <label class="core-button-radio"><input type="radio" name="view-m" value="list" aria-label="Список" checked><span class="core-radio-label"><span class="core-icon-layers core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Список</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-m" value="cards" aria-label="Карточки"><span class="core-radio-label"><span class="core-icon-54 core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Карточки</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-m" value="archive" aria-label="Архив" disabled><span class="core-radio-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Архив</span></span></label>
    </div>
  </fieldset>
  <fieldset class="core-col core-g-4x">
    <legend class="core-text core-text-bold">Представление · L</legend>
    <div class="core-radio-group core-radio-group-l">
      <label class="core-button-radio"><input type="radio" name="view-l" value="list" aria-label="Список" checked><span class="core-radio-label"><span class="core-icon-layers core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Список</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-l" value="cards" aria-label="Карточки"><span class="core-radio-label"><span class="core-icon-54 core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Карточки</span></span></label>
      <label class="core-button-radio"><input type="radio" name="view-l" value="archive" aria-label="Архив" disabled><span class="core-radio-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> <span class="m-core-hide">Архив</span></span></label>
    </div>
  </fieldset>
</div>
```

<!-- demo:E48 -->

### E49. Checkbox-кнопки: размеры и состояния

Каждый фильтр независим. Для каждого размера видны unchecked, checked и disabled; состояние задано нативным input.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-row core-y-center core-g-6x">
      <label class="core-button-checkbox core-button-checkbox-xs"><input type="checkbox" name="filter-xs-0"><span class="core-checkbox-label"><span class="core-icon-avatar core-icon-6x" aria-hidden="true"></span> Мои</span></label>
      <label class="core-button-checkbox core-button-checkbox-xs"><input type="checkbox" name="filter-xs-1" checked><span class="core-checkbox-label"><span class="core-icon-check core-icon-6x" aria-hidden="true"></span> Готовые</span></label>
      <label class="core-button-checkbox core-button-checkbox-xs"><input type="checkbox" name="filter-xs-2" disabled><span class="core-checkbox-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> Закрытые</span></label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-row core-y-center core-g-6x">
      <label class="core-button-checkbox core-button-checkbox-s"><input type="checkbox" name="filter-s-0"><span class="core-checkbox-label"><span class="core-icon-avatar core-icon-6x" aria-hidden="true"></span> Мои</span></label>
      <label class="core-button-checkbox core-button-checkbox-s"><input type="checkbox" name="filter-s-1" checked><span class="core-checkbox-label"><span class="core-icon-check core-icon-6x" aria-hidden="true"></span> Готовые</span></label>
      <label class="core-button-checkbox core-button-checkbox-s"><input type="checkbox" name="filter-s-2" disabled><span class="core-checkbox-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> Закрытые</span></label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-row core-y-center core-g-6x">
      <label class="core-button-checkbox core-button-checkbox-m"><input type="checkbox" name="filter-m-0"><span class="core-checkbox-label"><span class="core-icon-avatar core-icon-6x" aria-hidden="true"></span> Мои</span></label>
      <label class="core-button-checkbox core-button-checkbox-m"><input type="checkbox" name="filter-m-1" checked><span class="core-checkbox-label"><span class="core-icon-check core-icon-6x" aria-hidden="true"></span> Готовые</span></label>
      <label class="core-button-checkbox core-button-checkbox-m"><input type="checkbox" name="filter-m-2" disabled><span class="core-checkbox-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> Закрытые</span></label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-row core-y-center core-g-6x">
      <label class="core-button-checkbox core-button-checkbox-l"><input type="checkbox" name="filter-l-0"><span class="core-checkbox-label"><span class="core-icon-avatar core-icon-6x" aria-hidden="true"></span> Мои</span></label>
      <label class="core-button-checkbox core-button-checkbox-l"><input type="checkbox" name="filter-l-1" checked><span class="core-checkbox-label"><span class="core-icon-check core-icon-6x" aria-hidden="true"></span> Готовые</span></label>
      <label class="core-button-checkbox core-button-checkbox-l"><input type="checkbox" name="filter-l-2" disabled><span class="core-checkbox-label"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> Закрытые</span></label>
    </div>
  </div>
</div>
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
  <div class="core-col core-g-4x">
    <label class="core-text core-text-s" for="notify-email">Адрес для уведомлений</label>
    <input class="core-input" id="notify-email" name="email" type="email" autocomplete="email" value="team@example.org">
  </div>
  <div class="core-row m-core-col core-g-4x"><button class="core-button core-button-primary" type="submit">Проверить настройки</button><button class="core-button core-button-outline" type="reset">Сбросить</button></div>
</form>
```

<!-- demo:E72 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
