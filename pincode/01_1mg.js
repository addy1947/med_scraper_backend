




export const check1mgServiceability = async (lat, lon) => {
    try {
        const url = `https://www.1mg.com/api/v3/getGeolocation/${lat},${lon}`;

        const headers = {
            "authority": "www.1mg.com",
            "method": "GET",
            "path": `/api/v3/getGeolocation/${lat},${lon}`,
            "scheme": "https",
            "accept": "application/x-www-form-urlencoded; charset=UTF-8",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.5",
            "cache-control": "no-cache, no-store, must-revalidate",
            "cookie": "VISITOR-ID=ed2e6bf2-7db6-4d28-97d0-6d5ec66321dd_WWpiir2jGZ_0176_1758794043456; abVisitorId=435264; abExperimentShow=true; geolocation=false; jarvis-id=c5cf50a5-4bdc-42bf-bde5-7be40d165a2e; TMP_HKP_USER_ID=ed2e6bf2-7db6-4d28-97d0-6d5ec66321dd_WWpiir2jGZ_0176_1758794043456; city=new%20delhi; _csrf=z-DH30OI_WafPwKVvoTymIwj; isLocaleRedirect=false; isLocaleUIChange=false; synapse-init=false; synapse-platform=web; is_cp_member=false; loggedIn=true; userId=%22eb7fe4f4-29c5-44f9-b5cf-567baf9e6c35%22; authToken=f7b72bda-20e6-4d29-9d8c-e527f5cdeb08; cashback_token=undefined; isLoyalUser=true; session=huNRtnrF96GNmZz8fU6W7g.mNoQNdxI4cp1mgK5fLvMlfW5PbApgLvgDYjOYs655QELUOPab2L5zLRor0ZJOK0wP89bmumrEWMqHIB3aB8LJGO6aEWcsRhZell66nHrwC6PslsN9piHDODfjfinO90CxDlPjknjWDPYjByEkK9EoRVZ-KoLv8J6j814q5UdEd7M4FTq32cWK1Cyikr4n_cVy1iAVbzb8zMTGqe6ER_7GBg4tVCQruo54BlveqGIFaHWX6tDnVSdtfqjYhqlmCON1CgF5hAfKzjbA9LCsAW7Nwe1dqZk0cWg_cV5enA_pnDpV1PWoghN1QK2j3lm_rkm6OY9HaCLACNmGnnoTyh8JBHdaMuqK-VobRjlNaTsKf0upvILK1yVmqxtYZpXTbUAEhQYpQsRfbubD_rjGQoIecx1C0gJu_SvV4HSCbpRy_f4m1OzGqtEt5PU3ASvl9uulGYXhDbW_T_ikxkuEJ4F-0_9VRlEqqMWRdSWc_LhETUtAV2nj9pTAyoQq-_x898lOGyCicFQNH8F4_MS4fHpRjPu3Ir3FtwlhoU3xUJfvC0X2MhUV_9nRXtkr5cNNvhnTxEVHJZRNYSM4rNe5ON1FqMQeyW7tQZAgqgkfaJsHqc.1764351568326.144000000.4KGKx3VrIH2-YQ3DxIphVcYKGz0EpHJw2dkR43g1g4U; amoSessionId=8146e765-d033-4068-a9c6-4a1ffd7223d9; AWSALBTG=aYPFec2HiPOoz+P1xv5pZ0a9Ab8WaNMD12nMvDxbTJqyNqwp3Ih5HfWd6IcRrbkOgTp+9Mu7pk3JYAYN3Dnn5DFCnLTl+Ie3z9dF22DVUUqngaxG8tuaty4Ty6aTkyJfOvo2i6eC/Gd1OCek0rHoLkTh1kpezyhmpcxo/isbZ62j; AWSALBTGCORS=aYPFec2HiPOoz+P1xv5pZ0a9Ab8WaNMD12nMvDxbTJqyNqwp3Ih5HfWd6IcRrbkOgTp+9Mu7pk3JYAYN3Dnn5DFCnLTl+Ie3z9dF22DVUUqngaxG8tuaty4Ty6aTkyJfOvo2i6eC/Gd1OCek0rHoLkTh1kpezyhmpcxo/isbZ62j",
            "hkp-platform": "Healthkartplus-0.0.1-Desktop",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "referer": "https://www.1mg.com/order-with-prescription",
            "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "x-csrf-token": "kFHSUjgM-62A_T0b6KhV7X00N4tMtOjy1uOU",
            "x-html-canrender": "True",
            "x-platform": "Desktop-0.0.1"
        };

        console.log(`Checking 1mg serviceability: Lat=${lat}, Lon=${lon}`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`1mg API failed with status: ${response.status}`);
        }

        const data = await response.json();

        // console.log(`Saved 1mg response to ${filePath}`);

        return { success: true, data };

    } catch (error) {
        console.error('Error in check1mgServiceability:', error);
        return { success: false, message: error.message };
    }
};
