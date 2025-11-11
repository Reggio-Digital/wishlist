import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  url: string;
}

/**
 * Fetch and parse HTML from a URL
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract price from text (e.g., "$99.99", "99,99 €", "£50")
 */
function extractPrice(text: string): { price: number | null; currency: string | null } {
  // Remove whitespace and normalize
  const normalized = text.trim().replace(/\s+/g, '');

  // Match currency symbols and numbers
  // Patterns: $99.99, 99.99 USD, €99,99, £50.00, etc.
  const patterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // $99.99, $1,299.99
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*USD/i,  // 99.99 USD
    /€(\d+(?:\.\d{3})*(?:,\d{2})?)/,  // €99,99
    /£(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // £99.99
    /(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // Fallback: just numbers
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      // Extract number and remove commas, convert to float
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);

      if (!isNaN(price)) {
        // Determine currency
        let currency = 'USD';
        if (normalized.includes('$')) currency = 'USD';
        else if (normalized.includes('€')) currency = 'EUR';
        else if (normalized.includes('£')) currency = 'GBP';
        else if (normalized.match(/USD/i)) currency = 'USD';
        else if (normalized.match(/EUR/i)) currency = 'EUR';
        else if (normalized.match(/GBP/i)) currency = 'GBP';

        return { price, currency };
      }
    }
  }

  return { price: null, currency: null };
}

/**
 * Generic scraper using Open Graph and meta tags
 */
function scrapeGeneric(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html);

  // Try Open Graph tags first
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogPriceAmount = $('meta[property="og:price:amount"]').attr('content');
  const ogPriceCurrency = $('meta[property="og:price:currency"]').attr('content');

  // Fallback to other meta tags
  const metaDescription = $('meta[name="description"]').attr('content');
  const title = ogTitle || $('title').text().trim() || null;
  const description = ogDescription || metaDescription || null;
  const imageUrl = ogImage || $('link[rel="image_src"]').attr('href') || null;

  // Try to extract price from OG tags or page content
  let price: number | null = null;
  let currency: string | null = null;

  if (ogPriceAmount && ogPriceCurrency) {
    price = parseFloat(ogPriceAmount);
    currency = ogPriceCurrency;
  } else {
    // Try to find price in common selectors
    const priceSelectors = [
      '.price',
      '[data-price]',
      '.product-price',
      '[itemprop="price"]',
      '.a-price .a-offscreen', // Amazon
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text();
      if (priceText) {
        const extracted = extractPrice(priceText);
        if (extracted.price !== null) {
          price = extracted.price;
          currency = extracted.currency;
          break;
        }
      }
    }
  }

  return {
    title,
    description,
    price,
    currency,
    imageUrl,
    url,
  };
}

/**
 * Amazon-specific scraper
 */
function scrapeAmazon(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html);

  // Amazon-specific selectors
  const title = $('#productTitle').text().trim() ||
                $('span[id="productTitle"]').text().trim() ||
                null;

  const description = $('#feature-bullets ul li').first().text().trim() ||
                      $('meta[name="description"]').attr('content') ||
                      null;

  // Amazon price selectors (they change frequently)
  let price: number | null = null;
  let currency: string | null = null;

  const priceWhole = $('.a-price-whole').first().text().trim();
  const priceFraction = $('.a-price-fraction').first().text().trim();

  if (priceWhole) {
    const priceStr = priceWhole.replace(',', '') + (priceFraction || '00');
    price = parseFloat(priceStr);
    currency = 'USD'; // Default, could be enhanced to detect from page
  }

  // Fallback to other price selectors
  if (price === null) {
    const priceSelectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text();
      if (priceText) {
        const extracted = extractPrice(priceText);
        if (extracted.price !== null) {
          price = extracted.price;
          currency = extracted.currency;
          break;
        }
      }
    }
  }

  // Amazon images
  const imageUrl = $('#landingImage').attr('src') ||
                   $('#imgBlkFront').attr('src') ||
                   $('img[data-old-hires]').attr('data-old-hires') ||
                   $('meta[property="og:image"]').attr('content') ||
                   null;

  return {
    title,
    description,
    price,
    currency,
    imageUrl,
    url,
  };
}

/**
 * Target-specific scraper
 */
function scrapeTarget(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html);

  const title = $('h1[data-test="product-title"]').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                null;

  const description = $('div[data-test="item-details-description"]').text().trim() ||
                      $('meta[property="og:description"]').attr('content') ||
                      null;

  let price: number | null = null;
  let currency = 'USD';

  const priceText = $('span[data-test="product-price"]').first().text() ||
                    $('div[data-test="product-price"]').first().text();

  if (priceText) {
    const extracted = extractPrice(priceText);
    price = extracted.price;
    currency = extracted.currency || 'USD';
  }

  const imageUrl = $('img[data-test="product-image"]').attr('src') ||
                   $('meta[property="og:image"]').attr('content') ||
                   null;

  return {
    title,
    description,
    price,
    currency,
    imageUrl,
    url,
  };
}

/**
 * Walmart-specific scraper
 */
function scrapeWalmart(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html);

  const title = $('h1[itemprop="name"]').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                null;

  const description = $('div[itemprop="description"]').text().trim() ||
                      $('meta[property="og:description"]').attr('content') ||
                      null;

  let price: number | null = null;
  let currency = 'USD';

  const priceText = $('span[itemprop="price"]').first().attr('content') ||
                    $('span[itemprop="price"]').first().text() ||
                    $('.price-characteristic').first().text();

  if (priceText) {
    const extracted = extractPrice(priceText);
    price = extracted.price;
    currency = extracted.currency || 'USD';
  }

  const imageUrl = $('img[itemprop="image"]').attr('src') ||
                   $('meta[property="og:image"]').attr('content') ||
                   null;

  return {
    title,
    description,
    price,
    currency,
    imageUrl,
    url,
  };
}

/**
 * Best Buy-specific scraper
 */
function scrapeBestBuy(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html);

  const title = $('h1.heading-5').first().text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                null;

  const description = $('div.shop-product-description').first().text().trim() ||
                      $('meta[property="og:description"]').attr('content') ||
                      null;

  let price: number | null = null;
  let currency = 'USD';

  const priceText = $('div[data-testid="customer-price"] span').first().text() ||
                    $('.priceView-hero-price span').first().text();

  if (priceText) {
    const extracted = extractPrice(priceText);
    price = extracted.price;
    currency = extracted.currency || 'USD';
  }

  const imageUrl = $('img.primary-image').first().attr('src') ||
                   $('meta[property="og:image"]').attr('content') ||
                   null;

  return {
    title,
    description,
    price,
    currency,
    imageUrl,
    url,
  };
}

/**
 * Main scrape function - detects site and uses appropriate scraper
 */
export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname.toLowerCase();

    // Fetch HTML
    const html = await fetchHtml(normalizedUrl);

    // Use site-specific scraper if available
    if (hostname.includes('amazon.')) {
      return scrapeAmazon(html, normalizedUrl);
    } else if (hostname.includes('target.com')) {
      return scrapeTarget(html, normalizedUrl);
    } else if (hostname.includes('walmart.com')) {
      return scrapeWalmart(html, normalizedUrl);
    } else if (hostname.includes('bestbuy.com')) {
      return scrapeBestBuy(html, normalizedUrl);
    }

    // Fallback to generic scraper
    return scrapeGeneric(html, normalizedUrl);
  } catch (error) {
    throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
