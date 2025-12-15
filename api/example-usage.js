/**
 * Example: How to use the Substack serverless function
 *
 * This file demonstrates how to call your /api/substack endpoint
 * from your frontend JavaScript code.
 *
 * DO NOT include this file in your production site - it's just documentation!
 */

// Example 1: Basic Fetch
async function fetchSubstackFeed() {
  const substackUrl = 'https://yourpublication.substack.com/feed';

  try {
    const response = await fetch(`/api/substack?url=${encodeURIComponent(substackUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log('RSS Feed XML:', xmlData);

    // Now you need to parse the XML to extract article data
    return xmlData;

  } catch (error) {
    console.error('Error fetching Substack feed:', error);
  }
}

// Example 2: Parse XML and Extract Articles
async function getSubstackArticles() {
  const substackUrl = 'https://yourpublication.substack.com/feed';
  const apiUrl = `/api/substack?url=${encodeURIComponent(substackUrl)}`;

  try {
    const response = await fetch(apiUrl);
    const xmlText = await response.text();

    // Parse XML using DOMParser (built into browsers)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Extract article data from RSS feed
    const items = xmlDoc.querySelectorAll('item');
    const articles = Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent || 'Untitled',
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      // Clean up the description HTML if needed
      excerpt: stripHtml(item.querySelector('description')?.textContent || '')
    }));

    return articles;

  } catch (error) {
    console.error('Error parsing Substack feed:', error);
    return [];
  }
}

// Helper function to strip HTML tags from description
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Example 3: Display in Your Modal
async function displayArticlesInModal() {
  const articles = await getSubstackArticles();

  // Get the articles modal (you'll need to create this in index.html)
  const articlesContent = document.querySelector('#articles .content');

  if (!articlesContent) {
    console.error('Articles modal not found');
    return;
  }

  // Generate HTML for articles
  const articlesHtml = articles.map(article => `
    <article class="substack-article">
      <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
      <p class="date">${new Date(article.pubDate).toLocaleDateString()}</p>
      <p>${article.excerpt.substring(0, 200)}...</p>
      <a href="${article.link}" target="_blank" class="button">Read More</a>
    </article>
  `).join('');

  articlesContent.innerHTML = articlesHtml;
}

// Example 4: Load on Page Load
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a page that needs articles
  if (document.querySelector('#articles')) {
    displayArticlesInModal();
  }
});

/*
 * INTEGRATION STEPS:
 *
 * 1. Add this code to your main.js or create a new articles.js file
 * 2. Update the substackUrl variable with your actual Substack URL
 * 3. Create an #articles modal in index.html (similar to #onboarding-form)
 * 4. Style the .substack-article elements in your CSS
 * 5. Deploy to Vercel (see deployment instructions below)
 */
