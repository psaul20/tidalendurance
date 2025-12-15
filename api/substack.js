/**
 * Vercel Serverless Function: Fetch Substack RSS Feed
 *
 * This function acts as a proxy to fetch your Substack RSS feed
 * and add proper CORS headers, solving the browser CORS restriction.
 *
 * Endpoint: /api/substack
 * Method: GET
 * Query params: ?url=<your-substack-url>
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the Substack URL from query parameters
  // Example: /api/substack?url=https://yourpublication.substack.com/feed
  const { url } = req.query;

  // Validate that a URL was provided
  if (!url) {
    return res.status(400).json({
      error: 'Missing URL parameter',
      usage: '/api/substack?url=https://tidalendurance.substack.com/feed'
    });
  }

  // Optional: Validate that it's actually a Substack URL for security
  if (!url.includes('substack.com')) {
    return res.status(400).json({
      error: 'Invalid URL - must be a Substack URL'
    });
  }

  // Retry logic to handle intermittent connection issues
  let response;
  let lastError;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch the RSS feed from Substack
      // This runs on the server, so no CORS restrictions
      // Add comprehensive headers to avoid connection issues and appear as legitimate client
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/xml, application/rss+xml, text/xml, application/atom+xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'close',
          'DNT': '1'
        }
      });

      // Check if the fetch was successful
      if (!response.ok) {
        throw new Error(`Substack returned status ${response.status}`);
      }

      // Success! Break out of retry loop
      break;

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff: 500ms, 1000ms, 2000ms)
      const delay = 500 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  try {

    // Get the XML content
    const xmlData = await response.text();

    // Set CORS headers based on environment
    // Vercel provides VERCEL_ENV: 'production', 'preview', or 'development'
    const allowedOrigins = [
      'https://tidalendurance.com',
      'https://www.tidalendurance.com',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    const origin = req.headers.origin;

    // In development/preview, be more permissive
    if (process.env.VERCEL_ENV !== 'production') {
      // Allow any localhost or preview URL
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    } else {
      // In production, only allow specific domains
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://tidalendurance.com');
      }
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/xml');

    // Cache the response for 5 minutes to reduce Substack requests
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    // Return the RSS feed XML
    return res.status(200).send(xmlData);

  } catch (error) {
    // Handle any errors that occurred during fetching
    console.error('Error fetching Substack feed:', error);

    return res.status(500).json({
      error: 'Failed to fetch Substack feed',
      message: error.message
    });
  }
}
