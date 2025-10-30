# AI Studio: Генератор сценаріїв короткометражок 🎬
# AI Studio: Генератор сценаріїв короткометражок 🎬

Інтерактивний інструмент для створення сценаріїв короткометражних відео за допомогою штучного інтелекту. Проект використовує Google Gemini Pro для генерації креативного контенту та надає зручний інтерфейс для аналізу та редагування сценаріїв.

![Demo Screenshot](screenshots/demo.png)

> 🚀 Створюйте професійні сценарії для коротких відео за лічені секунди!

## 🌟 Особливості

- 🤖 Генерація сценаріїв за допомогою Google Gemini Pro
- 📊 Аналіз структури та часової шкали сценарію
- 🔄 Оцінка можливості зациклювання контенту
- 📱 Адаптивний дизайн
- 🌍 Підтримка різних мов інтерфейсу
- ⚡ Швидке розгортання на Vercel

## 🛠️ Технології

- **Frontend**: React + TypeScript
- **AI**: Google Gemini Pro API
- **Стилізація**: CSS Modules
- **Графіки**: Recharts
- **Розгортання**: Vercel
- **API**: Serverless Functions на Vercel
- **Локалізація**: i18next
- **Аналітика**: Вбудовані інструменти аналізу

## 🏗️ Архітектура

### Основні компоненти

- `InputForm` - Форма введення параметрів генерації сценарію
- `ScriptViewer` - Інтерактивний перегляд згенерованого сценарію
- `Timeline` - Візуалізація часової шкали подій сценарію
- `LoopAnalysis` - Інструменти аналізу можливості зациклювання
- `TrendSpotter` - Виявлення трендів у сценарії
- `MetricsCard` - Відображення ключових метрик
- `LanguageSwitcher` - Перемикач мови інтерфейсу

### API Endpoints

#### POST /api/generate
Генерує новий сценарій на основі введеного промпту.

**Request:**
```json
{
  "prompt": "string",
  "language": "string"
}
```

**Response:**
```json
{
  "success": true,
  "script": "string (JSON)",
  "error": "string (optional)"
}
```

### Структура даних сценарію

```typescript
interface ScriptVariant {
  variant_id: string;
  duration_s: number;
  timeline: TimelineEvent[];
  loopability_analysis: LoopabilityAnalysis;
}

interface TimelineEvent {
  sec_start: number;
  sec_end: number;
  visual: string;
  audio: string;
  caption: string;
  triggers: string[];
  suggested_triggers: string[];
  isWeak: boolean;
}

interface LoopabilityAnalysis {
  score: number;
  analysis: string;
  transition_point_analysis: TransitionAnalysis;
}
```

## 🚀 Початок роботи

### Передумови

- Node.js (версія 16 або вище)
- API ключ Google Gemini Pro
- Git

### Встановлення

1. Клонуйте репозиторій:
```bash
git clone https://github.com/your-username/ai-studio-shorts-script-generator.git
cd ai-studio-shorts-script-generator
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть файл `.env.local` і додайте свій API ключ:
```env
GEMINI_API_KEY=your-api-key-here
```

### Розробка

Запустіть проект в режимі розробки:
```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

### Збірка

Для створення продакшн версії:
```bash
npm run build
```

## 🚀 Розгортання

Проект налаштований для легкого розгортання на Vercel:

1. Підключіть свій GitHub репозиторій до Vercel
2. Додайте змінну середовища `GEMINI_API_KEY`
3. Розгорніть!

## 📝 Використання

### Генерація сценарію

1. **Опис відео**
   - Введіть детальний опис бажаного відео
   - Додайте ключові слова та хештеги
   - Вкажіть цільову аудиторію

2. **Налаштування**
   - Виберіть мову генерації
   - Встановіть бажану тривалість (в секундах)
   - Налаштуйте параметри стилю

3. **Генерація та аналіз**
   - Натисніть "Генерувати"
   - Перегляньте Timeline візуалізацію
   - Проаналізуйте метрики та показники

### Аналіз сценарію

#### Метрики якості
- **Loop Score**: Оцінка можливості зациклювання (0-100)
- **Engagement**: Прогноз залучення аудиторії
- **Coherence**: Оцінка зв'язності сценарію

#### Інструменти аналізу
- **Timeline**: Візуальний аналіз структури
- **TrendSpotter**: Виявлення популярних елементів
- **Impact Analysis**: Аналіз впливу тригерів

### Приклади промптів

```text
# Рецепт
"Швидкий рецепт домашнього морозива з 3 інгредієнтів. Акцент на текстурі та кольорі"

# Челендж
"Креативний челендж з олівцем, що демонструє незвичайні способи використання"

# Навчальний
"5 простих прийомів для покращення пам'яті, з візуальними метафорами"
```

## 🤝 Внесок

Будемо раді вашим пропозиціям та покращенням! Будь ласка:

1. Форкніть проект
2. Створіть свою гілку (`git checkout -b feature/AmazingFeature`)
3. Зробіть коміт змін (`git commit -m 'Add some AmazingFeature'`)
4. Запушіть у гілку (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## � Корисні ресурси

### Документація
- [Google Gemini Pro API](https://ai.google.dev/docs/gemini_pro)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Інструменти
- [Google AI Studio](https://ai.google.dev/) - Тестування промптів
- [Vercel Dashboard](https://vercel.com/dashboard) - Моніторинг розгортання
- [ChatGPT](https://chat.openai.com/) - Допомога з промптами

### Спільнота
- [Discord Server](https://discord.gg/your-server) - Обговорення та підтримка
- [YouTube Channel](https://youtube.com/@your-channel) - Туторіали
- [Blog](https://your-blog.com) - Статті та новини

## �📄 Ліцензія

Цей проект розповсюджується під ліцензією MIT. Дивіться файл `LICENSE` для деталей.

## 🌟 Подяки

Особлива подяка:
- Google за надання API Gemini Pro
- Спільноті React за інструменти та підтримку
- Всім контриб'юторам проекту

## 📞 Контакти

Якщо у вас виникли питання або пропозиції:
- Відкрийте Issue в цьому репозиторії
- Надішліть Pull Request
- Зв'яжіться з нами через [Discussions](https://github.com/your-username/ai-studio-shorts-script-generator/discussions)

