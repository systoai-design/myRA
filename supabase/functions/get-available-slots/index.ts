import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvailableSlot {
  date: string;      // "2025-01-13"
  time: string;      // "10:00"
  datetime: string;  // ISO string for booking
  display: string;   // "Mon, Jan 13 @ 10:00 AM"
}

interface SlotsByDate {
  [date: string]: AvailableSlot[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
    const GHL_CALENDAR_ID = Deno.env.get("GHL_CALENDAR_ID");

    if (!GHL_API_KEY || !GHL_CALENDAR_ID) {
      console.error("Missing GHL credentials");
      throw new Error("GHL credentials not configured");
    }

    const { days = 14, timezone = "America/Chicago" } = await req.json().catch(() => ({}));

    console.log("Fetching available slots for next", days, "days");

    const allSlots: AvailableSlot[] = [];
    const today = new Date();
    
    // Start from tomorrow to give buffer
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const slotsUrl = `https://services.leadconnectorhq.com/calendars/${GHL_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=${encodeURIComponent(timezone)}`;
    
    console.log("Fetching slots from:", slotsUrl);

    const response = await fetch(slotsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Version": "2021-04-15",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch slots:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unable to fetch availability",
          slots: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slotsData = await response.json();
    console.log("Raw slots response:", JSON.stringify(slotsData));

    // GHL returns: { "2025-01-13": { "slots": ["2025-01-13T10:00:00-06:00", ...] }, ... }
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Process each date in the response
    for (const [dateKey, dateData] of Object.entries(slotsData)) {
      const dateSlots = (dateData as { slots?: string[] })?.slots;
      if (!Array.isArray(dateSlots)) continue;

      for (const slotString of dateSlots) {
        const slotDate = new Date(slotString);
        
        // Format for display
        const dayName = dayNames[slotDate.getDay()];
        const monthName = monthNames[slotDate.getMonth()];
        const dayNum = slotDate.getDate();
        const hours = slotDate.getHours();
        const minutes = slotDate.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        const timeStr = minutes === 0 
          ? `${hour12}:00 ${ampm}` 
          : `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
        
        allSlots.push({
          date: dateKey,
          time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
          datetime: slotString,
          display: `${dayName}, ${monthName} ${dayNum} @ ${timeStr}`,
        });
      }
    }

    // Sort by datetime
    allSlots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Group slots by date
    const slotsByDate: SlotsByDate = {};
    for (const slot of allSlots) {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    }

    // Get strategic slots: earliest & latest for first 2 days with availability
    const strategicSlots: AvailableSlot[] = [];
    const datesWithSlots = Object.keys(slotsByDate).sort();
    
    for (let i = 0; i < Math.min(2, datesWithSlots.length); i++) {
      const date = datesWithSlots[i];
      const daySlots = slotsByDate[date];
      
      if (daySlots.length > 0) {
        // Add earliest slot of this day
        strategicSlots.push(daySlots[0]);
        
        // Add latest slot of this day (if different from earliest)
        if (daySlots.length > 1) {
          strategicSlots.push(daySlots[daySlots.length - 1]);
        }
      }
    }

    console.log("Returning", strategicSlots.length, "strategic slots (earliest/latest for 2 days)");

    return new Response(
      JSON.stringify({ 
        success: true, 
        slots: strategicSlots,
        totalAvailable: allSlots.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Get slots error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch slots",
        slots: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
