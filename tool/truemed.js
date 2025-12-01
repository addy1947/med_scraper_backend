import axios from 'axios';

const BASE_URL = 'https://nal.tmmumbai.in';

/**
 * Fetches search suggestions from TrueMeds API and returns only the specified product fields.
 * Returned fields: skuName, mrp, sellingPrice, discount, packForm, productImageUrl, productUrlSuffix
 */
export async function saveTrueMedSearch(query = 'paracetamol', options = {}) {

  const url = `${BASE_URL}/CustomerService/getSearchSuggestion`;
  const params = {
    searchString: query,
    isMultiSearch: 'true',
    elasticSearchType: 'SEARCH_SUGGESTION',
    warehouseId: '20',
    variantId: '18',
    searchVariant: 'N',
    orderConfirmSrc: 'WEBSITE',
    sourceVersion: 'TM_WEBSITE_V_4.6.2'
  };

  try {
    console.log(`Fetching TrueMeds search suggestions: ${url}`);

    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Origin': 'https://www.truemeds.in',
        'Referer': 'https://www.truemeds.in/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1'
      }
    });

    // Extract only the required fields from productList
    const productList = response.data?.responseData?.productList || [];
    const filteredProducts = productList.map(item => {
      const product = item.product || {};
      return {
        skuName: product.skuName || null,
        mrp: product.mrp || null,
        sellingPrice: product.sellingPrice || null,
        discount: product.discount || null,

        packForm: product.packForm || null,
        productImageUrl: product.productImageUrl || null,
        productUrlSuffix: product.productUrlSuffix || null
      };
    });

    console.log(`Fetched ${filteredProducts.length} TrueMeds products`);

    return {
      success: true,
      url: `${url}?${new URLSearchParams(params).toString()}`,
      products: filteredProducts.length,
      data: filteredProducts
    };
  } catch (error) {
    console.error('Failed to fetch TrueMeds search suggestions:', error.message);
    return {
      success: false,
      url: `${url}?${new URLSearchParams(params).toString()}`,
      error: error.message,
      products: 0,
      data: []
    };
  }
}

