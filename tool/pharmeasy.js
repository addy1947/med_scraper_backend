import axios from 'axios';

const BASE_URL = 'https://pharmeasy.in';

function extractMain(html) {
  if (!html) return '';

  const mainStart = html.search(/<main[\s\S]*?>/i);
  const mainEnd = html.search(/<\/main>/i);

  if (mainStart === -1 || mainEnd === -1) {
    return '<!-- MAIN TAG NOT FOUND -->';
  }

  return html.slice(mainStart, mainEnd + '</main>'.length);
}

function cleanText(htmlSnippet = '') {
  return htmlSnippet
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractValue(block, regex) {
  const match = block.match(regex);
  return match ? cleanText(match[1]) : '';
}

function extractPrice(block, regex) {
  const value = extractValue(block, regex).replace(/[^\d.]/g, '');
  return value ? Number(value) : null;
}

function parseProductCards(mainHtml) {
  const products = [];
  if (!mainHtml) return products;

  const productRe = /<a[^>]+class="[^"]*ProductCard_medicineUnitWrapper[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = productRe.exec(mainHtml)) !== null) {
    const fullAnchor = match[0];
    const content = match[1];

    const name = extractValue(content, /<h1[^>]*class="[^"]*ProductCard_medicineName[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
    if (!name) continue;

    const measurement = extractValue(content, /<div[^>]*class="[^"]*ProductCard_measurementUnit[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const price = extractPrice(content, /<div[^>]*class="[^"]*ProductCard_ourPrice[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const mrp = extractPrice(content, /<span[^>]*class="[^"]*ProductCard_striked[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const discount = extractValue(content, /<span[^>]*class="[^"]*ProductCard_gcdDiscountPercent[^"]*"[^>]*>([\s\S]*?)<\/span>/i);

    const imageMatch = fullAnchor.match(/<img[^>]+src="([^"]+)"/i);
    const hrefMatch = fullAnchor.match(/href="([^"]+)"/i);
    const url = hrefMatch ? (hrefMatch[1].startsWith('http') ? hrefMatch[1] : `${BASE_URL}${hrefMatch[1]}`) : null;
    const image = imageMatch ? imageMatch[1] : null;

    products.push({
      name,
      measurement,
      price,
      mrp,
      discount,
      url,
      image
    });
  }

  return products;
}

/**
 * Downloads the PharmEasy search results page for the provided query,
 * extracts product data, and returns the structured data.
 */
export async function savePharmEasyHtml(query = 'paracetamol', options = {}) {
  const {
    maxProduct
  } = options;

  const url = `${BASE_URL}/search/all?name=${encodeURIComponent(query)}`;

  try {
    console.log(`Fetching PharmEasy search page: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: BASE_URL,
        'Cache-Control': 'no-cache'
      }
    });

    const mainOnly = extractMain(response.data);

    const products = parseProductCards(mainOnly);
    const limitedProducts = typeof maxProduct === 'number' ? products.slice(0, maxProduct) : products;

    console.log(`Extracted ${products.length} PharmEasy products`);

    return {
      success: true,
      url,
      bytes: Buffer.byteLength(mainOnly),
      products: limitedProducts.length,
      data: limitedProducts
    };
  } catch (error) {
    console.error('Failed to fetch PharmEasy search page:', error.message);
    return {
      success: false,
      url,
      error: error.message,
      products: 0,
      data: []
    };
  }
}

