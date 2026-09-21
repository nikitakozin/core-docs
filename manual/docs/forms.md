# Поля, подписи и базовая форма

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Структура поля

`core-form-item` — вертикальная группа с gap 8 px. Используйте label, реальный контрол и при необходимости текст подсказки. `core-form-item-inline` располагает подпись и контрол горизонтально, а на мобильном переводит в колонку. Это компоновка, не HTML-форма и не связка label автоматически.

Всегда связывайте `<label for>` с уникальным `id`; placeholder не заменяет подпись. Имена `name`, тип, autocomplete и required — часть контракта приложения, а не визуальных классов.

## Семейства

`core-input` — обычный input. `core-textarea` — многострочный textarea. `core-select` — нативный select с оформлением. `core-date` — input type=date. `core-num` — input type=number со специальным оформлением, включая скрытие части browser spinner. `core-file` — **обёртка**, содержащая input type=file. Для contenteditable есть `core-contenteditable`, но атрибут `contenteditable` задаётся отдельно.

Общая база полей: width 100%, высота 44 px, padding 8 px по вертикали и 12 px по горизонтали, тема фона/контура/тени, текст m. Наличие width 100% не гарантирует хорошую геометрию внутри nowrap-ряда; используйте `core-shrink` или растягиваемую обёртку.

## Размеры

Подтверждены профили xs, s, l у input, textarea, select, date, file, num и input-box. Средний размер — база. Не добавляйте по аналогии `core-input-m` как обязательный переключатель: общее среднее правило этого семейства в исследованном блоке не определено.

Высота XS ×0,55, S ×0,73, L ×1,18. L использует шрифт l и горизонтальный padding ×1,65; S оставляет базовый размер текста. Textarea позже получает auto-height: не обещайте фиксированную высоту от того же суффикса; учитывайте rows и содержимое.

## Состояния и ошибки

Есть disabled, placeholder, hover и focus-visible. Передавайте disabled на реальный контрол. `aria-invalid="true"` сообщает о валидационной ошибке, но не обещает готовую красную тему в Core. Отдельного универсального `core-error` в этом руководстве не вводится.

Сообщение об ошибке должно быть связано с полем через aria-describedby. Динамическое уведомление, фокус на первой ошибке и клиентская/серверная проверка — обязанности приложения. Пример ошибки ниже явно задаёт собственные переменные границы и не выдаёт это за встроенный validator.

## JavaScript для полей и отправки

[FieldManager](js-field.md) добавляет числовые действия и копирование. Его обработчики `search` и `date` пока только пишут в консоль — календарь и поиск приложение реализует отдельно.

[FormManager](js-form.md) собирает поля в массив и отправляет JSON POST. По умолчанию сохраняет публичные поля в localStorage и cookie; для временных форм ставьте `data-form-temp`. Он не обрабатывает файлы как File, не собирает все значения multiple-select и не считает HTTP 4xx/5xx ошибкой автоматически. Для таких форм используйте собственную отправку, не меняя CSS-разметку.

## Дата, число и файл

Нативные date/select различаются по браузерам. В showcase рекомендуется `core-input-box` для контролируемого размещения иконок. Не обещайте одинаковый календарь выбора даты во всех ОС: Core оформляет контрол, а нативный picker остаётся браузерным.

`core-num` не доказывает поддержку валютной маски или локального форматирования. `core-file` не реализует загрузку на сервер. Семантические ограничения min/max/step/accept следует задавать отдельно.

### E37. Поле с подписью и подсказкой

id уникален внутри своего документа. Подпись и подсказка связаны с контролом, а не просто расположены рядом.

```html
<div class="core-form-item">
  <label for="project-title">Название проекта</label>
  <input id="project-title" name="title" class="core-input" autocomplete="off"
         aria-describedby="project-title-help" placeholder="Например, сайт театра">
  <p id="project-title-help" class="core-text core-text-s">Название видит вся команда.</p>
</div>
```

<!-- demo:E37 -->

### E38. Нативные select, date и number

Нативные элементы остаются управляемыми браузером. Код не использует form.js или field.js.

```html
<div class="core-grid core-grid-3c m-core-grid-1c">
  <div class="core-form-item"><label for="stage">Этап</label><select id="stage" class="core-select"><option>Исследование</option><option>Дизайн</option></select></div>
  <div class="core-form-item"><label for="deadline">Срок</label><input id="deadline" type="date" class="core-date"></div>
  <div class="core-form-item"><label for="hours">Часы</label><input id="hours" type="number" min="0" step="0.5" value="12" class="core-num"></div>
</div>
```

<!-- demo:E38 -->

### E39. Текстовая область и поле только для чтения

readonly и disabled имеют разную HTML-семантику. Внешний вид readonly не объявлен отдельным Core-состоянием.

```html
<div class="core-col core-g-8x">
  <div class="core-form-item"><label for="description">Описание</label><textarea id="description" class="core-textarea" rows="3" placeholder="Контекст и ограничения"></textarea></div>
  <div class="core-form-item"><label for="project-code">Код проекта</label><input id="project-code" class="core-input" value="PRJ-024" readonly></div>
</div>
```

<!-- demo:E39 -->

### E40. Ошибка с явной семантикой и явным оформлением

Это рецепт, не встроенная validation-тема. Состояния контура заданы вместе; текст ошибки не зависит только от цвета.

```html
<div class="core-form-item">
  <label for="email-error">Электронная почта</label>
  <input id="email-error" type="email" class="core-input" value="team@"
    aria-invalid="true" aria-describedby="email-message"
    style="--theme-input-border: 1px solid #b42318;
           --theme-input-border-hover: 1px solid #b42318;
           --theme-input-border-focus: 1px solid #b42318">
  <p id="email-message" class="core-text core-text-s">Введите полный адрес, например team@example.test.</p>
</div>
```

<!-- demo:E40 -->

### E41. Выбор файла в оформленной обёртке

Файл выбирается нативно, но никуда не отправляется. accept — подсказка выбора, не серверная проверка содержимого.

```html
<div class="core-form-item">
  <label for="brief-file">Бриф проекта</label>
  <div class="core-file"><input id="brief-file" type="file" name="brief" accept=".pdf,.docx,.txt"></div>
</div>
```

<!-- demo:E41 -->

### E65. Форма заявки: две колонки → одна

Выберите 721 и 720 px: парные поля переходят в одну колонку, кнопки — в вертикальный стек. `required` и `type="email"` проверяет браузер; серверной отправки нет. Введите текст и смените ширину или тему — значения сохранятся.

```html
<form class="core-card core-col core-g-12x" aria-labelledby="brief-title">
  <header class="core-col core-g-3x">
    <h3 id="brief-title" class="core-text core-text-xl core-text-bold">Обсудить проект</h3>
    <p class="core-text core-text-s">Укажите контакты, сроки и задачу. Данные никуда не отправляются.</p>
  </header>
  <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-name">Ваше имя *</label>
      <input class="core-input" id="brief-name" name="name" autocomplete="name" required placeholder="Анна">
    </div>
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-company">Компания</label>
      <input class="core-input" id="brief-company" name="company" autocomplete="organization" placeholder="Название компании">
    </div>
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-email">Электронная почта *</label>
      <input class="core-input" id="brief-email" name="email" type="email" autocomplete="email" required placeholder="anna@example.org">
    </div>
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-phone">Телефон</label>
      <input class="core-input" id="brief-phone" name="phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00">
    </div>
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-type">Что нужно сделать</label>
      <select class="core-select" id="brief-type" name="type"><option>Сайт</option><option>Интерфейс сервиса</option><option>Айдентика</option></select>
    </div>
    <div class="core-form-item core-shrink">
      <label class="core-label" for="brief-deadline">Желаемый срок</label>
      <input class="core-date" id="brief-deadline" name="deadline" type="date">
    </div>
  </div>
  <div class="core-form-item">
    <label class="core-label" for="brief-task">Задача</label>
    <textarea class="core-textarea" id="brief-task" name="task" rows="4" aria-describedby="brief-hint" placeholder="Для кого продукт и что должно измениться"></textarea>
    <p id="brief-hint" class="core-text core-text-xs">Достаточно контекста и ожидаемого результата.</p>
  </div>
  <label class="core-checkbox core-checkbox-primary">
    <input type="checkbox" name="copy" checked>
    <span class="core-checkbox-label">Прислать копию заявки на мою почту</span>
  </label>
  <div class="core-row m-core-col core-g-4x">
    <button class="core-button core-button-primary" type="submit">Проверить поля</button>
    <button class="core-button core-button-outline" type="reset">Очистить</button>
  </div>
</form>
```

<!-- demo:E65 -->


### E66. Горизонтальные подписи: автоматическая перестройка

`core-form-item-inline` уже содержит media query ≤720 px: row становится column, ширина label — auto. Сравните 721 и 720 px. Это встроенная адаптивность самого компонента, не CSS мануала.

```html
<form class="core-card core-col core-g-10x" aria-labelledby="profile-title">
  <h3 id="profile-title" class="core-text core-text-bold">Профиль участника</h3>
  <div class="core-form-item-inline">
    <label class="core-label" for="profile-name">Имя</label>
    <input class="core-input" id="profile-name" name="name" autocomplete="name" value="Анна Иванова">
  </div>
  <div class="core-form-item-inline">
    <label class="core-label" for="profile-email">Почта</label>
    <input class="core-input" id="profile-email" name="email" type="email" autocomplete="email" value="anna@example.org">
  </div>
  <div class="core-form-item-inline">
    <label class="core-label" for="profile-role">Роль</label>
    <select class="core-select" id="profile-role" name="role"><option>Редактор</option><option>Дизайнер</option><option>Наблюдатель</option></select>
  </div>
  <p class="core-text core-text-s">На телефоне подпись перемещается над полем — без дополнительных классов.</p>
</form>
```

<!-- demo:E66 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Примеры полей showcase](https://cdn.sdelal.tech/core-dev/showcase.php).
