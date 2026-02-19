const GHL_API_KEY = "pit-4d81330c-4429-42e5-9e77-1f5b3247871d";

async function testGHL() {
    console.log("Testing GHL API connection...");

    // Trying to fetch user info to see who owns this token
    const url = "https://services.leadconnectorhq.com/oauth/me";
    // Note: The common endpoint for checking token validity/owner

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text);

        if (response.ok) {
            console.log("SUCCESS: GHL API Key is valid.");
        } else {
            console.error("FAILURE: GHL API request failed.");
        }

    } catch (error) {
        console.error("Connection Error:", error);
    }
}

testGHL();
