import axios from 'axios';

async function scrape1mg(medicineName, maxProduct = 3) {
  try {
    const url = `https://www.1mg.com/search/all?name=${encodeURIComponent(medicineName)}&filter=true&sort=relevance`;

    console.log(`Fetching data from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const fullHtml = response.data;

    // Extract target grid div
    let gridHtml = '';
    const gridStart = fullHtml.indexOf('<div class="row style__grid-container___3OfcL"');
    if (gridStart !== -1) {
      // Naive div balancer from start
      let depth = 0;
      let pos = gridStart;
      const tagRe = /<div\b[^>]*>|<\/div>/gi;
      tagRe.lastIndex = gridStart;
      const first = tagRe.exec(fullHtml);
      if (first) depth = 1;
      while (depth > 0) {
        const next = tagRe.exec(fullHtml);
        if (!next) break;
        if (next[0].startsWith('<div')) depth++;
        else depth--;
        pos = tagRe.lastIndex;
      }
      gridHtml = fullHtml.slice(gridStart, pos);
    } else {
      // Fallback: try to find alternative product containers
      const altStart = fullHtml.indexOf('<div class="style__container___3YFq7"');
      if (altStart !== -1) {
        let depth = 0;
        let pos = altStart;
        const tagRe = /<div\b[^>]*>|<\/div>/gi;
        tagRe.lastIndex = altStart;
        const first = tagRe.exec(fullHtml);
        if (first) depth = 1;
        while (depth > 0) {
          const next = tagRe.exec(fullHtml);
          if (!next) break;
          if (next[0].startsWith('<div')) depth++;
          else depth--;
          pos = tagRe.lastIndex;
        }
        gridHtml = fullHtml.slice(altStart, pos);
      } else {
        gridHtml = '<!-- GRID DIV NOT FOUND -->';
      }
    }

    // Extract script line containing window.PRELOADED_STATE
    let preloadedLine = '';
    const preloadedIndex = fullHtml.indexOf('window.PRELOADED_STATE');
    if (preloadedIndex !== -1) {
      // find start of enclosing <script>
      const scriptStart = fullHtml.lastIndexOf('<script', preloadedIndex);
      const scriptEnd = fullHtml.indexOf('</script>', preloadedIndex);
      if (scriptStart !== -1 && scriptEnd !== -1) {
        preloadedLine = fullHtml.slice(scriptStart, scriptEnd + '</script>'.length);
      } else {
        // fallback: grab the line
        const lineStart = fullHtml.lastIndexOf('\n', preloadedIndex) + 1;
        const lineEnd = fullHtml.indexOf('\n', preloadedIndex);
        preloadedLine = fullHtml.slice(lineStart, lineEnd === -1 ? preloadedIndex + 200 : lineEnd);
      }
    } else {
      preloadedLine = '<!-- PRELOADED_STATE SCRIPT NOT FOUND -->';
    }


    console.log(`Data extraction completed`);

    // ---- Parse product cards from gridHtml ----
    function cleanText(txt) {
      return txt.replace(/<[^>]+>/g, ' ') // strip tags
        .replace(/&nbsp;/g, ' ') // common entity
        .replace(/\s+/g, ' ') // collapse whitespace
        .trim();
    }

    const products = [];
    const anchorGlobalRe = /<a[^>]+href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
    const titleRe = /<span[^>]*class=\"[^\"]*pro-title[^\"]*\"[^>]*>([\s\S]*?)<\/span>/i;
    const packRe = /<div[^>]*class=\"[^\"]*pack-size[^\"]*\"[^>]*>([\s\S]*?)<\/div>/i;
    const deliveryRe = /<div[^>]*class=\"[^\"]*delivery-date[^\"]*\"[^>]*>([\s\S]*?)<\/div>/i;
    const priceRe = /₹[<!\-\->\s]*([0-9]+(?:\.[0-9]+)?)/gi;
    const mrpRe = /<span[^>]*class=\"[^\"]*mrp-tag[^\"]*\"[^>]*>MRP<\/span><span[^>]*class=\"[^\"]*cut-price[^\"]*\"[^>]*>₹([0-9.]+)<\/span>/i;
    const discountRe = /([0-9]+)%\s*OFF/i;
    const ratingRe = /<div[^>]*class=\"[^\"]*CardRatingDetail__ratings[^\"]*\"[^>]*>/i;

    let anchorMatch;
    while ((anchorMatch = anchorGlobalRe.exec(gridHtml)) !== null) {
      const href = anchorMatch[1];
      const inner = anchorMatch[2];
      if (!/pro-title/.test(inner)) continue; // skip non-product anchors

      const title = inner.match(titleRe)?.[1] || '';
      const pack = inner.match(packRe)?.[1] || '';
      const delivery = inner.match(deliveryRe)?.[1] || '';

      // Extract all prices (first is selling price, second might be MRP)
      const prices = [];
      let priceMatch;
      const priceReLocal = /₹[<!\-\->\s]*([0-9]+(?:\.[0-9]+)?)/gi;
      while ((priceMatch = priceReLocal.exec(inner)) !== null) {
        prices.push(parseFloat(priceMatch[1]));
      }

      const mrpMatch = inner.match(mrpRe);
      const discountMatch = inner.match(discountRe);
      const hasRating = ratingRe.test(inner);

      const product = {
        name: cleanText(title),
        packSize: cleanText(pack),
        price: prices[0] || null,
        mrp: mrpMatch ? parseFloat(mrpMatch[1]) : (prices[1] || null),
        discount: discountMatch ? parseInt(discountMatch[1]) : null,
        delivery: cleanText(delivery),
        hasRating: hasRating,
        url: href.startsWith('http') ? href : `https://www.1mg.com${href}`,
        image: null
      };
      if (product.name) products.push(product);
    }

    // Also check for discontinued/unavailable products outside anchors
    const containerRe = /<div class=\"col-xs-12 style__container[^\"]*\">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let containerMatch;
    while ((containerMatch = containerRe.exec(gridHtml)) !== null) {
      const container = containerMatch[1];
      if (/not-available|Discontinued/i.test(container)) {
        const titleMatch = container.match(titleRe);
        const packMatch = container.match(packRe);
        const hrefMatch = container.match(/href=\"([^\"]+)\"/);
        if (titleMatch) {
          const product = {
            name: cleanText(titleMatch[1]),
            packSize: packMatch ? cleanText(packMatch[1]) : '',
            price: null,
            mrp: null,
            discount: null,
            delivery: '',
            hasRating: false,
            availability: 'Discontinued',
            url: hrefMatch ? `https://www.1mg.com${hrefMatch[1]}` : '',
            image: null
          };
          // Check if already added
          if (!products.find(p => p.name === product.name)) {
            products.push(product);
          }
        }
      }
    }

    // ---- Parse PRELOADED_STATE script for images ----
    let preloadedRaw = '';
    const assignRe = /window\.PRELOADED_STATE\s*=\s*(.*?);?\s*<\/script>/s;
    const assignMatch = preloadedLine.match(assignRe);
    if (assignMatch) {
      preloadedRaw = assignMatch[1].trim();
    }

    let preloadedCombined = '';
    let parsedRoot = null;
    try {
      if (preloadedRaw.startsWith('[')) {
        const arr = JSON.parse(preloadedRaw);
        if (Array.isArray(arr)) {
          preloadedCombined = arr.join('');
          try { parsedRoot = JSON.parse(preloadedCombined); } catch { /* ignore */ }
        }
      } else if (preloadedRaw.startsWith('{')) {
        preloadedCombined = preloadedRaw;
        parsedRoot = JSON.parse(preloadedCombined);
      }
    } catch { /* ignore parse errors */ }

    const imageUrls = [];
    if (preloadedCombined) {
      const imgRe = /https?:\/\/[^"'\s>]+\.(?:png|jpe?g|webp)/gi;
      let imgMatch;
      while ((imgMatch = imgRe.exec(preloadedCombined)) !== null) {
        imageUrls.push(imgMatch[0]);
      }
    }

    // Attempt to map images to products by searching near product name
    // Also extract additional metadata from PRELOADED_STATE
    if (preloadedCombined && products.length) {
      for (const p of products) {
        if (!p.name) continue;
        const nameIndex = preloadedCombined.indexOf(p.name);
        if (nameIndex !== -1) {
          const windowSize = 2000; // larger search window
          const segment = preloadedCombined.slice(Math.max(0, nameIndex - 500), nameIndex + windowSize);

          // Extract image
          const imgMatch = segment.match(/https?:\/\/[^"'\s>]+\.(?:png|jpe?g|webp)/i);
          if (imgMatch) p.image = imgMatch[0];

          // Try to extract manufacturer
          const mfgMatch = segment.match(/"manufacturer[_\w]*"\s*:\s*"([^"]+)"/i);
          if (mfgMatch) p.manufacturer = mfgMatch[1];

          // Try to extract composition/salt
          const saltMatch = segment.match(/"salt[_\w]*"\s*:\s*"([^"]+)"/i);
          if (saltMatch) p.composition = saltMatch[1];

          // Try to extract SKU/product ID
          const skuMatch = segment.match(/"sku[_\w]*"\s*:\s*"?([0-9]+)"?/i);
          if (skuMatch) p.sku = skuMatch[1];

          // Try to extract prescription requirement
          const rxMatch = segment.match(/"rx_required[_\w]*"\s*:\s*(true|false)/i);
          if (rxMatch) p.prescriptionRequired = rxMatch[1] === 'true';
        }
      }
    }

    // Minimal payload with only top 3 products
    console.log(`Extracted ${products.length} products, returning top ${maxProduct}`);

    return {
      success: true,
      products: products.length,
      data: products.slice(0, maxProduct)
    };
  } catch (error) {
    console.error('Error scraping 1mg:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export { scrape1mg };
