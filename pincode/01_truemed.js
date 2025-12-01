




export const checkTrueMedPincode = async (pincode) => {
    try {
        const url = `https://nal.tmmumbai.in/CustomerService/v1/checkPincodeServiceability?pincode=${pincode}`;

        const headers = {
            "authority": "nal.tmmumbai.in",
            "method": "GET",
            "path": `/CustomerService/v1/checkPincodeServiceability?pincode=${pincode}`,
            "scheme": "https",
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.5",
            "access-control-allow-origin": "*",
            "origin": "https://www.truemeds.in",
            "priority": "u=1, i",
            "referer": "https://www.truemeds.in/",
            "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
        };

        console.log(`Checking TrueMeds pincode: ${pincode}`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`TrueMeds API failed with status: ${response.status}`);
        }

        const data = await response.json();

        // console.log(`Saved TrueMeds response to ${filePath}`);

        return { success: true, data };

    } catch (error) {
        console.error('Error in checkTrueMedPincode:', error);
        return { success: false, message: error.message };
    }
};
