const GHL_API_KEY = "pit-4d81330c-4429-42e5-9e77-1f5b3247871d";
// TODO: Replace with your actual Location ID (Sub-Account ID) from GHL Settings -> Business Info
const LOCATION_ID = "Sebtjb36Q2CSa3JnoKQQ";

export interface ContactData {
    name: string;
    email?: string;
    phone?: string;
    tags?: string[];
}

/**
 * Syncs a contact to GoHighLevel (LeadConnector)
 */
export const syncContactToGHL = async (data: ContactData) => {


    const url = "https://services.leadconnectorhq.com/contacts/";

    // Split name into first and last if possible
    const nameParts = data.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const payload = {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        tags: data.tags || ["myRA Leaderboard"],
        locationId: LOCATION_ID,
        source: "myRA AI Chat"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("GHL Sync Failed:", response.status, errorText);
            return null;
        }

        const result = await response.json();
        console.log("GHL Sync Success:", result);
        return result;

    } catch (error) {
        console.error("GHL Connection Error:", error);
        return null;
    }
};
