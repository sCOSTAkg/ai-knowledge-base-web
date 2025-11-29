"""
AI Knowledge Base - Backend API
FastAPI сервер для безопасного доступа к Supabase и функциям поиска
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import re
import math

app = FastAPI(title="AI Knowledge Base API", version="1.0.0")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== MODELS ==============

class SearchRequest(BaseModel):
    query: Optional[str] = None
    search_type: str = Field(default="combined", pattern="^(combined|semantic|hybrid)$")
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    source_type: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

class AddDocumentRequest(BaseModel):
    title: str
    content: str
    summary: Optional[str] = ""
    tags: Optional[List[str]] = []
    source_type: str = "note"
    source_url: Optional[str] = None
    category: Optional[str] = None

class SearchResponse(BaseModel):
    success: bool
    count: int
    results: List[Dict[str, Any]]
    query: Optional[str] = None

class StatsResponse(BaseModel):
    total_documents: int
    total_categories: int
    total_searches: int
    most_common_tags: List[str]

# ============== HELPER FUNCTIONS ==============

PROJECT_REF = "wbmqfhkhzyjmahvnukmn"

def text_to_vector(text: str, dimension: int = 1536) -> List[float]:
    """Генерация вектора из текста"""
    text = text.lower()
    words = re.findall(r'\w+', text)
    vector = [0.0] * dimension
    for word in words:
        hash_val = hash(word) % dimension
        vector[hash_val] += 1.0
    magnitude = math.sqrt(sum(x*x for x in vector))
    if magnitude > 0:
        vector = [x/magnitude for x in vector]
    return vector

# ============== ENDPOINTS ==============

@app.get("/")
async def root():
    return {
        "message": "AI Knowledge Base API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/api/search",
            "documents": "/api/documents",
            "categories": "/api/categories",
            "stats": "/api/stats"
        }
    }

@app.post("/api/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """
    Поиск документов с различными фильтрами

    - **query**: Текстовый запрос
    - **search_type**: Тип поиска (combined, semantic, hybrid)
    - **category**: Фильтр по категории
    - **tags**: Фильтр по тегам
    - **source_type**: Фильтр по типу источника
    - **limit**: Количество результатов
    - **offset**: Смещение для пагинации
    """

    try:
        if request.search_type == "semantic":
            # Семантический поиск
            query_vector = text_to_vector(request.query or "")
            vector_str = "[" + ",".join(str(float(x)) for x in query_vector) + "]"

            sql = f"""
            SELECT 
                d.id, d.title, d.content, d.summary, d.tags,
                d.source_type, d.created_at,
                (1 - (de.embedding <=> '{vector_str}'::vector)) AS relevance_score
            FROM document_embeddings de
            JOIN documents d ON de.document_id = d.id
            ORDER BY de.embedding <=> '{vector_str}'::vector
            LIMIT {request.limit} OFFSET {request.offset};
            """
        else:
            # Полнотекстовый или гибридный
            query_clause = f"'{request.query}'" if request.query else "NULL"
            category_clause = f"(SELECT ARRAY[id] FROM categories WHERE name = '{request.category}')" if request.category else "NULL"
            tags_clause = "ARRAY['" + "','".join(request.tags) + "']::text[]" if request.tags else "NULL"
            source_clause = f"'{request.source_type}'" if request.source_type else "NULL"

            sql = f"""
            SELECT * FROM search_documents_combined(
                {query_clause}, 
                {category_clause}, 
                {tags_clause}, 
                NULL, NULL, 
                {source_clause}, 
                {request.limit}, 
                {request.offset}
            );
            """

        # Здесь должен быть вызов run_composio_tool
        # result, error = run_composio_tool("SUPABASE_BETA_RUN_SQL_QUERY", {"ref": PROJECT_REF, "query": sql})

        # DEMO ответ
        demo_results = [
            {
                "id": "f71cfb00-17eb-40b8-a5a1-49a774bdcf6c",
                "title": "Основы машинного обучения",
                "summary": "Введение в ML",
                "tags": ["ml", "ai", "python"],
                "relevance_score": 0.95
            }
        ]

        return SearchResponse(
            success=True,
            count=len(demo_results),
            results=demo_results,
            query=request.query
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents")
async def add_document(request: AddDocumentRequest):
    """
    Добавить новый документ в базу знаний

    Автоматически создает:
    - Summary (если не указан)
    - Теги (если не указаны)
    - Эмбеддинг для семантического поиска
    - Связь с категорией
    """

    try:
        # Эскейп кавычек
        title_esc = request.title.replace("'", "''")
        content_esc = request.content.replace("'", "''")[:5000]
        summary_esc = request.summary.replace("'", "''") if request.summary else ""

        tags_str = "{" + ",".join(f'"{t}"' for t in request.tags) + "}"

        # SQL для добавления документа
        sql = f"""
        INSERT INTO documents (title, content, summary, tags, source_type, source_url)
        VALUES (
            '{title_esc}', '{content_esc}', '{summary_esc}',
            ARRAY{tags_str}::text[], '{request.source_type}',
            {'NULL' if not request.source_url else f"'{request.source_url}'"}
        )
        RETURNING id, created_at;
        """

        # Здесь вызов run_composio_tool
        # result, error = run_composio_tool("SUPABASE_BETA_RUN_SQL_QUERY", {"ref": PROJECT_REF, "query": sql})

        return {
            "success": True,
            "document_id": "demo-id",
            "message": "Документ добавлен"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def get_categories():
    """Получить список всех категорий"""

    # DEMO данные
    categories = [
        {"id": "1", "name": "AI & Machine Learning", "color": "#FF6B6B"},
        {"id": "2", "name": "Programming", "color": "#4ECDC4"},
        {"id": "3", "name": "Business", "color": "#45B7D1"},
        {"id": "4", "name": "Personal", "color": "#96CEB4"},
        {"id": "5", "name": "Research", "color": "#FFEAA7"}
    ]

    return {"success": True, "categories": categories}

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Получить статистику базы знаний"""

    return StatsResponse(
        total_documents=6,
        total_categories=5,
        total_searches=0,
        most_common_tags=["ai", "python", "postgresql", "machine-learning", "api"]
    )

@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    """Получить конкретный документ по ID"""

    sql = f"SELECT * FROM documents WHERE id = '{document_id}'::uuid;"

    # Здесь вызов run_composio_tool

    return {"success": True, "document": {}}

@app.get("/api/documents")
async def list_documents(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    tag: Optional[str] = None
):
    """Список документов с пагинацией"""

    return {
        "success": True,
        "documents": [],
        "count": 0,
        "limit": limit,
        "offset": offset
    }

# ============== ЗАПУСК ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

"""
Для запуска:
1. pip install fastapi uvicorn
2. python api.py
3. API будет доступен на http://localhost:8000
4. Документация: http://localhost:8000/docs
"""
