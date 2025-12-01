




export const checkApolloServiceability = async (lat, lon) => {
    try {
        const url = `https://apigateway.apollo247.in/serviceability-api//v1/geocode/serviceable?latitude=${lat}&longitude=${lon}`;

        const headers = {
            "authority": "apigateway.apollo247.in",
            "method": "GET",
            "path": `/serviceability-api//v1/geocode/serviceable?latitude=${lat}&longitude=${lon}`,
            "scheme": "https",
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.8",
            "authorization": "8nBs8ucvbqlCGShwDr7oHv0mePqwhE",
            "origin": "https://www.apollopharmacy.in",
            "priority": "u=1, i",
            "referer": "https://www.apollopharmacy.in/",
            "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
        };

        console.log(`Checking Apollo serviceability: Lat=${lat}, Lon=${lon}`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Apollo API failed with status: ${response.status}`);
        }

        const data = await response.json();

        // console.log(`Saved Apollo response to ${filePath}`);

        return { success: true, data };

    } catch (error) {
        console.error('Error in checkApolloServiceability:', error);
        return { success: false, message: error.message };
    }
};
