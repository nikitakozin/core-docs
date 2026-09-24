# Подключение и первый интерфейс

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Подключение

Подключите один `core.css` из CDN `latest`, затем штатную тему. Собственный CSS для этого мануала и его демонстраций не требуется.

```html
<!doctype html>
<html lang="ru" class="core-solo core-theme-light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Проект на Core</title>
  <link rel="preconnect" href="https://cdn.sdelal.tech">
  <link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/core.css">
  <link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/theme-nk.css">
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

Runtime подключает оригинальные CSS/JS из `https://cdn.sdelal.tech/core/latest/`. Локальных копий Core в репозитории нет: сборка читает документированную версию с CDN, браузерные тесты работают с настоящим latest. При недоступности сети мануал сообщает об ошибке.

`latest` изменяем. Перед использованием неизвестного класса или API прочитайте текущий исходник. Дата наблюдения и SHA-256 полученного ответа нужны для проверки, но не меняют runtime-ссылку на зафиксированную версию. [Утилита чтения CDN](https://github.com/nikitakozin/core-docs/blob/main/tools/inspect-cdn.py) проверяет тексты и не устанавливает зависимости в проект.

> **Проверка файлов.** Проверяем неминифицированные файлы. Для минифицированных вариантов зафиксированы SHA-256, но их семантическая эквивалентность отдельно не проверялась.

## Шрифты

При выборе темы NK подключается официальная `theme-nk.css`. Она объявляет Inter через внешние URL Google Fonts: сам CSS приходит с CDN, но font-face внутри него обращается к другому домену. Это зависимость автора темы, а не локальный ассет архива. При строгом запрете других доменов не подключайте этот файл; используйте системный шрифт или уже загруженный Inter и соответствующие метрики. Не придумывайте адрес шрифта внутри `latest`.

## JavaScript

Для сетки, типографики, оформления контролов, native checkbox/radio/select и обычной прокрутки JS Core не требуется. Для интерактивности используйте ES modules. Штатный `latest/importmap.js` теперь указывает на `latest`; загрузите его до модулей либо используйте [явную карту импортов](javascript.md).

### E01. Карточка с заголовком и действием

Карточка, поток, отступ и кнопка — четыре независимые роли. JavaScript приложения здесь не подключён: кнопка демонстрирует оформление, а не добавление материала.

```html
<article class="core-card core-col core-g-6x">
  <h2 class="core-text core-text-l core-text-bold">Материалы проекта</h2>
  <p class="core-text">Бриф, решения и последние версии макетов.</p>
  <button type="button" class="core-button core-button-accent">
    <span class="core-icon-plus core-icon-8x" aria-hidden="true"></span>
    Добавить материал
  </button>
</article>
```

<!-- demo:E01 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Каталог файлов](https://cdn.sdelal.tech/core/latest/). [Тема NK](https://cdn.sdelal.tech/core/latest/theme-nk.css).
