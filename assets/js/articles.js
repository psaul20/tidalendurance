/**
 * Substack Articles Integration
 *
 * Fetches articles from Substack RSS feed via Vercel serverless function
 * and displays them in the #articles modal.
 */

(function() {
  // Configuration
  const SUBSTACK_FEED_URL = 'https://tidalendurance.substack.com/feed';
  const MAX_ARTICLES = 10; // Number of articles to display
  const EXCERPT_LENGTH = 250; // Characters to show in excerpt

  /**
   * Fetch articles from Substack via serverless function
   */
  async function fetchArticles() {
    try {
      // Call your Vercel serverless function
      const apiUrl = `/api/substack?url=${encodeURIComponent(SUBSTACK_FEED_URL)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      return parseRSSFeed(xmlText);

    } catch (error) {
      console.error('Error fetching Substack articles:', error);
      throw error;
    }
  }

  /**
   * Parse RSS XML and extract article data
   */
  function parseRSSFeed(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse RSS feed');
    }

    // Extract article items
    const items = xmlDoc.querySelectorAll('item');
    const articles = Array.from(items).slice(0, MAX_ARTICLES).map(item => {
      const title = item.querySelector('title')?.textContent || 'Untitled';
      const link = item.querySelector('link')?.textContent || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';

      // Extract creator/author if available
      const creator = item.querySelector('creator')?.textContent ||
                     item.querySelector('author')?.textContent || '';

      return {
        title: cleanText(title),
        link: link,
        pubDate: pubDate,
        description: description,
        excerpt: createExcerpt(description),
        creator: creator,
        date: formatDate(pubDate)
      };
    });

    return articles;
  }

  /**
   * Clean HTML entities and extra whitespace from text
   */
  function cleanText(text) {
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    return (tmp.textContent || tmp.innerText || '').trim();
  }

  /**
   * Create a clean text excerpt from HTML description
   */
  function createExcerpt(htmlDescription) {
    // Strip HTML tags
    const text = cleanText(htmlDescription);

    // Truncate to desired length
    if (text.length > EXCERPT_LENGTH) {
      return text.substring(0, EXCERPT_LENGTH).trim() + '...';
    }

    return text;
  }

  /**
   * Format date string to readable format
   */
  function formatDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Render articles HTML
   */
  function renderArticles(articles) {
    if (!articles || articles.length === 0) {
      return '<p>No articles found. Check back soon!</p>';
    }

    const articlesHtml = articles.map(article => `
      <article class="substack-article">
        <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
        <p class="article-meta">${article.date}</p>
        <p class="article-excerpt">${article.excerpt}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="button small">Read More</a>
      </article>
    `).join('');

    return `
      <div class="articles-list">
        ${articlesHtml}
      </div>
      <p class="articles-footer">
        <a href="https://tidalendurance.substack.com/" target="_blank" rel="noopener noreferrer" class="button primary">
          View All Articles on Substack
        </a>
      </p>
    `;
  }

  /**
   * Display error message
   */
  function renderError(error) {
    return `
      <div class="error-message">
        <p>Sorry, we couldn't load the articles at this time.</p>
        <p class="error-details">${error.message}</p>
        <p>
          <a href="https://tidalendurance.substack.com/" target="_blank" rel="noopener noreferrer" class="button primary">
            Visit Substack Directly
          </a>
        </p>
      </div>
    `;
  }

  /**
   * Load and display articles
   */
  async function loadArticles() {
    const contentDiv = document.getElementById('articles-content');

    if (!contentDiv) {
      console.error('Articles content div not found');
      return;
    }

    try {
      // Show loading message
      contentDiv.innerHTML = '<p class="loading-message">Loading articles from Substack...</p>';

      // Fetch articles
      const articles = await fetchArticles();

      // Render articles
      contentDiv.innerHTML = renderArticles(articles);

    } catch (error) {
      console.error('Failed to load articles:', error);
      contentDiv.innerHTML = renderError(error);
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    // Check if articles modal exists
    if (document.getElementById('articles')) {
      // Load articles when page loads
      loadArticles();

      // Optionally: Reload articles when modal is opened
      // This would require hooking into the template's modal system
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
