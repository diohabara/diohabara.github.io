// Search functionality
(function() {
    'use strict';

    let searchIndex = null;
    let searchData = [];

    // Initialize search when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        loadSearchIndex();
        setupSearchHandlers();
    });

    // Load search index
    function loadSearchIndex() {
        fetch('/index.json')
            .then(response => response.json())
            .then(data => {
                searchData = data;
                searchIndex = lunr(function() {
                    this.ref('id');
                    this.field('title', { boost: 10 });
                    this.field('content');
                    this.field('tags', { boost: 5 });
                    this.field('language');

                    // Add Japanese tokenizer if available
                    if (lunr.jp) {
                        this.use(lunr.jp);
                    }

                    data.forEach((doc, idx) => {
                        doc.id = idx;
                        this.add(doc);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading search index:', error);
            });
    }

    // Setup search event handlers
    function setupSearchHandlers() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) return;

        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });

        // Handle URL parameters for search
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            performSearch(query);
        }
    }

    // Perform search
    function performSearch(query) {
        const searchResults = document.getElementById('search-results');
        
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        if (!searchIndex) {
            searchResults.innerHTML = '<div class="no-results">検索インデックスを読み込み中...</div>';
            return;
        }

        try {
            const results = searchIndex.search(query);
            displayResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="no-results">検索エラーが発生しました</div>';
        }
    }

    // Display search results
    function displayResults(results, query) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">検索結果が見つかりませんでした</div>';
            return;
        }

        const html = results.map(result => {
            const item = searchData[result.ref];
            const highlightedTitle = highlightText(item.title, query);
            const highlightedContent = highlightText(truncateText(item.content, 200), query);
            
            return `
                <div class="search-result">
                    <h3><a href="${item.url}">${highlightedTitle}</a></h3>
                    <div class="date">${formatDate(item.date)}</div>
                    <p>${highlightedContent}</p>
                    ${item.tags ? `<div class="tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
            `;
        }).join('');

        searchResults.innerHTML = html;
    }

    // Highlight search terms
    function highlightText(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<em>$1</em>');
    }

    // Truncate text
    function truncateText(text, length) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Escape regex special characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
})();