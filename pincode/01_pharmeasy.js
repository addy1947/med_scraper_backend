




export const checkPharmEasyPincode = async (pincode) => {
    try {
        const url = `https://pharmeasy.in/apt-api/pincode/pincode?pincode=${pincode}`;

        const headers = {
            "authority": "pharmeasy.in",
            "method": "GET",
            "path": `/apt-api/pincode/pincode?pincode=${pincode}`,
            "scheme": "https",
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.6",
            "cookie": "NPAB_Var=new; NPAB_XDI=Ic8OU_etCn6zkuSq7CNWp; X-App-Version=2.2; X-Phone-Platform=web; XPESS=active; X-IP=103.227.71.224%2C%2096.17.194.228%2C%2023.197.28.213; XdI=3zw6B5WV6sAs-ufxAmf00; X-Feature-Flags=%7B%22isBestOfferEnabled%22%3Atrue%7D; _cg=1100; XPESD=%7B%22session_id%22%3A%22s_w_3zw6B5WV6sAs-ufxAmf00_1764405737000%22%2C%22session_id_flag%22%3A%22fingerprint%22%2C%22referrer%22%3A%22http%3A%2F%2Flocalhost%3A5173%2F%22%2C%22session_start_time%22%3A%222025-11-29T08%3A42%3A17.063Z%22%7D; XPESS_v2=s_w_3zw6B5WV6sAs-ufxAmf00_1764405737000; X-Default-City=2; X-Pincode=110027",
            "priority": "u=1, i",
            "referer": "https://pharmeasy.in/",
            "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
        };

        console.log(`Checking PharmEasy pincode: ${pincode}`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
            // PharmEasy might return 304 Not Modified, which fetch handles transparently usually, 
            // but if it's an error status we should know. 
            // However, 304 is technically a redirect/cached response, but in this context if we get data it's fine.
            // If we get 304, there might be no body.
            if (response.status !== 304) {
                console.warn(`PharmEasy API returned status: ${response.status}`);
            }
        }

        // If 304, we might not get JSON. But the user showed 304 in the request dump, 
        // yet the content-length was 0. This is tricky. 
        // If the browser sends If-None-Match, it gets 304. We are NOT sending If-None-Match, 
        // so we should get 200 and the data.

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.warn('Could not parse PharmEasy response as JSON', e);
            data = { error: 'Invalid JSON response', status: response.status };
        }

        // console.log(`Saved PharmEasy response to ${filePath}`);

        return { success: true, data };

    } catch (error) {
        console.error('Error in checkPharmEasyPincode:', error);
        return { success: false, message: error.message };
    }
};
