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

### E33. Метки состояния и размера

«Готово» — композиция бирки и цвета; она не предполагает существование отдельного встроенного status-компонента.

```html
<div class="core-row core-y-center">
  <span class="core-badge core-badge-xs">Черновик</span>
  <span class="core-badge core-badge-m core-bg-green:100 core-color-green:800">Готово</span>
  <span class="core-badge core-badge-l core-badge-accent">24 материала</span>
  <span class="core-badge core-badge-outline">Архив</span>
</div>
```

<!-- demo:E33 -->

### E34. Компактная кнопка и бирка в тексте

Копирование не выполняется: это демонстрация CSS, не неподтверждённого field.js.

```html
<div class="core-col">
  <p class="core-text">В проекте <span class="core-badge">12</span> активных задач.</p>
  <button type="button" class="core-badge-button core-badge-s">
    <span class="core-icon-copy core-icon-xs" aria-hidden="true"></span>Копировать ID
  </button>
</div>
```

<!-- demo:E34 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).

