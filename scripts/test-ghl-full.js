const GHL_API_KEY = "pit-4d81330c-4429-42e5-9e77-1f5b3247871d";
const LOCATION_ID = "Sebtjb36Q2CSa3JnoKQQ";

async function testGHLIntegration() {
    console.log("Testing GHL Integration with Location ID:", LOCATION_ID);

    const url = "https://services.leadconnectorhq.com/contacts/?limit=1&locationId=" + LOCATION_ID;

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
            console.log("SUCCESS: API Key and Location ID are valid and connected.");
        } else {
            console.error("FAILURE: Could not access contacts. Check permissions.");
        }

    } catch (error) {
        console.error("Connection Error:", error);
    }
}

testGHLIntegration();
