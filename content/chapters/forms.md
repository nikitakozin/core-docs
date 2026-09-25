# Поля, подписи и базовая форма

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Структура поля

В v190 `core-form-item`, `core-form-item-inline` и `core-label` удалены. Вертикальную группу собирайте как `core-col core-g-4x`, подпись — обычный `label` с `core-text core-text-s`. Горизонтальная группа — композиция `core-row`, выравнивания и `m-core-col`, как в E66. Связь label с полем задают `for` и `id`.

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

### E37. Размеры input: пустое и заполненное

Сравниваются XS/S/базовый/L. Подпись оборачивает каждое поле; placeholder дополняет, но не заменяет её.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS · core-input-xs</h3>
    <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Пустое</span>
        <input class="core-input core-input-xs" placeholder="Название проекта">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Заполненное</span>
        <input class="core-input core-input-xs" value="Сайт театра">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S · core-input-s</h3>
    <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Пустое</span>
        <input class="core-input core-input-s" placeholder="Название проекта">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Заполненное</span>
        <input class="core-input core-input-s" value="Сайт театра">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M · base</h3>
    <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Пустое</span>
        <input class="core-input" placeholder="Название проекта">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Заполненное</span>
        <input class="core-input" value="Сайт театра">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L · core-input-l</h3>
    <div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Пустое</span>
        <input class="core-input core-input-l" placeholder="Название проекта">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Заполненное</span>
        <input class="core-input core-input-l" value="Сайт театра">
      </label>
    </div>
  </div>
</div>
```

<!-- demo:E37 -->

### E38. Select, date и number: размерные ряды

Типы сравниваются в одной строке для каждого размера. Последняя строка показывает нативный disabled, включая стрелку select.

```html
<div class="core-col core-g-8x">
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">XS</h3>
    <div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Этап</span>
        <select class="core-select core-select-xs"><option>Исследование</option><option>Дизайн</option></select>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Срок</span>
        <input type="date" class="core-date core-date-xs" value="2026-10-01">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Часы</span>
        <input type="number" class="core-num core-num-xs" min="0" step="0.5" value="12">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">S</h3>
    <div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Этап</span>
        <select class="core-select core-select-s"><option>Исследование</option><option>Дизайн</option></select>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Срок</span>
        <input type="date" class="core-date core-date-s" value="2026-10-01">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Часы</span>
        <input type="number" class="core-num core-num-s" min="0" step="0.5" value="12">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">M</h3>
    <div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Этап</span>
        <select class="core-select"><option>Исследование</option><option>Дизайн</option></select>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Срок</span>
        <input type="date" class="core-date" value="2026-10-01">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Часы</span>
        <input type="number" class="core-num" min="0" step="0.5" value="12">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">L</h3>
    <div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Этап</span>
        <select class="core-select core-select-l"><option>Исследование</option><option>Дизайн</option></select>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Срок</span>
        <input type="date" class="core-date core-date-l" value="2026-10-01">
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Часы</span>
        <input type="number" class="core-num core-num-l" min="0" step="0.5" value="12">
      </label>
    </div>
  </div>
  <div class="core-col core-g-8x">
    <h3 class="core-text core-text-bold">Отключённые контролы</h3>
    <div class="core-grid core-grid-3c m-core-grid-1c core-g-8x">
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Этап</span>
        <select class="core-select" disabled><option>Недоступно</option></select>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Срок</span>
        <input type="date" class="core-date" value="2026-10-01" disabled>
      </label>
      <label class="core-col core-g-3x">
        <span class="core-text core-text-s">Часы</span>
        <input type="number" class="core-num" value="12" disabled>
      </label>
    </div>
  </div>
</div>
```

<!-- demo:E38 -->

### E39. Textarea, readonly и disabled

Сравните размеры textarea, затем readonly и disabled. Readonly остаётся доступным для фокуса и выделения текста.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Textarea · XS</span>
    <textarea class="core-textarea core-textarea-xs" rows="2" placeholder="Контекст и ограничения"></textarea>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Textarea · S</span>
    <textarea class="core-textarea core-textarea-s" rows="2" placeholder="Контекст и ограничения"></textarea>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Textarea · M</span>
    <textarea class="core-textarea" rows="2" placeholder="Контекст и ограничения"></textarea>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Textarea · L</span>
    <textarea class="core-textarea core-textarea-l" rows="2" placeholder="Контекст и ограничения"></textarea>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Readonly input</span>
    <input class="core-input" value="PRJ-024" readonly>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Disabled input</span>
    <input class="core-input" value="Недоступно" disabled>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Readonly textarea</span>
    <textarea class="core-textarea" rows="2" readonly>Согласованный контекст</textarea>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Disabled textarea</span>
    <textarea class="core-textarea" rows="2" disabled>Редактирование недоступно</textarea>
  </label>
</div>
```

<!-- demo:E39 -->

### E40. Ошибка в четырёх размерах поля

aria-invalid сообщает о состоянии, aria-describedby связывает подсказку. Контур настроен штатными токенами Core; текст ошибки остаётся видимым.

```html
<div class="core-grid core-grid-2c m-core-grid-1c core-g-8x">
  <div class="core-col core-g-8x">
    <label for="email-error-xs" class="core-text core-text-s">Email · XS</label>
    <input id="email-error-xs" type="email" class="core-input core-input-xs" value="team@" aria-invalid="true" aria-describedby="email-error-xs-help" style="--theme-input-border:1px solid var(--color-danger);--theme-input-border-hover:1px solid var(--color-danger);--theme-input-border-focus:1px solid var(--color-danger)">
    <p id="email-error-xs-help" class="core-text core-text-s">Укажите полный адрес: team@example.test.</p>
  </div>
  <div class="core-col core-g-8x">
    <label for="email-error-s" class="core-text core-text-s">Email · S</label>
    <input id="email-error-s" type="email" class="core-input core-input-s" value="team@" aria-invalid="true" aria-describedby="email-error-s-help" style="--theme-input-border:1px solid var(--color-danger);--theme-input-border-hover:1px solid var(--color-danger);--theme-input-border-focus:1px solid var(--color-danger)">
    <p id="email-error-s-help" class="core-text core-text-s">Укажите полный адрес: team@example.test.</p>
  </div>
  <div class="core-col core-g-8x">
    <label for="email-error-m" class="core-text core-text-s">Email · M</label>
    <input id="email-error-m" type="email" class="core-input" value="team@" aria-invalid="true" aria-describedby="email-error-m-help" style="--theme-input-border:1px solid var(--color-danger);--theme-input-border-hover:1px solid var(--color-danger);--theme-input-border-focus:1px solid var(--color-danger)">
    <p id="email-error-m-help" class="core-text core-text-s">Укажите полный адрес: team@example.test.</p>
  </div>
  <div class="core-col core-g-8x">
    <label for="email-error-l" class="core-text core-text-s">Email · L</label>
    <input id="email-error-l" type="email" class="core-input core-input-l" value="team@" aria-invalid="true" aria-describedby="email-error-l-help" style="--theme-input-border:1px solid var(--color-danger);--theme-input-border-hover:1px solid var(--color-danger);--theme-input-border-focus:1px solid var(--color-danger)">
    <p id="email-error-l-help" class="core-text core-text-s">Укажите полный адрес: team@example.test.</p>
  </div>
</div>
```

<!-- demo:E40 -->

### E41. Выбор файла: размеры и disabled

Нативный file-input расположен внутри core-file. Можно выбрать локальный файл; пример ничего не загружает на сервер.

```html
<div class="core-col core-g-8x">
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Бриф · XS</span>
    <div class="core-file core-file-xs"><input type="file" accept=".pdf,.docx,.txt" aria-label="Бриф · XS"></div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Бриф · S</span>
    <div class="core-file core-file-s"><input type="file" accept=".pdf,.docx,.txt" aria-label="Бриф · S"></div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Бриф · M</span>
    <div class="core-file"><input type="file" accept=".pdf,.docx,.txt" aria-label="Бриф · M"></div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Бриф · L</span>
    <div class="core-file core-file-l"><input type="file" accept=".pdf,.docx,.txt" aria-label="Бриф · L"></div>
  </label>
  <label class="core-col core-g-3x">
    <span class="core-text core-text-s">Недоступный выбор</span>
    <div class="core-file"><input type="file" disabled aria-label="Недоступный выбор файла"></div>
  </label>
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
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-name">Ваше имя *</label>
      <input class="core-input" id="brief-name" name="name" autocomplete="name" required placeholder="Анна">
    </div>
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-company">Компания</label>
      <input class="core-input" id="brief-company" name="company" autocomplete="organization" placeholder="Название компании">
    </div>
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-email">Электронная почта *</label>
      <input class="core-input" id="brief-email" name="email" type="email" autocomplete="email" required placeholder="anna@example.org">
    </div>
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-phone">Телефон</label>
      <input class="core-input" id="brief-phone" name="phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00">
    </div>
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-type">Что нужно сделать</label>
      <select class="core-select" id="brief-type" name="type"><option>Сайт</option><option>Интерфейс сервиса</option><option>Айдентика</option></select>
    </div>
    <div class="core-col core-g-4x core-shrink">
      <label class="core-text core-text-s" for="brief-deadline">Желаемый срок</label>
      <input class="core-date" id="brief-deadline" name="deadline" type="date">
    </div>
  </div>
  <div class="core-col core-g-4x">
    <label class="core-text core-text-s" for="brief-task">Задача</label>
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

E66 использует составной рецепт: строка без переноса (`core-row core-nowrap`) и подпись фиксированной ширины на большом экране, `m-core-col` и `m-core-w-auto` при ≤720 px. Сравните 721 и 720 px. Это композиция штатных утилит, а не отдельный компонент формы или собственный CSS мануала.

```html
<form class="core-card core-col core-g-10x" aria-labelledby="profile-title">
  <h3 id="profile-title" class="core-text core-text-bold">Профиль участника</h3>
  <div class="core-row core-nowrap core-y-center m-core-col core-g-4x m-core-g-2x">
    <label class="core-text core-text-s core-w-40x m-core-w-auto core-noshrink" for="profile-name">Имя</label>
    <input class="core-input core-grow core-shrink" id="profile-name" name="name" autocomplete="name" value="Анна Иванова">
  </div>
  <div class="core-row core-nowrap core-y-center m-core-col core-g-4x m-core-g-2x">
    <label class="core-text core-text-s core-w-40x m-core-w-auto core-noshrink" for="profile-email">Почта</label>
    <input class="core-input core-grow core-shrink" id="profile-email" name="email" type="email" autocomplete="email" value="anna@example.org">
  </div>
  <div class="core-row core-nowrap core-y-center m-core-col core-g-4x m-core-g-2x">
    <label class="core-text core-text-s core-w-40x m-core-w-auto core-noshrink" for="profile-role">Роль</label>
    <select class="core-select core-grow core-shrink" id="profile-role" name="role"><option>Редактор</option><option>Дизайнер</option><option>Наблюдатель</option></select>
  </div>
  <p class="core-text core-text-s">На телефоне m-core-col перемещает подпись над полем.</p>
</form>
```

<!-- demo:E66 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Примеры полей showcase](https://cdn.sdelal.tech/core-dev/showcase.php).
