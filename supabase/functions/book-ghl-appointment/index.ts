import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
    const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");
    const GHL_CALENDAR_ID = Deno.env.get("GHL_CALENDAR_ID");

    if (!GHL_API_KEY || !GHL_LOCATION_ID || !GHL_CALENDAR_ID) {
      console.error("Missing GHL credentials");
      throw new Error("GHL credentials not configured");
    }

    const {
      contactName,
      contactEmail,
      contactPhone,
      preferredDate,
      preferredTime,
      timezone = "America/Chicago"
    } = await req.json();

    console.log("Booking appointment for:", contactName, contactEmail, preferredDate, preferredTime);

    // Convert date string to Unix timestamp in milliseconds
    // preferredDate format: "2025-01-12"
    const startOfDay = new Date(`${preferredDate}T00:00:00`);
    const endOfDay = new Date(`${preferredDate}T23:59:59`);
    const startTimestamp = startOfDay.getTime();
    const endTimestamp = endOfDay.getTime();

    // Step 1: Get available slots for the requested date
    const slotsUrl = `https://services.leadconnectorhq.com/calendars/${GHL_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=${encodeURIComponent(timezone)}`;

    console.log("Fetching available slots from:", slotsUrl);

    const slotsResponse = await fetch(slotsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Version": "2021-04-15",
        "Content-Type": "application/json",
      },
    });

    if (!slotsResponse.ok) {
      const errorText = await slotsResponse.text();
      console.error("Failed to fetch slots:", slotsResponse.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to check availability. Please use the booking link instead.",
          bookingLink: "https://myra.ai/meet-your-planner"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slotsData = await slotsResponse.json();
    console.log("Raw slots response:", JSON.stringify(slotsData));

    // GHL returns: { "2026-01-12": { "slots": ["...", "..."] } }
    const dateData = slotsData[preferredDate];
    console.log("Date data for", preferredDate, ":", JSON.stringify(dateData));
    const dateSlots: string[] = Array.isArray(dateData?.slots) ? dateData.slots : [];

    if (!dateSlots || dateSlots.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `No availability on ${preferredDate}. Please choose another date or use the booking link.`,
          bookingLink: "https://myra.ai/meet-your-planner",
          availableSlots: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the closest matching slot to preferred time
    let selectedSlot = dateSlots[0];
    if (preferredTime) {
      const preferredHour = parseInt(preferredTime.split(":")[0]);
      const foundSlot = dateSlots.find((slot: string) => {
        const slotTime = new Date(slot);
        return slotTime.getHours() === preferredHour;
      });
      if (foundSlot) selectedSlot = foundSlot;
    }

    console.log("Selected slot:", selectedSlot);

    // Step 2: Create or find contact
    const contactSearchUrl = `https://services.leadconnectorhq.com/contacts/lookup?email=${encodeURIComponent(contactEmail)}&locationId=${GHL_LOCATION_ID}`;

    let contactId: string | null = null;

    const searchResponse = await fetch(contactSearchUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Version": "2021-07-28",
        "Content-Type": "application/json",
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contacts && searchData.contacts.length > 0) {
        contactId = searchData.contacts[0].id;
        console.log("Found existing contact:", contactId);
      }
    }

    // If no contact found by email, try phone lookup
    if (!contactId) {
      console.log("Trying phone lookup...");
      const phoneSearchUrl = `https://services.leadconnectorhq.com/contacts/lookup?phone=${encodeURIComponent(contactPhone)}&locationId=${GHL_LOCATION_ID}`;
      const phoneSearchResponse = await fetch(phoneSearchUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Version": "2021-07-28",
        },
      });

      if (phoneSearchResponse.ok) {
        const phoneData = await phoneSearchResponse.json();
        console.log("Phone lookup response:", JSON.stringify(phoneData));

        // Check multiple possible response formats
        if (phoneData.contacts && phoneData.contacts.length > 0) {
          contactId = phoneData.contacts[0].id;
          console.log("Found contact by phone:", contactId);
        } else if (phoneData.contact?.id) {
          contactId = phoneData.contact.id;
          console.log("Found contact by phone (single):", contactId);
        }
      }
    }

    // If still no contact found, create one
    if (!contactId) {
      // Split name into firstName and lastName for GHL API
      const nameParts = contactName.trim().split(/\s+/);
      const firstName = nameParts[0] || contactName;
      const lastName = nameParts.slice(1).join(" ") || "";

      console.log("Creating new contact:", { firstName, lastName, email: contactEmail, phone: contactPhone });

      const createContactResponse = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          firstName,
          lastName,
          email: contactEmail,
          phone: contactPhone,
        }),
      });

      if (!createContactResponse.ok) {
        const errorData = await createContactResponse.json().catch(() => ({}));
        console.error("Failed to create contact:", {
          status: createContactResponse.status,
          statusText: createContactResponse.statusText,
          error: errorData,
        });

        // If duplicate contact, use the existing contact ID from error
        if (errorData.meta?.contactId) {
          console.log("Using existing contact from duplicate error:", errorData.meta.contactId);
          contactId = errorData.meta.contactId;
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Contact creation failed: ${errorData.message || errorData.error || createContactResponse.statusText}`,
              bookingLink: "https://myra.ai/meet-your-planner"
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // Only read body when response was successful
        const contactData = await createContactResponse.json();
        contactId = contactData.contact?.id;
        console.log("Created contact:", contactId);
      }
    }

    if (!contactId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to process booking. Please use the booking link instead.",
          bookingLink: "https://myra.ai/meet-your-planner"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Book the appointment
    const bookingResponse = await fetch("https://services.leadconnectorhq.com/calendars/events/appointments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Version": "2021-04-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calendarId: GHL_CALENDAR_ID,
        locationId: GHL_LOCATION_ID,
        contactId: contactId,
        startTime: selectedSlot,
        title: `Venue Match Call - ${contactName}`,
        appointmentStatus: "confirmed",
      }),
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error("Failed to book appointment:", bookingResponse.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to complete booking. Please use the booking link instead.",
          bookingLink: "https://myra.ai/meet-your-planner"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bookingData = await bookingResponse.json();
    console.log("Appointment booked:", JSON.stringify(bookingData));

    // Format the confirmed time for display (use the slot's timezone info)
    const confirmedTime = new Date(selectedSlot);
    const formattedDate = confirmedTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: timezone
    });
    const formattedTime = confirmedTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Your Venue Match Call is confirmed for ${formattedDate} at ${formattedTime}.`,
        appointmentId: bookingData.id || bookingData.appointment?.id,
        confirmedSlot: selectedSlot
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Booking error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Booking failed",
        bookingLink: "https://myra.ai/meet-your-planner"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
