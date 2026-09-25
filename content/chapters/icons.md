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

### E35. Полный каталог иконок Core

Все подтверждённые имена показаны с точным классом. Силуэт декоративен: рядом находится видимая подпись.

```html
<div class="core-grid core-grid-3c t-core-grid-2c m-core-grid-1c core-g-4x">
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-add core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-add</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-plus core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-plus</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-close core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-close</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-minus core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-minus</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-check core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-check</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron-left core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron-left</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron-right core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron-right</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron-down core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron-down</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron-bottom core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron-bottom</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-chevron-top core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-chevron-top</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-left core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-left</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-right core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-right</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-bottom core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-bottom</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-top core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-top</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-undo core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-undo</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-arrow-redo core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-arrow-redo</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-heart core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-heart</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-heart-stroked core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-heart-stroked</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-bag core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-bag</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-calendar core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-calendar</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-search core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-search</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-light core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-light</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-copy core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-copy</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-enter core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-enter</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-setting core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-setting</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-reload core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-reload</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-edit core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-edit</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-lock-locked core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-lock-locked</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-lock-opened core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-lock-opened</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-avatar core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-avatar</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-bin core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-bin</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-eye core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-eye</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-download core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-download</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-upload core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-upload</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-external-link core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-external-link</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-spinner core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-spinner</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-layers core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-layers</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-save core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-save</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-grab core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-grab</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-mobile core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-mobile</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-cursor core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-cursor</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-4star core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-4star</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-ruble core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-ruble</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-question core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-question</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-54 core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-54</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-tg core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-tg</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-yamaps core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-yamaps</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-avito core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-avito</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-vk core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-vk</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-whatsapp core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-whatsapp</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-instagram core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-instagram</span>
  </div>
  <div class="core-card core-row core-nowrap core-y-center core-g-8x core-p-8x">
    <span class="core-icon-pinterest core-icon-12x" aria-hidden="true"></span>
    <span class="core-text core-text-s core-text-mono">core-icon-pinterest</span>
  </div>
</div>
```

<!-- demo:E35 -->

### E36. Кнопки с иконкой: оболочка и disabled

Один и тот же знак сравнивается в core-icon-button и core-button, затем в отключённом состоянии. У всех кнопок есть доступное имя.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Закрыть</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-icon-button core-icon-close core-icon-12x" aria-label="Закрыть · иконка"></button>
      <button type="button" class="core-icon-button core-icon-close core-icon-12x" aria-label="Закрыть · иконка" disabled></button>
      <button type="button" class="core-button" aria-label="Закрыть · кнопка"><span class="core-icon-close core-icon-12x" aria-hidden="true"></span></button>
      <button type="button" class="core-button" aria-label="Закрыть · кнопка" disabled><span class="core-icon-close core-icon-12x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Поиск</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-icon-button core-icon-search core-icon-12x" aria-label="Поиск · иконка"></button>
      <button type="button" class="core-icon-button core-icon-search core-icon-12x" aria-label="Поиск · иконка" disabled></button>
      <button type="button" class="core-button" aria-label="Поиск · кнопка"><span class="core-icon-search core-icon-12x" aria-hidden="true"></span></button>
      <button type="button" class="core-button" aria-label="Поиск · кнопка" disabled><span class="core-icon-search core-icon-12x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Сохранить</h3>
    <div class="core-row core-y-center core-g-6x">
      <button type="button" class="core-icon-button core-icon-save core-icon-12x" aria-label="Сохранить · иконка"></button>
      <button type="button" class="core-icon-button core-icon-save core-icon-12x" aria-label="Сохранить · иконка" disabled></button>
      <button type="button" class="core-button" aria-label="Сохранить · кнопка"><span class="core-icon-save core-icon-12x" aria-hidden="true"></span></button>
      <button type="button" class="core-button" aria-label="Сохранить · кнопка" disabled><span class="core-icon-save core-icon-12x" aria-hidden="true"></span></button>
    </div>
  </div>
</div>
```

<!-- demo:E36 -->

### E83. Числовая шкала, цвет и inline-иконки

Все 20 числовых размеров при стандартном --icon-x:2px. Ниже одна маска в разных цветах и inline-выравнивание рядом с текстом.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Размеры core-icon-*</h3>
    <div class="core-grid core-grid-4c m-core-grid-2c core-g-4x">
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-1x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">1x · 2 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-2x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">2x · 4 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-3x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">3x · 6 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-4x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">4x · 8 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-5x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">5x · 10 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-6x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">6x · 12 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-7x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">7x · 14 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-8x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">8x · 16 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-9x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">9x · 18 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-10x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">10x · 20 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-12x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">12x · 24 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-14x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">14x · 28 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-16x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">16x · 32 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-18x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">18x · 36 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-20x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">20x · 40 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-24x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">24x · 48 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-28x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">28x · 56 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-32x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">32x · 64 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-48x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">48x · 96 px</span>
      </div>
      <div class="core-card core-col core-x-center core-g-6x">
        <div class="core-col core-center core-h-80x">
          <span class="core-icon-54 core-icon-64x" aria-hidden="true"></span>
        </div>
        <span class="core-text core-text-s core-text-mono">64x · 128 px</span>
      </div>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Один силуэт, разные цвета</h3>
    <div class="core-row core-y-center core-g-6x">
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-red:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">red</span>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-orange:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">orange</span>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-green:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">green</span>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-blue:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">blue</span>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-purple:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">purple</span>
      </div>
      <div class="core-col core-g-8x">
        <span class="core-icon-heart core-icon-16x core-color-pink:700" aria-hidden="true"></span>
        <span class="core-text core-text-s core-text-mono">pink</span>
      </div>
    </div>
  </div>
  <p class="core-text core-text-l"><span class="core-icon-check core-icon-8x core-icon-inline" aria-hidden="true"></span> Материалы готовы</p>
</div>
```

<!-- demo:E83 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
