# Справочник токенов

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

Полный список имён custom properties строится из пяти проверенных CSS-файлов CDN при сборке. [tokens.json](https://nikitakozin.github.io/core-docs/reference/tokens.json) содержит все декларации с файлом, строкой, областью действия и исходным значением. Это не перечень независимых настроек и не список вычисленных default.

Ниже — базовые параметры `core.css`. Тема NK меняет типографику, NKUI — палитру, шкалу текста и контролы; SS задаёт собственные области, TG требует проверки совместимости. Если переменная объявлена в нескольких местах, итог зависит от каскада и наследования. [Правила настройки](tokens.md).

## Основа

```css
--f-s-base: 18px
--w-max-desktop: 1200px
--x: 2px
--icon-x: 2px
--w-max-mobile: 720px
--w-max-tablet: 997px
```

## Размеры и радиусы

```css
--s-0\.5x: calc(var(--x) * 0.5)
--s-1x: calc(var(--x) * 1)
--s-1\.5x: calc(var(--x) * 1.5)
--s-2x: calc(var(--x) * 2)
--s-2\.5x: calc(var(--x) * 2.5)
--s-3x: calc(var(--x) * 3)
--s-3\.5x: calc(var(--x) * 3.5)
--s-4x: calc(var(--x) * 4)
--s-4\.5x: calc(var(--x) * 4.5)
--s-5x: calc(var(--x) * 5)
--s-5\.5x: calc(var(--x) * 5.5)
--s-6x: calc(var(--x) * 6)
--s-7x: calc(var(--x) * 7)
--s-8x: calc(var(--x) * 8)
--s-9x: calc(var(--x) * 9)
--s-10x: calc(var(--x) * 10)
--s-12x: calc(var(--x) * 12)
--s-14x: calc(var(--x) * 14)
--s-16x: calc(var(--x) * 16)
--s-18x: calc(var(--x) * 18)
--s-20x: calc(var(--x) * 20)
--s-22x: calc(var(--x) * 22)
--s-24x: calc(var(--x) * 24)
--s-26x: calc(var(--x) * 26)
--s-28x: calc(var(--x) * 28)
--s-30x: calc(var(--x) * 30)
--s-32x: calc(var(--x) * 32)
--s-36x: calc(var(--x) * 36)
--s-40x: calc(var(--x) * 40)
--s-44x: calc(var(--x) * 44)
--s-48x: calc(var(--x) * 48)
--s-50x: calc(var(--x) * 50)
--s-52x: calc(var(--x) * 52)
--s-56x: calc(var(--x) * 56)
--s-60x: calc(var(--x) * 60)
--s-64x: calc(var(--x) * 64)
--s-70x: calc(var(--x) * 70)
--s-72x: calc(var(--x) * 72)
--s-80x: calc(var(--x) * 80)
--s-90x: calc(var(--x) * 90)
--s-96x: calc(var(--x) * 96)
--s-100x: calc(var(--x) * 100)
--s-112x: calc(var(--x) * 112)
--s-120x: calc(var(--x) * 120)
--s-128x: calc(var(--x) * 128)
--s-140x: calc(var(--x) * 140)
--s-150x: calc(var(--x) * 150)
--s-160x: calc(var(--x) * 160)
--s-170x: calc(var(--x) * 170)
--s-180x: calc(var(--x) * 180)
--s-192x: calc(var(--x) * 192)
--s-200x: calc(var(--x) * 200)
--s-224x: calc(var(--x) * 224)
--s-250x: calc(var(--x) * 250)
--s-256x: calc(var(--x) * 256)
--s-300x: calc(var(--x) * 300)
--s-320x: calc(var(--x) * 320)
--s-350x: calc(var(--x) * 350)
--s-384x: calc(var(--x) * 384)
--s-400x: calc(var(--x) * 400)
--s-450x: calc(var(--x) * 450)
--s-448x: calc(var(--x) * 448)
--s-500x: calc(var(--x) * 500)
--s-512x: calc(var(--x) * 512)
--s-550x: calc(var(--x) * 550)
--s-600x: calc(var(--x) * 600)
--s-640x: calc(var(--x) * 640)
--s-650x: calc(var(--x) * 650)
--s-700x: calc(var(--x) * 700)
--s-750x: calc(var(--x) * 750)
--s-768x: calc(var(--x) * 768)
--s-800x: calc(var(--x) * 800)
--s-850x: calc(var(--x) * 850)
--s-900x: calc(var(--x) * 900)
--s-950x: calc(var(--x) * 950)
--s-1000x: calc(var(--x) * 1000)
--s-1024x: calc(var(--x) * 1024)
--b-r-ellipse: 1.3
--b-r-1x: calc(var(--s-1x) * var(--b-r-ellipse))
--b-r-2x: calc(var(--s-2x) * var(--b-r-ellipse))
--b-r-3x: calc(var(--s-3x) * var(--b-r-ellipse))
--b-r-3\.5x: calc(var(--s-3\.5x) * var(--b-r-ellipse))
--b-r-4x: calc(var(--s-4x) * var(--b-r-ellipse))
--b-r-5x: calc(var(--s-5x) * var(--b-r-ellipse))
--b-r-5\.5x: calc(var(--s-5\.5x) * var(--b-r-ellipse))
--b-r-6x: calc(var(--s-6x) * var(--b-r-ellipse))
--b-r-7x: calc(var(--s-7x) * var(--b-r-ellipse))
--b-r-8x: calc(var(--s-8x) * var(--b-r-ellipse))
--b-r-9x: calc(var(--s-9x) * var(--b-r-ellipse))
--b-r-10x: calc(var(--s-10x) * var(--b-r-ellipse))
--b-r-12x: calc(var(--s-12x) * var(--b-r-ellipse))
--b-r-14x: calc(var(--s-14x) * var(--b-r-ellipse))
--b-r-16x: calc(var(--s-16x) * var(--b-r-ellipse))
--b-r-18x: calc(var(--s-18x) * var(--b-r-ellipse))
--b-r-20x: calc(var(--s-20x) * var(--b-r-ellipse))
--b-r-24x: calc(var(--s-24x) * var(--b-r-ellipse))
--b-r-28x: calc(var(--s-28x) * var(--b-r-ellipse))
--b-r-32x: calc(var(--s-32x) * var(--b-r-ellipse))
--b-r-48x: calc(var(--s-48x) * var(--b-r-ellipse))
--b-r-64x: calc(var(--s-64x) * var(--b-r-ellipse))
--b-r-full: 1000vw
```

## Шрифты и типографика

```css
--font-primary: "Jost", sans-serif
--font-primary-unitsPerEm: 1000
--font-primary-ascender: 1070
--font-primary-descender: 375
--font-primary-sxHeight: 460
--font-primary-sCapHeight: 700
--font-accent-center-compensation: 0.115
--font-primary-l-h-compensation: 0.957
--f-w-normal: 400
--font-primary-center-compensation: 0.115
--font-accent: "PT Serif"
--font-accent-unitsPerEm: 1000
--font-accent-ascender: 1018
--font-accent-descender: 276
--font-accent-sCapHeight: 700
--font-accent-sxHeight: 500
--font-accent-l-h-compensation: 1.114
--font-mono: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', 'Liberation Mono', monospace
--font-mono-unitsPerEm: 1000
--font-mono-ascender: 0
--font-mono-descender: 0
--font-mono-sCapHeight: 0
--font-mono-sxHeight: 0
--font-mono-center-compensation: 0
--font-mono-l-h-compensation: 1
--f-s-xxs: calc(0.6 * var(--f-s-base))
--f-s-xs: calc(0.7 * var(--f-s-base))
--f-s-s: calc(0.8 * var(--f-s-base))
--f-s-m: calc(1 * var(--f-s-base))
--f-s-l: calc(1.3 * var(--f-s-base))
--f-s-xl: calc(1.7 * var(--f-s-base))
--f-s-xxl: calc(2.3 * var(--f-s-base))
--l-h-xxs: 1.4em
--l-h-xs: 1.38em
--l-h-s: 1.3em
--l-h-m: 1.3em
--l-h-l: 1.25em
--l-h-xl: 1.2em
--l-h-xxl: 1.1em
--l-h-head-xs: 1.28em
--l-h-head-s: 1.2em
--l-h-head-m: 1.2em
--l-h-head-l: 1.12em
--l-h-head-xl: 1.12em
--l-h-head-xxl: 1.05em
--f-w-thin: 300
--f-w-semibold: 500
--f-w-bold: 600
```

## Семантические цвета

```css
--color-background: #ffffff
--color-surface: #f1f1f1
--color-foreground: #000
--color-accent: #B2FF35
--color-link: #1f11d8
--color-focus: #ff883e
--color-success: #a9ffa4
--color-warning: #ffd890
--color-danger: #ffbcbc
--color-text-primary: var(--color-foreground)
--color-text-inverse: var(--color-background)
--color-border: color-mix(in srgb, var(--color-foreground), transparent 93%)
--color-surface-alt: #f1f1f1
--color-surface-inverse: #222525
--color-surface-inverse-alt: #222525
--color-mark: #fff2d6
--color-selection: var(--color-foreground)
--color-selection-text: var(--color-background)
--color-scrollbar-background: var(--color-background)
--color-scrollbar-thumb: color-mix(in srgb, var(--color-background), var(--color-foreground) 10%)
```

## Компонентные параметры

```css
--theme-link-color: var(--color-link)
--theme-link-color-hover: var(--color-focus)
--theme-badge-radius: var(--b-r-4x)
--theme-badge-border: 1px solid var(--color-border)
--theme-card-radius: var(--b-r-7x)
--theme-input-bg: color-mix(in srgb, var(--color-surface), var(--color-background) 30%)
--theme-input-bg-hover: color-mix(in srgb, var(--theme-input-bg), var(--color-background) 50%)
--theme-input-bg-focus: var(--color-background)
--theme-input-bg-disabled: color-mix(in srgb, var(--theme-input-bg), transparent 100%)
--theme-input-border: 1px solid color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 7%)
--theme-input-border-hover: 1px solid color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 15%)
--theme-input-border-focus: var(--theme-input-border-hover)
--theme-input-border-disabled: 1px solid color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 4%)
--theme-input-border-dashed: 1px dashed color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 16%)
--theme-input-border-hover-dashed: 1px dashed color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 35%)
--theme-input-border-focus-dashed: var(--theme-input-border-hover-dashed)
--theme-input-placeholder-color: color-mix(in srgb, var(--color-foreground), transparent 70%)
--theme-input-color: var(--color-text-primary)
--theme-input-color-hover: var(--color-text-primary)
--theme-input-color-disabled: color-mix(in srgb, var(--theme-input-color), transparent 50%)
--theme-input-shadow: var(--sh-xs)
--theme-input-shadow-hover: var(--sh-xs)
--theme-input-shadow-disabled: none
--theme-input-shadow-hover-contenteditable: 0 1px 0 0 color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 20%)
--theme-input-shadow-focus-contenteditable: 0 2px 0 0 color-mix(in srgb, var(--theme-input-bg), var(--color-foreground) 20%)
--theme-input-radius: var(--b-r-5\.5x)
--theme-input-height: var(--s-22x)
--theme-input-padding-top: var(--s-4x)
--theme-input-padding-bottom: var(--s-4x)
--theme-input-padding-left: var(--s-6x)
--theme-input-padding-right: var(--s-6x)
--theme-btn-radius: var(--b-r-5\.5x)
--theme-btn-height: var(--s-22x)
--theme-btn-padding-top: var(--s-4x)
--theme-btn-padding-bottom: var(--s-4x)
--theme-btn-padding-left: var(--s-8x)
--theme-btn-padding-right: var(--s-8x)
--theme-btn-shadow: var(--sh-xs)
--theme-btn-shadow-hover: var(--sh-xs)
--theme-btn-border: 1px solid color-mix(in srgb, var(--color-foreground), transparent 93%)
--theme-btn-border-hover: var(--theme-btn-border)
--theme-btn-border-active: var(--theme-btn-border)
--theme-btn-bg: color-mix(in srgb, var(--color-surface), var(--color-foreground) 2%)
--theme-btn-bg-hover: color-mix(in srgb, var(--theme-btn-bg), var(--color-foreground) 5%)
--theme-btn-bg-active: color-mix(in srgb, var(--theme-btn-bg), var(--color-foreground) 11%)
--theme-btn-color: var(--color-text-primary)
--theme-btn-color-hover: var(--theme-btn-color)
--theme-btn-color-active: var(--theme-btn-color)
--theme-btn-bg-primary: var(--color-foreground)
--theme-btn-bg-hover-primary: color-mix(in srgb, var(--theme-btn-bg-primary), var(--color-background) 26%)
--theme-btn-bg-active-primary: color-mix(in srgb, var(--theme-btn-bg-primary), var(--color-background) 30%)
--theme-btn-color-primary: var(--color-background)
--theme-btn-color-hover-primary: var(--theme-btn-color-primary)
--theme-btn-color-active-primary: var(--theme-btn-color-primary)
--theme-btn-bg-accent: var(--color-accent)
--theme-btn-bg-hover-accent: color-mix(in srgb, var(--theme-btn-bg-accent), var(--color-foreground) 7%)
--theme-btn-bg-active-accent: color-mix(in srgb, var(--theme-btn-bg-accent), var(--color-foreground) 11%)
--theme-btn-color-accent: #000
--theme-btn-color-hover-accent: var(--theme-btn-color-accent)
--theme-btn-color-active-accent: var(--theme-btn-color-accent)
--theme-btn-bg-outline: transparent
--theme-btn-bg-hover-outline: color-mix(in srgb, var(--theme-btn-bg-outline), var(--color-foreground) 5%)
--theme-btn-bg-active-outline: color-mix(in srgb, var(--theme-btn-bg-outline), var(--color-foreground) 11%)
--theme-btn-color-outline: var(--color-foreground)
--theme-btn-color-hover-outline: var(--theme-btn-color-outline)
--theme-btn-color-active-outline: var(--theme-btn-color-outline)
```

## Ненаследуемые рабочие переменные

Core регистрирует 20 переменных с `inherits: false` и `syntax: "*"`. Регистрация относится ко всему документу. Значение родителя не передаётся потомку само по себе.

```text
--b --b-r --g --h --l --m-b --m-l --m-t --p --p-b --p-b-env --p-l --p-r --p-s --p-t --r --t --tr --w --x
```

## Локальный цветовой расчёт

`--bgc`, `--bgcm`, `--bgc-mix`, `--bgco`, `--bgc-result`, `--bgch`, `--bgchd` — рабочие параметры фона. Они задаются селекторами элемента, не одним root-default. Аналогично проверяйте локальные параметры текста, границы, размеров и геометрии.

**Источники:** [Core CSS](https://cdn.sdelal.tech/core/latest/core.css), [NK](https://cdn.sdelal.tech/core/latest/theme-nk.css), [SS](https://cdn.sdelal.tech/core/latest/theme-ss.css), [TG](https://cdn.sdelal.tech/core/latest/theme-tg.css).
