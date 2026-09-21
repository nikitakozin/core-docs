# Подключение и первый интерфейс

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Подключение

Подключите один `core.css` с CDN `latest`, затем тему и CSS приложения. Все примеры сверены с неминифицированным файлом из архива. Минифицированной сборки в архиве нет; её эквивалентность не проверялась.

```html
<!doctype html>
<html lang="ru" class="core-solo" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Проект на Core</title>
  <link rel="preconnect" href="https://cdn.sdelal.tech">
  <link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/core.css">
  <link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/theme-nk.css">
  <link rel="stylesheet" href="./app.css">
</head>
<body class="core-bg core-color">
  <main class="core-section core-p-8x">
    <h1 class="core-text core-text-xl core-text-bold">Материалы проекта</h1>
  </main>
</body>
</html>
```

`core-solo` и корневые Core-классы запускают инициализацию метрик шрифта. Для отдельного виджета используйте свой контейнер, но учитывайте глобальные правила фреймворка.

## CDN и актуальность

Все оригинальные CSS/JS Core берите из `https://cdn.sdelal.tech/core/latest/`. В комплекте нет копии фреймворка. Не заменяйте CDN локальным старым файлом, зеркалом или придуманным fallback. При недоступности сети сообщите об этом.

`latest` изменяем. Перед использованием неизвестного класса или API прочитайте текущий исходник. Дата наблюдения и SHA-256 полученного ответа нужны для проверки, но не меняют runtime-ссылку на зафиксированную версию. [Утилита чтения CDN](../tools/inspect-cdn.py) проверяет тексты и не устанавливает зависимости в проект.

## Шрифты

В мануале автоматически подключается официальная `theme-nk.css`. Она объявляет Inter через внешние URL Google Fonts: сам CSS приходит с CDN, но font-face внутри него обращается к другому домену. Это зависимость автора темы, а не локальный ассет архива. При строгом запрете других доменов не подключайте этот файл; используйте системный шрифт или уже загруженный Inter и соответствующие метрики. Не придумывайте адрес шрифта внутри `latest`.

## JavaScript

Для сетки, типографики, оформления контролов, native checkbox/radio/select и обычной прокрутки JS Core не требуется. Для интерактивности используйте ES modules. Штатный `importmap.js` из архива указывает на `v182`; чтобы всё загружалось из `latest`, используйте [явную карту импортов](javascript.md).

### E01. Карточка с заголовком и действием

Карточка, поток, отступ и кнопка — четыре независимые роли. JavaScript приложения здесь не подключён: кнопка демонстрирует оформление, а не добавление материала.

```html
<article class="core-card core-col core-g-6x">
  <h2 class="core-text core-text-l core-text-bold">Материалы проекта</h2>
  <p class="core-text">Бриф, решения и последние версии макетов.</p>
  <button type="button" class="core-button core-button-accent">
    <span class="core-icon-plus core-icon-m" aria-hidden="true"></span>
    Добавить материал
  </button>
</article>
```

<!-- demo:E01 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Каталог файлов](https://cdn.sdelal.tech/core/latest/). [Тема NK](https://cdn.sdelal.tech/core/latest/theme-nk.css).

