import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const GHL_API_KEY = process.env.VITE_GHL_API_KEY;
const GHL_CALENDAR_ID = process.env.VITE_GHL_CALENDAR_ID;
const GHL_LOCATION_ID = process.env.VITE_GHL_LOCATION_ID;

console.log("=== GHL API Test ===");
console.log(`API Key Present: ${!!GHL_API_KEY}`);
console.log(`Calendar ID Present: ${!!GHL_CALENDAR_ID}`);
console.log(`Location ID Present: ${!!GHL_LOCATION_ID}\n`);

async function testBooking() {
    if (!GHL_API_KEY || !GHL_CALENDAR_ID || !GHL_LOCATION_ID) {
        console.error("❌ Missing required GHL environment variables. Cannot proceed.");
        return;
    }

    try {
        console.log("1. Creating Test Contact...");
        const contactRes = await fetch(
            "https://services.leadconnectorhq.com/contacts/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GHL_API_KEY}`,
                    Version: "2021-07-28",
                },
                body: JSON.stringify({
                    firstName: "Kyle",
                    lastName: "Z (MyRA Auto-Test)",
                    email: "pkz.upwork@gmail.com",
                    phone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                    address1: "123 API Test Lane",
                    dateOfBirth: "01/01/1980",
                    locationId: GHL_LOCATION_ID,
                    source: "MyRA Auto-Test Script",
                }),
            }
        );

        let contactId = null;
        if (contactRes.ok) {
            const contactData = await contactRes.json();
            contactId = contactData.contact?.id;
            console.log(`✅ Contact created/found successfully. ID: ${contactId}`);
        } else {
            const errBody = await contactRes.json().catch(() => ({}));
            if (errBody.statusCode === 400 && errBody.meta && errBody.meta.contactId) {
                contactId = errBody.meta.contactId;
                console.log(`✅ Contact already exists. Using existing ID: ${contactId}`);
            } else {
                console.error("❌ Failed to create/update contact:", errBody);
                return; // Can't proceed without a valid contact Id
            }
        }

        console.log("\n2. Checking Real Calendar Availability...");

        // Check availability between now and 14 days from now
        const startDate = new Date().getTime();
        const endDate = startDate + (14 * 24 * 60 * 60 * 1000); // 14 days

        const availabilityRes = await fetch(
            `https://services.leadconnectorhq.com/calendars/${GHL_CALENDAR_ID}/free-slots?startDate=${startDate}&endDate=${endDate}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${GHL_API_KEY}`,
                    Version: "2021-04-15",
                }
            }
        );

        if (!availabilityRes.ok) {
            console.error("❌ Failed to fetch calendar availability:", await availabilityRes.text());
            return;
        }

        const availabilityData = await availabilityRes.json();

        let targetSlotStr = null;
        let targetSlotDateObj = null;

        // Try to find the first open slot in the object map
        for (const [dateKey, payload] of Object.entries(availabilityData)) {
            // Some API versions return arrays of strings, some return objects with 'slots' arrays
            const slots = Array.isArray(payload) ? payload : (payload.slots || []);

            if (slots && slots.length > 0) {
                targetSlotStr = slots[0];
                console.log(`✅ Found open slot on ${dateKey}: ${targetSlotStr}`);
                // we have to convert the slot back to a valid Date object for the booking
                targetSlotDateObj = new Date(targetSlotStr);
                break;
            }
        }

        if (!targetSlotStr || !targetSlotDateObj) {
            console.error("\n❌ Could not find ANY open slots on this calendar for the next 14 days!");
            console.error("Please verify that the calendar is active in your GHL account and has business hours assigned.");
            return;
        }

        console.log("\n3. Attempting to Book Appointment at first open slot...");

        const endTime = new Date(targetSlotDateObj.getTime() + 30 * 60 * 1000);

        const appointmentData = {
            calendarId: GHL_CALENDAR_ID,
            locationId: GHL_LOCATION_ID,
            contactId: contactId,
            startTime: targetSlotDateObj.toISOString(),
            endTime: endTime.toISOString(),
            title: "TEST API Meeting",
            appointmentStatus: "confirmed",
            address: "",
            ignoreDateRange: false,
            toNotify: true,
        };

        const res = await fetch(
            "https://services.leadconnectorhq.com/calendars/events/appointments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GHL_API_KEY}`,
                    Version: "2021-04-15",
                },
                body: JSON.stringify(appointmentData),
            }
        );

        if (res.ok) {
            const data = await res.json();
            console.log(`✅ Meeting scheduled successfully for ${targetSlotDateObj.toLocaleString()}!`);
            console.log("Appointment ID:", data.appointmentId || (data.event && data.event.id) || "Created");
            console.log("An invite should be sent to pkz.upwork@gmail.com shortly.");
            console.log("\n⚠️ IMPORTANT: Please log into GoHighLevel and delete this test appointment and contact!");
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.log(`❌ Slot unavailable when trying to book:`, errorData.message || errorData.error || "Unknown");
        }

    } catch (error) {
        console.error("❌ Fatal Error during test:", error);
    }
}

testBooking();
