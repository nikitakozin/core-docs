# Рецепты составных интерфейсов

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Как использовать рецепты

Каждый рецепт — оригинальная композиция существующих классов, а не новый встроенный компонент. Здесь нет `core-project-card`, `core-search-panel` или `core-settings-form`. Названия нужны читателю; агент должен копировать структуру и осмысленно адаптировать текст, состояние и семантику.

Действия кнопок не подключены к серверу. Поля имеют реальные подписи. У составных панелей сохраняется корректный порядок DOM. Адаптивные изменения относятся к ширине viewport. Дополнительные CSS-правила, если нужны, показаны отдельно.

### E60. Карточка проекта с метаданными и действиями

На широком экране метаданные стоят в три колонки, действия — в строку. При ≤720 px обе области переходят в вертикальный поток. Оформление и перестройка — только классы Core; значения демонстрационные.

```html
<article class="core-card core-col core-g-8x">
  <header class="core-row core-y-center core-justify">
    <span class="core-badge core-badge-primary">В работе</span>
    <span class="core-text core-text-s">Обновлено сегодня</span>
  </header>
  <div class="core-col core-g-3x">
    <h3 class="core-text core-text-xl core-text-bold m-core-text-l">Сайт культурного центра</h3>
    <p class="core-text">Афиша, события и материалы для посетителей.</p>
  </div>
  <dl class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
    <div class="core-col core-g-2x"><dt class="core-text core-text-xs">Этап</dt><dd class="core-text">Прототип</dd></div>
    <div class="core-col core-g-2x"><dt class="core-text core-text-xs">Срок</dt><dd class="core-text">28 сентября</dd></div>
    <div class="core-col core-g-2x"><dt class="core-text core-text-xs">Команда</dt><dd class="core-text">4 участника</dd></div>
  </dl>
  <hr class="core-hr">
  <footer class="core-row m-core-col core-g-4x">
    <button type="button" class="core-button core-button-primary">Открыть проект</button>
    <button type="button" class="core-button core-button-outline">Материалы</button>
  </footer>
</article>
```

<!-- demo:E60 -->

### E61. Панель поиска с самостоятельной кнопкой

Внешняя кнопка сохраняет самостоятельное оформление. Перенос её внутрь input-box изменил бы фон, границу, размер и отступы.

```html
<form class="core-col core-g-4x" action="#" method="get" onsubmit="return false">
  <label class="core-text core-text-bold" for="project-query">Найти в проекте</label>
  <div class="core-row core-nowrap m-core-col core-g-4x">
    <div class="core-input-box core-grow core-shrink">
      <span class="core-icon-search core-icon-m" aria-hidden="true"></span>
      <input class="core-input" id="project-query" name="q" type="search" placeholder="Название или фрагмент текста">
    </div>
    <button class="core-button core-button-primary" type="submit">Найти</button>
  </div>
  <p class="core-text core-text-s">Отправка намеренно отключена: демонстрируется только интерфейс.</p>
</form>
```

<!-- demo:E61 -->

### E62. Настройки с нативным выбором и подписью

Выбор и редактирование работают нативно. Сохранение/отмена — не подключённые в данном примере прикладные действия.

```html
<section class="core-card core-col core-p-12x core-g-8x" aria-labelledby="settings-title">
  <h2 class="core-text core-text-l core-text-bold" id="settings-title">Параметры документа</h2>
  <div class="core-form-item">
    <label for="doc-name" class="core-text core-text-bold">Название</label>
    <input class="core-input" id="doc-name" name="title" value="Структура сайта">
  </div>
  <div class="core-form-item">
    <label for="doc-stage" class="core-text core-text-bold">Этап</label>
    <select class="core-select" id="doc-stage" name="stage"><option>Исследование</option><option>Проектирование</option><option>Дизайн</option></select>
  </div>
  <label class="core-checkbox">
    <input type="checkbox" name="notify" checked>
    <span class="core-checkbox-label">Сообщать команде об изменениях</span>
  </label>
  <div class="core-row core-g-4x">
    <button type="button" class="core-button core-button-primary">Сохранить</button>
    <button type="button" class="core-button core-button-transparent">Отменить</button>
  </div>
</section>
```

<!-- demo:E62 -->

### E63. Содержательное раскрытие без Core JS

Нативный details, не collapse.js. Клавиатурное раскрытие предоставляет браузер; оформление маркера и фокус нужно проверять в целевых браузерах.

```html
<details class="core-card core-content">
  <summary>Что входит в этап проектирования?</summary>
  <p>Сценарии, структура страниц, состояния компонентов и требования к содержанию.</p>
  <ul><li>Схема навигации.</li><li>Прототипы ключевых страниц.</li><li>Согласованный состав данных.</li></ul>
</details>
```

<!-- demo:E63 -->

### E64. Пустое состояние с доступным действием

Иконка декоративная, действие названо текстом. Здесь центрирование относится к элементам колонки, а не автоматически к строкам многострочного текста.

```html
<section class="core-card core-col core-x-center core-p-24x m-core-p-12x core-g-8x" aria-labelledby="empty-title">
  <span class="core-icon-layers core-icon-24x" aria-hidden="true"></span>
  <h2 class="core-text core-text-l core-text-bold" id="empty-title">Материалов пока нет</h2>
  <p class="core-text">Добавьте бриф или заметку, чтобы начать работу с проектом.</p>
  <button type="button" class="core-button core-button-accent"><span class="core-icon-plus core-icon-m" aria-hidden="true"></span>Добавить материал</button>
</section>
```

<!-- demo:E64 -->

### E70. Рабочая панель: статистика, проекты и боковой блок

1200 px: четыре показателя и две рабочие области. 997 px: два показателя в ряд, боковая область уходит вниз. 720 px: по одной колонке. Вложенные grid получают собственные треки, поэтому не наследуют конфигурацию внешней сетки. Только Core, без CSS приложения.

```html
<section class="core-col core-g-12x" aria-labelledby="dashboard-title">
  <header class="core-row core-justify core-y-center m-core-col m-core-x-start core-g-6x">
    <div class="core-col core-g-2x">
      <h3 id="dashboard-title" class="core-text core-text-xl core-text-bold">Проекты команды</h3>
      <p class="core-text core-text-s">Сводка рабочей недели · демонстрационные данные</p>
    </div>
    <button type="button" class="core-button core-button-primary">Создать проект</button>
  </header>
  <dl class="core-grid core-grid-4c t-core-grid-2c m-core-grid-1c core-g-6x">
    <div class="core-card core-col core-g-2x"><dt class="core-text core-text-s">В работе</dt><dd class="core-text core-text-xl core-text-bold">12</dd></div>
    <div class="core-card core-col core-g-2x"><dt class="core-text core-text-s">На проверке</dt><dd class="core-text core-text-xl core-text-bold">4</dd></div>
    <div class="core-card core-col core-g-2x"><dt class="core-text core-text-s">Готово за неделю</dt><dd class="core-text core-text-xl core-text-bold">8</dd></div>
    <div class="core-card core-col core-g-2x"><dt class="core-text core-text-s">Участники</dt><dd class="core-text core-text-xl core-text-bold">6</dd></div>
  </dl>
  <div class="core-grid core-grid-2c-2fr-1fr t-core-grid-1c core-g-8x">
    <section class="core-card core-col core-g-8x core-shrink" aria-label="Ближайшие задачи">
      <h4 class="core-text core-text-bold">Ближайшие задачи</h4>
      <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
        <article class="core-col core-g-4x"><span class="core-badge">Прототип</span><h5 class="core-text core-text-bold">Личный кабинет</h5><p class="core-text core-text-s">Проверить сценарий изменения контактов.</p></article>
        <article class="core-col core-g-4x"><span class="core-badge">Контент</span><h5 class="core-text core-text-bold">Культурный центр</h5><p class="core-text core-text-s">Согласовать структуру афиши.</p></article>
      </div>
    </section>
    <aside class="core-card core-col core-g-6x">
      <h4 class="core-text core-text-bold">Передача в разработку</h4>
      <label class="core-checkbox"><input type="checkbox" checked><span class="core-checkbox-label">Токены опубликованы</span></label>
      <label class="core-checkbox"><input type="checkbox" checked><span class="core-checkbox-label">Состояния описаны</span></label>
      <label class="core-checkbox"><input type="checkbox"><span class="core-checkbox-label">Адаптив проверен</span></label>
    </aside>
  </div>
</section>
```

<!-- demo:E70 -->


### E71. Сравнение пакетов: карточки с разным объёмом текста

Сравните 1200/997/390 px: три, две и одна колонка. Карточки растягиваются по высоте строки grid, а `core-grow` у списка отодвигает кнопку вниз. Это демонстрационные варианты, не тарифы реального продукта.

```html
<div class="core-grid core-grid-3c t-core-grid-2c m-core-grid-1c core-g-8x">
  <article class="core-card core-col core-g-8x core-shrink">
    <div class="core-col core-g-3x"><span class="core-badge">1 участник</span><h3 class="core-text core-text-xl core-text-bold">Личный</h3></div>
    <p class="core-text core-text-s">Документы и задачи для одного проекта.</p>
    <ul class="core-list core-grow"><li>Структура материалов</li><li>Личные заметки</li></ul>
    <button type="button" class="core-button core-button-outline">Выбрать «Личный»</button>
  </article>
  <article class="core-card core-col core-g-8x core-shrink">
    <div class="core-col core-g-3x"><span class="core-badge">До 8 участников</span><h3 class="core-text core-text-xl core-text-bold">Команда</h3></div>
    <p class="core-text core-text-s">Общие материалы и согласование решений.</p>
    <ul class="core-list core-grow"><li>Всё из личного пространства</li><li>Роли и согласования</li><li>История изменений</li></ul>
    <button type="button" class="core-button core-button-primary">Выбрать «Команда»</button>
  </article>
  <article class="core-card core-col core-g-8x core-shrink">
    <div class="core-col core-g-3x"><span class="core-badge">Несколько команд</span><h3 class="core-text core-text-xl core-text-bold">Студия</h3></div>
    <p class="core-text core-text-s">Раздельные пространства для проектов и клиентов.</p>
    <ul class="core-list core-grow"><li>Всё из команды</li><li>Шаблоны проектов</li><li>Права по пространствам</li></ul>
    <button type="button" class="core-button core-button-outline">Выбрать «Студия»</button>
  </article>
</div>
```

<!-- demo:E71 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
