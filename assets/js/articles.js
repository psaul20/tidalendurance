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
  const EXCERPT_LENGTH = 400; // Characters to show in excerpt

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
      console.error('XML Parse Error:', parseError);
      throw new Error('Failed to parse RSS feed');
    }

    // Extract article items
    const items = xmlDoc.querySelectorAll('item');
    console.log('Found', items.length, 'items in RSS feed');

    const articles = Array.from(items).slice(0, MAX_ARTICLES).map((item, index) => {
      const title = item.querySelector('title')?.textContent || 'Untitled';
      const link = item.querySelector('link')?.textContent || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // Try to get full content from content:encoded first, fall back to description
      const contentEncoded = item.querySelector('encoded')?.textContent ||
                            item.getElementsByTagName('content:encoded')[0]?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';

      // Use content:encoded if available, otherwise use description
      const fullContent = contentEncoded || description;

      console.log(`Article ${index}:`, { title, link, pubDate, contentLength: fullContent.length });

      // Extract creator/author if available
      const creator = item.querySelector('creator')?.textContent ||
                     item.querySelector('author')?.textContent || '';

      const article = {
        title: cleanText(title),
        link: link,
        pubDate: pubDate,
        description: fullContent,
        excerpt: createExcerpt(fullContent),
        creator: creator,
        date: formatDate(pubDate)
      };

      console.log(`Processed article ${index}:`, article);
      return article;
    });

    console.log('Total articles processed:', articles.length);
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
    if (!htmlDescription) return '';

    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlDescription;

    // Remove unwanted elements (subscription buttons, polls, etc.)
    const unwantedSelectors = [
      'a[href*="subscribe"]',
      '.subscription-widget-wrap',
      '.button-wrapper',
      '[class*="poll"]',
      '[class*="subscribe"]',
      'form'
    ];

    unwantedSelectors.forEach(selector => {
      temp.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Get all paragraph elements
    const paragraphs = temp.querySelectorAll('p');
    let excerpt = '';

    // Collect text from paragraphs until we have enough content
    for (const p of paragraphs) {
      const text = (p.textContent || '').trim();

      // Skip empty paragraphs or very short ones (likely UI elements)
      if (text.length < 20) continue;

      excerpt += text + ' ';

      // Stop if we have enough content
      if (excerpt.length >= EXCERPT_LENGTH) break;
    }

    // If we didn't get enough from paragraphs, fall back to all text
    if (excerpt.length < 100) {
      excerpt = (temp.textContent || '').trim();
    }

    // Truncate to desired length
    if (excerpt.length > EXCERPT_LENGTH) {
      // Find the last complete sentence within the limit
      const truncated = excerpt.substring(0, EXCERPT_LENGTH);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastQuestion = truncated.lastIndexOf('?');
      const lastExclaim = truncated.lastIndexOf('!');

      const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclaim);

      if (lastSentence > EXCERPT_LENGTH * 0.7) {
        // End at the last sentence if it's not too short
        return excerpt.substring(0, lastSentence + 1).trim();
      } else {
        // Otherwise just truncate and add ellipsis
        return truncated.trim() + '...';
      }
    }

    return excerpt.trim();
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
    console.log('renderArticles called with:', articles);

    if (!articles || articles.length === 0) {
      console.warn('No articles to render');
      return '<p>No articles found. Check back soon!</p>';
    }

    console.log(`Rendering ${articles.length} articles`);

    const articlesHtml = articles.map((article, index) => {
      const html = `
      <article class="substack-article">
        <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
        <p class="article-meta">${article.date}</p>
        <p class="article-excerpt">${article.excerpt}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="button small">Read More</a>
      </article>
    `;
      console.log(`Article ${index} HTML length:`, html.length);
      return html;
    }).join('');

    console.log('Total articlesHtml length:', articlesHtml.length);

    const finalHtml = `
      <div class="articles-list">
        ${articlesHtml}
      </div>
      <p class="articles-footer">
        <a href="https://tidalendurance.substack.com/" target="_blank" rel="noopener noreferrer" class="button primary">
          View on Substack
        </a>
      </p>
    `;

    console.log('Final HTML length:', finalHtml.length);
    return finalHtml;
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

    console.log('loadArticles called, contentDiv:', contentDiv);

    if (!contentDiv) {
      console.error('Articles content div not found');
      return;
    }

    try {
      // Show loading message
      contentDiv.innerHTML = '<p class="loading-message">Loading articles from Substack...</p>';
      console.log('Loading message set');

      // Fetch articles
      const articles = await fetchArticles();
      console.log('fetchArticles returned:', articles);

      // Render articles
      const html = renderArticles(articles);
      console.log('About to set innerHTML, HTML length:', html.length);
      contentDiv.innerHTML = html;
      console.log('innerHTML set! contentDiv.innerHTML length:', contentDiv.innerHTML.length);
      console.log('contentDiv children count:', contentDiv.children.length);

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
