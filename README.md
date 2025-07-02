# 💱 Zoho CRM Currency Rate Widget

Даний віджет отримує курс долара США з сайту НБУ та дозволяє оновити курс в Угоді, якщо різниця з курсом перевищує 5%.

## 🔧 Функціонал

-   Отримання актуального курсу з API НБУ.
-   Порівняння курсу угоди з курсом НБУ.
-   Відображення різниці у відсотках.
-   Можливість автоматичного оновлення курсу в угоді.
-   Ведення історії змін курсу.
-   Підтримка мультимовності (українська / англійська).
-   Збереження обраної мови та останнього курсу НБУ у localStorage.
-   Логування подій: завантаження курсу, оновлення курсу в угоді...

## ⚙️ Встановлення

1. Завантажити zip файл з репозиторію GitHub:<br>
   URL: https://github.com/ViktorBykov/zoho-currency-rate-widget<br>

    Code -> Download ZIP

2. Створити поле у модулі Deals:
   Settings -> Modules and Fields -> Deals -> Fields -> Create and Edit Fields -> Deals

    • Тип поля: Decimal<br>
    • Назва: Курс валют

3. Встановити API Name для даного поля:
   Settings -> APIs and SDKs -> API names -> Deals

    • Field Label: Курс валют<br>
    • API name: Currency_Rate

4. Створити новий модуль:
   Settings -> Modules and Fields -> Create New Module -> Exchange Rate History

    • Module name: Exchange Rate History

5. Створити поля у модулі Exchange Rate History:
   Settings -> Modules and Fields -> Deals -> Fields -> Create and Edit Fields -> Exchange Rate History

    • тип поля: Loolup, назва поля: Deal, Lookup Module: Deals<br>
    • тип поля: Decimal, назва поля: Rate<br>
    • тип поля: DateTime, назва поля: Date<br>
    • тип поля: Picklist, назва поля: Rate Source, Pick List Option: НБУ, Інше<br>
    • тип поля: Decimal, назва поля: Difference %<br>

6. Встановити API Name поля Deal модуля Exchange Rate History:
   Settings -> APIs and SDKs -> API names -> Exchange Rate History

    • Field Label: Deal<br>
    • API name: Deal

7. Підключити віджет:
   Modules -> Deals -> Add Related List -> Widgets -> Create New Widget

    • Name: Currency Rate Widget<br>
    • Type: Related List<br>
    • Hosting: Zoho<br>
    • Index Page: /index.html<br>
    • File Upload: Вибрати завантажений zip архів

## 🌍 Мови

Всі переклади зберігаються у файлі `i18n/translations.json` та підвантажуються динамічно.

## 🚨 Обробка помилок

    • Неможливо отримати курс НБУ<br>
    • Неможливо оновити курс в CRM<br>
    • Відсутні дані угоди<br>

## 📅 Історія змін курсу в угоді

Після оновлення курсу створюється запис в модулі `Exchange_Rate_History`.

Таблиця історії відображається в нижній частині віджету з колонками: `Дата, Курс, Різниця (%)`
