# JavaScript: подключение и выбор модуля

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

Все десять функциональных модулей в v185 совпадают по SHA-256 с ранее прочитанным v182. Загрузчик importmap изменился. Модули — браузерные ESM; React, сборщик и Node.js для их работы на странице не нужны. Подключайте только нужные функции.

## Подключение из latest

В v185 карта зависит от канала: `latest/importmap.js` указывает на `latest`, а `v185/importmap.js` — на `v185`. Штатный загрузчик подключайте до первого ESM. Для явного контроля адресов можно оставить карту ниже:

```html
<script type="importmap">
{
  "imports": {
    "collapse": "https://cdn.sdelal.tech/core/latest/collapse.js",
    "event": "https://cdn.sdelal.tech/core/latest/event.js",
    "field": "https://cdn.sdelal.tech/core/latest/field.js",
    "form": "https://cdn.sdelal.tech/core/latest/form.js",
    "motion": "https://cdn.sdelal.tech/core/latest/motion.js",
    "navigation": "https://cdn.sdelal.tech/core/latest/navigation.js",
    "popup": "https://cdn.sdelal.tech/core/latest/popup.js",
    "resource": "https://cdn.sdelal.tech/core/latest/resource.js",
    "slider": "https://cdn.sdelal.tech/core/latest/slider.js",
    "state": "https://cdn.sdelal.tech/core/latest/state.js"
  }
}
</script>
<script type="module">
  import EventEmitter from 'event';
  import SliderManager from 'slider';
  const events = new EventEmitter();
  const sliders = new SliderManager();
</script>
```

Поместите карту **до первого модульного скрипта**. Альтернатива — абсолютные импорты прямо из `https://cdn.sdelal.tech/core/latest/`, как в разделах модулей. В исходных файлах нет статических импортов друг друга: зависимости передаются экземплярами или через `window`.

Обычный `<script src="slider.js">` неверен: файл содержит `export`. Не переносите такое подключение из `.readme.html`. Простое включение карты не создаёт менеджеры и не сканирует DOM.

## Данные и события

[StateManager](js-state.md) — состояние в памяти и подписки. Не сохраняет данные и не связывает их с DOM автоматически.

[EventEmitter](js-event.md) — шина событий. `emit` ставит все вызовы в очередь на 200 мс; `emitImmediate` вызывает синхронно. `emitWithAsyncResponse` требует явного ответа каждого обработчика.

[resource](js-resource.md) — загрузка и мутация данных поверх StateManager: `idle/loading/ready/error`, дедупликация, отмена и защита от устаревших результатов. HTTP-клиент пишет приложение.

[NavigationManager](js-navigation.md) — состояния пространств имён в History API и адаптеры URL. Не загружает и не рендерит страницы.

## Интерфейс

[CollapseManager](js-collapse.md) — раскрытие блоков, группы, hover-триггеры, сохранение состояния.

[SliderManager](js-slider.md) — управление нативно прокручиваемыми лентами. **До него нужен `new EventEmitter()`**.

[PopupManager](js-popup.md) — окна, стек и hash-псевдонимы. Имя диалога и начальный фокус задаёт приложение.

[FieldManager](js-field.md) — числовые действия и копирование. Поиск и дата в этой версии — заглушки; CSS tooltip закомментирован.

[FormManager](js-form.md) — сбор полей, события, хранение и JSON POST. По умолчанию сохраняет данные в localStorage и cookie; для временных форм нужен `data-form-temp`. Для событий и veto-проверки сначала создайте EventEmitter.

[MotionManager](js-motion.md) — классовые анимации, Web Animations API, отмена и reduced motion. Не используется остальными менеджерами автоматически.

## Порядок создания

1. Подготовьте HTML и нужные CSS. Модульный скрипт без `async` выполняется после разбора документа.
2. Создайте EventEmitter до SliderManager/FormManager; StateManager — до resource либо передайте его через `options.state`.
3. Создайте только используемые менеджеры. Конструкторы Collapse/Slider/Popup/Form сами сканируют DOM; FieldManager делегирует клики документу.
4. После изменения DOM перечитайте раздел нужного менеджера. `refresh()` неодинаков: у FormManager повторная регистрация добавляет слушатели, поэтому слепой повторный запуск недопустим.

Большинство менеджеров — singleton на модуль. FieldManager создаёт независимые экземпляры, AsyncResource — ресурсы по имени через ResourceManager. Не запускайте один файл под разными URL с query-параметрами: так можно получить разные экземпляры модуля.

## Жизненный цикл и ответственность приложения

Не считайте все `destroy()` симметричными: FormManager и PopupManager оставляют singleton, некоторые менеджеры — глобальную ссылку. StateManager и EventEmitter вообще не имеют `destroy`. Отписки приложения храните отдельно.

Состояния `opened`, `core-hide`, `core-loading` не заменяют семантику HTML, авторизацию, CSRF-защиту и серверную валидацию. Код приложения в примерах отмечен отдельно от API Core.

## Границы версии

Основание документации — снимок CDN от 21.09.2026, сопоставленный с v185. Runtime-ссылки остаются на изменяемом `latest`. Контрольные суммы и различия каналов — в [манифесте](../reference/source-manifest.json). Минифицированные файлы сохранены, но их эквивалентность неминифицированным не заявляется.

**Источники:** [importmap.js](https://cdn.sdelal.tech/core/latest/importmap.js), [каталог](https://cdn.sdelal.tech/core/latest/).
