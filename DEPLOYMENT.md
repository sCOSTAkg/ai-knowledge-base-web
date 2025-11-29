# 🌐 Веб-интерфейс AI Knowledge Base

## 📦 Компоненты

Полный стек веб-приложения для AI Knowledge Base:

1. **Frontend** (HTML + CSS + JavaScript)
   - index.html - структура страницы
   - styles.css - современный дизайн
   - script.js - интерактивность

2. **Backend API** (FastAPI + Python)
   - api.py - REST API endpoints
   - Интеграция с Supabase
   - Безопасный доступ к базе данных

3. **Database** (Supabase PostgreSQL)
   - Уже настроена и готова к использованию

## 🚀 Варианты деплоя

### Вариант 1: GitHub Pages + Backend на Vercel/Railway

**Самый простой способ для быстрого старта**

#### Шаг 1: Деплой Frontend на GitHub Pages

```bash
# 1. Создайте репозиторий на GitHub
# 2. Загрузите файлы: index.html, styles.css, script.js

git init
git add .
git commit -m "Initial commit: AI Knowledge Base"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-knowledge-base.git
git push -u origin main

# 3. Включите GitHub Pages в Settings → Pages
# Source: Deploy from a branch → main → root
```

**Ваш сайт будет доступен:**
`https://YOUR_USERNAME.github.io/ai-knowledge-base/`

#### Шаг 2: Деплой Backend на Railway

```bash
# 1. Создайте requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
EOF

# 2. Создайте railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn api:app --host 0.0.0.0 --port $PORT"
  }
}

# 3. Деплой
railway login
railway init
railway up
```

### Вариант 2: Vercel (Frontend + Backend)

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Создайте vercel.json
{
  "builds": [
    { "src": "api.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api.py" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}

# 3. Деплой
vercel --prod
```

### Вариант 3: Docker (Полный контроль)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Запуск
docker build -t ai-knowledge-base .
docker run -p 8000:8000 ai-knowledge-base
```

### Вариант 4: Локальный запуск (Для разработки)

```bash
# 1. Установите зависимости
pip install fastapi uvicorn

# 2. Запустите backend
python api.py
# API: http://localhost:8000

# 3. Откройте frontend
# Просто откройте index.html в браузере
# Или используйте простой сервер:
python -m http.server 3000
# Frontend: http://localhost:3000
```

## 🔧 Настройка

### 1. Переменные окружения

Создайте `.env` файл:

```env
SUPABASE_PROJECT_REF=wbmqfhkhzyjmahvnukmn
SUPABASE_URL=https://wbmqfhkhzyjmahvnukmn.supabase.co
SUPABASE_KEY=your-anon-key-here

# Опционально для OpenAI embeddings
OPENAI_API_KEY=sk-...
```

### 2. Интеграция с Composio

В `api.py` используйте helper functions:

```python
from composio import run_composio_tool

def search_in_db(query):
    result, error = run_composio_tool(
        "SUPABASE_BETA_RUN_SQL_QUERY",
        {
            "ref": PROJECT_REF,
            "query": f"SELECT * FROM search_documents_combined('{query}', NULL, NULL, NULL, NULL, NULL, 20, 0);"
        }
    )

    if error:
        raise Exception(error)

    return result.get("data", {}).get("details", [])
```

## 📱 Возможности интерфейса

### 1. Поиск
- ✅ Полнотекстовый поиск
- ✅ Семантический поиск по векторам
- ✅ Гибридный поиск
- ✅ Фильтрация по категориям
- ✅ Фильтрация по тегам
- ✅ Фильтрация по типу источника

### 2. Просмотр
- ✅ Список всех документов
- ✅ Карточки с релевантностью
- ✅ Теги и категории
- ✅ Дата добавления

### 3. Добавление
- ✅ Форма для нового документа
- ✅ Выбор категории и типа
- ✅ Указание тегов
- ✅ Автоматический эмбеддинг

### 4. Статистика
- ✅ Количество документов
- ✅ Количество категорий
- ✅ История поисков
- ✅ Популярные теги

## 🎨 Кастомизация дизайна

### Изменить цветовую схему

В `styles.css`:

```css
/* Замените градиент в body */
body {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}

/* Замените цвета кнопок */
button {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Добавить темную тему

```css
@media (prefers-color-scheme: dark) {
    body {
        background: #1a1a1a;
    }

    .container {
        background: #2d2d2d;
        color: #e0e0e0;
    }

    /* ... остальные стили */
}
```

## 🔗 API Endpoints

### POST /api/search
Поиск документов

**Request:**
```json
{
  "query": "машинное обучение",
  "search_type": "combined",
  "category": "AI & Machine Learning",
  "tags": ["python", "ai"],
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "query": "машинное обучение",
  "results": [
    {
      "id": "uuid",
      "title": "Основы ML",
      "summary": "...",
      "tags": ["ml", "ai"],
      "relevance_score": 0.95,
      "created_at": "2025-11-29T..."
    }
  ]
}
```

### POST /api/documents
Добавить документ

**Request:**
```json
{
  "title": "Новый документ",
  "content": "Текст...",
  "summary": "Краткое описание",
  "tags": ["tag1", "tag2"],
  "source_type": "note",
  "category": "Personal"
}
```

### GET /api/stats
Статистика

**Response:**
```json
{
  "total_documents": 6,
  "total_categories": 5,
  "total_searches": 0,
  "most_common_tags": ["ai", "python", ...]
}
```

### GET /api/categories
Список категорий

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "AI & Machine Learning",
      "color": "#FF6B6B"
    }
  ]
}
```

## 🔒 Безопасность

### Важные моменты:

1. **Никогда не выставляйте Supabase credentials в frontend**
   - Используйте backend API
   - Храните ключи в переменных окружения

2. **Rate Limiting**
   ```python
   from slowapi import Limiter

   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter

   @app.post("/api/search")
   @limiter.limit("10/minute")
   async def search_documents(...):
       ...
   ```

3. **CORS настройка**
   ```python
   # В продакшене укажите конкретные домены
   allow_origins=["https://yourdomain.com"]
   ```

4. **Валидация данных**
   - Используется Pydantic для автоматической валидации
   - SQL injection защита через параметризованные запросы

## 📊 Мониторинг

### Логирование

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.post("/api/search")
async def search_documents(request: SearchRequest):
    logger.info(f"Search request: {request.query}")
    # ...
```

### Метрики

```python
from prometheus_client import Counter, Histogram

search_counter = Counter('search_requests_total', 'Total search requests')
search_duration = Histogram('search_duration_seconds', 'Search duration')

@search_duration.time()
async def search_documents(request: SearchRequest):
    search_counter.inc()
    # ...
```

## 🎯 Next Steps

### Улучшения Frontend:
1. React/Vue.js для более сложного UI
2. Infinite scroll для результатов
3. Предпросмотр документа в модальном окне
4. Drag & drop для загрузки файлов
5. Markdown рендеринг для контента

### Улучшения Backend:
1. Аутентификация (JWT tokens)
2. Кэширование (Redis)
3. WebSocket для real-time обновлений
4. Background tasks (Celery) для обработки
5. OpenAI интеграция для качественных embeddings

### Дополнительные функции:
1. Экспорт результатов (PDF, CSV)
2. Расширенная фильтрация
3. Сохраненные поиски
4. Рекомендации похожих документов
5. Collaborative features (комментарии, шаринг)
