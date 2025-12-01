import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_HTML_OUTPUT = path.resolve(__dirname, '../netmed_search.json');
const BASE_URL = 'https://www.netmeds.com';

function extractScriptContent(html) {
    if (!html) return '';

    // Find the script tag containing window.__INITIAL_STATE__
    const initialStateIndex = html.indexOf('window.__INITIAL_STATE__');
    if (initialStateIndex === -1) {
        return '<!-- SCRIPT WITH __INITIAL_STATE__ NOT FOUND -->';
    }

    // Find the start of the script tag (search backwards from the initialStateIndex)
    let scriptTagStart = html.lastIndexOf('<script', initialStateIndex);
    if (scriptTagStart === -1) {
        return '<!-- SCRIPT TAG NOT FOUND -->';
    }

    // Find the opening script tag end (>)
    const scriptTagOpenEnd = html.indexOf('>', scriptTagStart);
    if (scriptTagOpenEnd === -1 || scriptTagOpenEnd > initialStateIndex) {
        return '<!-- SCRIPT TAG OPENING NOT FOUND -->';
    }

    // Find the closing </script> tag (search forward from initialStateIndex)
    const scriptTagClose = html.indexOf('</script>', initialStateIndex);
    if (scriptTagClose === -1) {
        return '<!-- SCRIPT TAG CLOSING NOT FOUND -->';
    }

    // Extract only the content inside the script tag (between > and </script>)
    const scriptContent = html.slice(scriptTagOpenEnd + 1, scriptTagClose);

    return scriptContent.trim();
}

/**
 * Fetches the NetMeds products search page and saves only the script content containing window.__INITIAL_STATE__ to a file.
 */
export async function saveNetMedHtml(query = 'paracetamol', options = {}) {
    const {
        htmlOutputPath = DEFAULT_HTML_OUTPUT
    } = options;

    const url = `${BASE_URL}/products`;
    const params = {
        q: query,
        sort_on: 'relevance'
    };

    try {
        console.log(`Fetching NetMeds search page: ${url}?q=${encodeURIComponent(query)}`);

        const response = await axios.get(url, {
            params,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Cache-Control': 'max-age=0',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Sec-GPC': '1',
                'Upgrade-Insecure-Requests': '1',
                'Referer': BASE_URL
            }
        });

        const scriptContent = extractScriptContent(response.data);
        // await fs.writeFile(path.resolve(__dirname, '../netmed_raw.txt'), scriptContent, 'utf8');

        // Parse the JSON data
        let products = [];
        if (scriptContent.includes('window.__INITIAL_STATE__')) {
            try {
                // Mock browser environment for the script
                const window = {};
                const document = {
                    currentScript: {
                        parentNode: {
                            removeChild: () => { }
                        }
                    },
                    getElementById: () => null,
                    getElementsByTagName: () => []
                };

                // Execute the script in a safe scope
                // We wrap it in a function to avoid polluting the global scope
                const runScript = new Function('window', 'document', scriptContent);
                runScript(window, document);

                const json = window.__INITIAL_STATE__;
                const items = json?.productListingPage?.productlists?.items || [];

                products = items.map(item => {
                    const price = parseFloat(item.attributes?.["mstar-discount"]) || 0;
                    const discount = parseFloat(item.attributes?.["mstar-discountpct"]) || 0;
                    const mrp = discount > 0 ? (price / (1 - (discount / 100))).toFixed(2) : price;

                    return {
                        price: price,
                        discount: discount,
                        mrp: mrp,
                        package: item.attributes?.["mstar-packlabel"],
                        name: item.name || item.attributes?.name,
                        image: item.medias?.[0]?.url,
                        url: item.url ? `${BASE_URL}${item.url}` : null
                    };
                });
            } catch (e) {
                console.error('Error parsing NetMeds JSON with eval:', e.message);
                // Fallback or detailed error logging
            }
        }

        // await fs.writeFile(htmlOutputPath, JSON.stringify(products, null, 2), 'utf8');
        // console.log(`Saved ${products.length} NetMeds products to ${htmlOutputPath}`);

        return {
            success: true,
            url: `${url}?${new URLSearchParams(params).toString()}`,
            products: products.length,
            data: products
        };
    } catch (error) {
        console.error('Failed to fetch NetMeds search page:', error.message);
        return {
            success: false,
            url: `${url}?${new URLSearchParams(params).toString()}`,
            error: error.message,
            data: []
        };
    }
}
