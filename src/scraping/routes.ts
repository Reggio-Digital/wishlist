import { Router, Request, Response } from 'express';
import { authenticate } from '../auth/middleware.js';
import { scrapeUrl } from './service.js';

const router = Router();

/**
 * POST /api/scrape
 * Scrape product information from a URL
 * Requires authentication (admin only)
 * Body: { url: string }
 */
router.post('/api/scrape', authenticate, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validation
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Validate URL format
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(normalizedUrl);
    } catch (error) {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    // Scrape the URL
    const scrapedData = await scrapeUrl(url);

    res.json({
      success: true,
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error scraping URL:', error);
    res.status(500).json({
      error: 'Failed to scrape URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
