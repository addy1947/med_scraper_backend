import axios from "axios";





export async function checkNetMedsPincode(pincode) {
    console.log(`Checking NetMeds serviceability for Pincode=${pincode}`);

    if (!pincode) {
        return { success: false, error: "Pincode is required" };
    }

    try {
        const url = `https://www.netmeds.com/api/service/application/logistics/v1.0/localities/pincode/${pincode}`;



        const locationDetail = JSON.stringify({
            country: "INDIA",
            country_iso_code: "IN",
            pincode: Number(pincode)
        });

        const cookie = `anonymous_id=280f84e1d0bd47a8b349a67cd1ac2a12; old_browser_anonymous_id=280f84e1d0bd47a8b349a67cd1ac2a12; WZRK_S_865-77W-496Z=%7B%22p%22%3A2%7D`;

        const response = await axios.get(url, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.7",
                "authorization": "Bearer NjVmNTYyYzE1MDRhNTlhNjdmNTI5YWQ0Ol9VLW9oSTRJeQ==",
                "referer": "https://www.netmeds.com/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
                "x-currency-code": "INR",
                "x-location-detail": locationDetail,
                "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "priority": "u=1, i",
                "cookie": cookie
            }
        });

        console.log("NetMeds Response Status:", response.status);



        return { success: true, data: response.data, pincode };

    } catch (err) {
        console.error("Error checking NetMeds:", err.message);
        if (err.response) {
            // console.error("NetMeds Error Status:", err.response.status);
            if (err.response.status === 403) {
                return { success: false, error: "NetMeds API requires dynamic signature (403 Forbidden). Integration blocked." };
            }
        }
        // Return failure but don't crash the server
        return { success: false, error: err.message || "NetMeds check failed" };
    }
}
