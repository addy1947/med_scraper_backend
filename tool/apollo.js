import axios from "axios";

export async function scrapeApollo(query, maxProduct = 3) {
	try {
		const response = await axios.post(
			"https://search.apollo247.com/v4/fullSearch",
			{
				query,
				page: 1,
				productsPerPage: 24,
				selSortBy: "relevance",
				filters: []
			},
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: "Oeu324WMvfKOj5KMJh2Lkf00eW1",
					Origin: "https://www.apollopharmacy.in",
					Referer: "https://www.apollopharmacy.in/",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
					"x-app-os": "web"
				}
			}
		);
		const data = response.data;
		const products = data?.data?.productDetails?.products || [];
		const filteredProducts = products.map(p => ({
				name: p.name,
				url: `https://www.apollopharmacy.in/otc/${p.urlKey}`,
				image: `https://images.apollo247.in/pub/media${p.thumbnail}`,
				unitSize: p.unitSize,
				price: p.price,
				specialPrice: p.specialPrice,
				discountPercentage: p.discountPercentage,
				pricePerUnit: p.additionalInfo?.pricePerUnit
			}));
			return {
				success: true,
				products: filteredProducts.length,
				data: filteredProducts.slice(0, maxProduct)
			};
	} catch (err) {
		return {
			success: false,
			products: 0,
			error: err.response?.data || err.message,
			data: []
		};
	}
}
