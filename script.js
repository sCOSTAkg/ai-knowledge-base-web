// AI Knowledge Base - JavaScript
// ВАЖНО: Этот файл демонстрирует frontend логику
// В продакшене нужен backend API для безопасного доступа к Supabase

// Конфигурация (DEMO MODE)
const CONFIG = {
    SUPABASE_PROJECT_REF: 'wbmqfhkhzyjmahvnukmn',
    // В продакшене используйте свой Supabase API endpoint
    // API_URL: 'https://your-api.com/api'
};

// Состояние приложения
const state = {
    documents: [],
    categories: [],
    currentSearch: '',
    currentFilters: {}
};

// ============== ИНИЦИАЛИЗАЦИЯ ==============

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    attachEventListeners();
});

async function initApp() {
    console.log('🚀 Инициализация AI Knowledge Base...');
    await loadStats();
    await loadRecentDocuments();
}

function attachEventListeners() {
    // Поиск
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Добавление документа
    document.getElementById('toggleAddBtn').addEventListener('click', toggleAddForm);
    document.getElementById('documentForm').addEventListener('submit', addDocument);

    // Статистика и документация
    document.getElementById('statsBtn').addEventListener('click', showStats);
    document.getElementById('viewDocsBtn').addEventListener('click', showDocs);
}

// ============== ПОИСК ==============

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const category = document.getElementById('categoryFilter').value;
    const tags = document.getElementById('tagsFilter').value;
    const type = document.getElementById('typeFilter').value;

    if (!query && !category && !tags && !type) {
        showMessage('Введите запрос или выберите фильтры', 'error');
        return;
    }

    console.log(`🔍 Поиск: "${query}" [${searchType}]`);

    // DEMO: Показываем пример результатов
    // В продакшене здесь будет API call к вашему backend
    const demoResults = getDemoResults(query, searchType);
    displayResults(demoResults, query);
}

function getDemoResults(query, searchType) {
    // DEMO данные
    const demoDocuments = [
        {
            title: 'Основы машинного обучения',
            summary: 'Введение в ML и основные концепции: supervised, unsupervised, reinforcement learning',
            tags: ['machine-learning', 'ai', 'python', 'neural-networks'],
            relevance_score: 0.95,
            created_at: '2025-11-29T17:45:37Z',
            category_names: ['AI & Machine Learning'],
            source_type: 'article'
        },
        {
            title: 'Как создать REST API на Python',
            summary: 'Руководство по созданию API с FastAPI - современный веб-фреймворк',
            tags: ['python', 'fastapi', 'api', 'backend'],
            relevance_score: 0.82,
            created_at: '2025-11-29T17:45:38Z',
            category_names: ['Programming'],
            source_type: 'tutorial'
        },
        {
            title: 'Deep Learning и нейронные сети',
            summary: 'Обзор архитектур: CNN для изображений, RNN/LSTM для последовательностей, Transformers для NLP',
            tags: ['deep-learning', 'ai', 'neural-networks', 'transformers'],
            relevance_score: 0.88,
            created_at: '2025-11-29T17:45:39Z',
            category_names: ['AI & Machine Learning'],
            source_type: 'article'
        },
        {
            title: 'Введение в Supabase и векторный поиск',
            summary: 'Обзор Supabase и возможностей векторного поиска через pgvector',
            tags: ['supabase', 'postgresql', 'vector-search', 'ai'],
            relevance_score: 0.75,
            created_at: '2025-11-29T17:41:41Z',
            category_names: ['Programming'],
            source_type: 'note'
        }
    ];

    // Фильтруем по запросу (простая симуляция)
    if (query) {
        const queryLower = query.toLowerCase();
        return demoDocuments.filter(doc => 
            doc.title.toLowerCase().includes(queryLower) ||
            doc.summary.toLowerCase().includes(queryLower) ||
            doc.tags.some(tag => tag.includes(queryLower))
        );
    }

    return demoDocuments;
}

function displayResults(results, query) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');

    resultsSection.style.display = 'block';
    resultsCount.textContent = `${results.length} документов`;

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="loading">Ничего не найдено 😔</div>';
        return;
    }

    resultsContainer.innerHTML = results.map(doc => `
        <div class="document-card">
            <div class="doc-title">${escapeHtml(doc.title)}</div>
            <div class="doc-summary">${escapeHtml(doc.summary)}</div>
            <div class="doc-meta">
                <span class="doc-score">📊 ${(doc.relevance_score * 100).toFixed(0)}%</span>
                <div class="doc-tags">
                    ${doc.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                <span class="doc-date">${formatDate(doc.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// ============== СТАТИСТИКА ==============

async function loadStats() {
    // DEMO: В продакшене - API call
    document.getElementById('totalDocs').textContent = '6';
    document.getElementById('totalCategories').textContent = '5';
    document.getElementById('totalSearches').textContent = '0';
}

async function loadRecentDocuments() {
    console.log('📚 Загрузка последних документов...');
    // DEMO: В продакшене - API call к Supabase
}

function showStats() {
    alert('📊 Статистика:\n\n' +
          '📚 Документов: 6\n' +
          '🗂️ Категорий: 5\n' +
          '🏷️ Тегов: 19\n' +
          '🔍 Поисков: 0\n\n' +
          '📈 Популярные теги:\n' +
          'ai, python, postgresql, machine-learning, api');
}

// ============== ДОБАВЛЕНИЕ ДОКУМЕНТА ==============

function toggleAddForm() {
    const form = document.getElementById('addForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addDocument(e) {
    e.preventDefault();

    const title = document.getElementById('docTitle').value;
    const content = document.getElementById('docContent').value;
    const summary = document.getElementById('docSummary').value;
    const tags = document.getElementById('docTags').value.split(',').map(t => t.trim()).filter(t => t);
    const category = document.getElementById('docCategory').value;
    const type = document.getElementById('docType').value;

    console.log('💾 Сохранение документа:', title);

    // DEMO: В продакшене - API call
    showMessage('✅ Документ успешно добавлен! (DEMO режим)', 'success');

    // Очищаем форму
    document.getElementById('documentForm').reset();
    toggleAddForm();

    // Обновляем статистику
    const currentTotal = parseInt(document.getElementById('totalDocs').textContent);
    document.getElementById('totalDocs').textContent = currentTotal + 1;
}

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;

    return date.toLocaleDateString('ru-RU');
}

function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = text;

    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => messageDiv.remove(), 5000);
}

function showDocs() {
    window.open('https://github.com/sCOSTAkg', '_blank');
}

// ============== PRODUCTION API (Пример интеграции) ==============

/*
// В продакшене используйте backend API для безопасного доступа к Supabase

async function searchDocuments(query, filters) {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
    });
    return await response.json();
}

async function addDocumentToDb(document) {
    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document)
    });
    return await response.json();
}

// Supabase клиент (для direct access - только в безопасной среде)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wbmqfhkhzyjmahvnukmn.supabase.co',
    'YOUR_ANON_KEY'
);

async function searchSupabase(query) {
    const { data, error } = await supabase
        .rpc('search_documents_combined', {
            search_query: query,
            limit_count: 20
        });

    return data;
}
*/

console.log('✅ AI Knowledge Base загружен!');
