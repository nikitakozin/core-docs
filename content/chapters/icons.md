# Иконки: маски, размеры и адаптивность

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Механизм

Иконка создаётся через `::before`: SVG используется как CSS-mask, а силуэт окрашивается `currentColor`. Это не icon font и не вставленный в DOM SVG с путями. Семантическое имя должно находиться у окружающего элемента, а декоративную иконку можно скрыть от assistive technology.

Класс `core-icon-plus` задаёт маску через `--im-img` на элементе, а псевдоэлемент её использует. Размер задавайте числом, например `core-icon-8x`. Общее основание `core-icon` при конкретном `core-icon-*` обычно не требуется.

## Каталог подтверждённых имён

К каждому имени ниже добавьте `core-icon-`. В v185 семейство называется **chevron**; старое написание `shevron` удалено.

```text
add plus close minus check chevron chevron-left chevron-right chevron-down chevron-bottom chevron-top arrow-left arrow-right arrow-bottom arrow-top arrow-undo arrow-redo heart heart-stroked bag calendar search light copy enter setting reload edit lock-locked lock-opened avatar bin eye download upload external-link spinner layers save grab mobile cursor 4star ruble question 54 tg yamaps avito vk whatsapp instagram pinterest
```

`add` и `plus` выбирают одну форму. `chevron` и `chevron-down` соответствуют нижнему шеврону. Иконки брендов являются технически доступными формами; наличие в CSS не отменяет требований к использованию знаков в вашем продукте.

## Размерная шкала

В v190 именованные размеры удалены. Замены прежних xxxs / xxs / xs / s / m / l / xl: `core-icon-4x`, `-5x`, `-6x`, `-7x`, `-8x`, `-10x`, `-12x`. При `--icon-x: 2px` это 8 / 10 / 12 / 14 / 16 / 20 / 24 px.

Числовые классы: `core-icon-1x`, `-2x`, `-3x`, `-4x`, `-5x`, `-6x`, `-7x`, `-8x`, `-9x`, `-10x`, `-12x`, `-14x`, `-16x`, `-18x`, `-20x`, `-24x`, `-28x`, `-32x`, `-48x`, `-64x`; есть t/m-версии.

Числовые размеры назначают `--i-s` элементу; псевдоэлемент наследует значение. `core-icon-8x m-core-icon-6x` даёт 16 px обычно и 12 px при ширине ≤720 px. Проверяйте обе стороны границы 720/721 px.

## Цвет и inline-выравнивание

Цвет меняйте через `core-color-*` на иконке или через действующее наследование currentColor. `core-icon-inline` добавляет вертикальную компенсацию в текстовой строке. Не наслаивайте её без проверки на другой transform, например вращение или sxHeight-компенсацию.

## Иконка-кнопка

`core-icon-button` снимает обычную оболочку, использует приглушённую opacity и состояния focus/hover/disabled. Такая кнопка компактна, но маленький glyph не гарантирует достаточную область нажатия. Для важного мобильного действия лучше обычная `core-button` с внутренней иконкой и accessible name.

## Собственная иконка

Можно использовать собственный элемент SVG внутри обычной кнопки либо явно расширить маску проектным CSS. Не редактируйте встроенные data-URI автоматически и не называйте пользовательский класс несуществующим встроенным API.

### E35. Набор служебных иконок

Для отдельной демонстрации каждая форма получила имя; внутри подписанной кнопки такие иконки обычно декоративны.

```html
<div class="core-row core-y-center core-g-10x">
  <span class="core-icon-plus core-icon-12x" role="img" aria-label="Добавить"></span>
  <span class="core-icon-search core-icon-12x" role="img" aria-label="Поиск"></span>
  <span class="core-icon-layers core-icon-12x" role="img" aria-label="Слои"></span>
  <span class="core-icon-calendar core-icon-12x" role="img" aria-label="Календарь"></span>
  <span class="core-icon-check core-icon-12x core-color-green:700" role="img" aria-label="Готово"></span>
</div>
```

<!-- demo:E35 -->

### E36. Кнопка только с иконкой: два варианта оболочки

Оба элемента доступны по имени. Их кликабельные области различаются; вторая явно оформлена как кнопка.

```html
<div class="core-row core-y-center core-g-12x">
  <button type="button" class="core-icon-button core-icon-close core-icon-8x" aria-label="Закрыть"></button>
  <button type="button" class="core-button" aria-label="Закрыть">
    <span class="core-icon-close core-icon-8x" aria-hidden="true"></span>
  </button>
</div>
```

<!-- demo:E36 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
