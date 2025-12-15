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
      usage: '/api/substack?url=https://yourpublication.substack.com/feed'
    });
  }

  // Optional: Validate that it's actually a Substack URL for security
  if (!url.includes('substack.com')) {
    return res.status(400).json({
      error: 'Invalid URL - must be a Substack URL'
    });
  }

  try {
    // Fetch the RSS feed from Substack
    // This runs on the server, so no CORS restrictions
    const response = await fetch(url);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Substack returned status ${response.status}`);
    }

    // Get the XML content
    const xmlData = await response.text();

    // Set CORS headers to allow your frontend to access this data
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    // For production, you might want to restrict this to your domain:
    // res.setHeader('Access-Control-Allow-Origin', 'https://tidalendurance.com');

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
