# Бирки, метки и компактные действия

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Назначение

`core-badge` — inline-flex метка для состояния, числа, категории или короткого дополнения в тексте. По умолчанию использует размер шрифта s, небольшие отступы, fit-content ширину и vertical-align middle. Это не интерактивный элемент автоматически.

`core-badge-button` имеет собственное основание и состояния; его можно поставить на button или ссылку. Сочетание с `core-badge` допустимо, но не обязательно. Не делайте интерактивную метку из span только добавлением этого класса.

## Размеры и варианты

`core-badge-xs/s/m/l/xl` меняют размер шрифта, gap, padding и радиус. Default-badge и явно заданный `core-badge-m` **не одинаковы**: default использует шрифт s, а m — m. У XS/S горизонтальный padding 6 px, M 8 px, L 10 px, XL 12 px при базовой шкале; базовые вертикальные отступы отличаются от явных размерных вариантов.

`core-badge-primary`, `-accent`, `-outline` — варианты. Другие статусы удобно собирать через цветовую систему, например `core-badge core-bg-green:100 core-color-green:800`; это рецепт, не отдельный `core-badge-success`.

## Внутри текста и строки

В обычном тексте база уже содержит vertical-align middle. `core-badge-inline` меняет этот режим и снимает transform; не описывайте его как универсальное «центрировать». В `core-row` можно использовать `core-sxHeight-middle` при наличии непосредственного текстового соседа с распознаваемым размером.

Бирка со словом «Ошибка» не создаёт live region и не связывается с полем. Семантику состояния задаёт приложение. Цвет или один символ без объяснения часто недостаточны.

### E33. Размеры и варианты бирок

Сначала одинаковая бирка в пяти размерах. Ниже один размер M и разные варианты оформления.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Размеры</h3>
    <div class="core-row core-y-center core-g-6x">
      <span class="core-badge core-badge-xs">XS · 24</span>
      <span class="core-badge core-badge-s">S · 24</span>
      <span class="core-badge core-badge-m">M · 24</span>
      <span class="core-badge core-badge-l">L · 24</span>
      <span class="core-badge core-badge-xl">XL · 24</span>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Оформление M</h3>
    <div class="core-row core-y-center core-g-6x">
      <span class="core-badge core-badge-m ">Обычная</span>
      <span class="core-badge core-badge-m core-badge-primary">Основная</span>
      <span class="core-badge core-badge-m core-badge-accent">Акцентная</span>
      <span class="core-badge core-badge-m core-badge-outline">Контурная</span>
      <span class="core-badge core-badge-m core-bg-green:100 core-color-green:800">Готово</span>
    </div>
  </div>
</div>
```

<!-- demo:E33 -->

### E34. Иконки, счётчики и кнопки-бирки

Компактные элементы в тексте и отдельно. Интерактивные бирки используют button; disabled задан нативным атрибутом.

```html
<div class="core-col core-g-8x">
  <p class="core-text">В проекте <span class="core-badge core-badge-inline">12</span> задач, <span class="core-badge core-badge-s core-badge-inline core-bg-green:100 core-color-green:800"><span class="core-icon-check core-icon-6x" aria-hidden="true"></span> 8 готово</span>.</p>
  <div class="core-row core-y-center core-g-6x">
    <span class="core-badge core-badge-outline"><span class="core-icon-lock-locked core-icon-6x" aria-hidden="true"></span> Доступ закрыт</span>
    <button type="button" class="core-badge-button core-badge-s"><span class="core-icon-copy core-icon-6x" aria-hidden="true"></span> Копировать ID</button>
    <button type="button" class="core-badge-button core-badge-s" disabled><span class="core-icon-download core-icon-6x" aria-hidden="true"></span> Скачать</button>
  </div>
</div>
```

<!-- demo:E34 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
