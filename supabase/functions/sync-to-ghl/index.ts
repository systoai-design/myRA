import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/Kb5sT0MWHLb5kHEGCNqr/webhook-trigger/068e0766-c91c-461b-9d34-dc4e6f1876c8";


const EXTRACTION_PROMPT = `You are a data extraction assistant. Analyze the following conversation between a wedding planning assistant (Pura) and a user. Extract the structured data AND create a brief summary.

Extract and return a JSON object with this EXACT structure:
{
  "contact": {
    "firstName": "string or null",
    "lastName": "string or null", 
    "email": "string or null",
    "phone": "string or null"
  },
  "quizData": {
    "location": {
      "place_name": "string or null (e.g., 'Austin, TX, USA')"
    },
    "guestCount": "number or null",
    "budget": "string or null (e.g., '$30,000 - $40,000')",
    "season": "string or null (Spring/Summer/Fall/Winter)",
    "venueTypes": ["array of venue types/settings or empty array"],
    "venueStyle": ["array of style preferences or empty array"],
    "scenery": ["array of scenery preferences or empty array"],
    "celebrationType": "string or null",
    "requiredSpaces": ["array of required spaces or empty array"],
    "petsAllowed": "boolean or null",
    "wheelchairAccessible": "boolean or null",
    "vendorHandling": "string or null (All-Inclusive/Flexible/DIY)",
    "coordinationRequired": "boolean or null"
  },
  "conversationSummary": {
    "overview": "2-3 sentence summary of the conversation",
    "keyTakeaways": ["array of 2-4 key points or special requests"],
    "leadTemperature": "hot | warm | cold",
    "nextSteps": "string describing recommended follow-up action"
  }
}

Rules for extraction:
- For names, try to split into firstName and lastName if possible
- For location, extract the place name as discussed (city, state, country format like "Austin, TX, USA")
- For guestCount, extract as a NUMBER (not string). If a range like "150-175", use the higher number (175)
- For budget, keep as string with dollar signs (e.g., "$30,000 - $40,000")
- For season, derive from wedding date: Dec-Feb = Winter, Mar-May = Spring, Jun-Aug = Summer, Sep-Nov = Fall. If only a month is mentioned, derive season from that.
- For venueTypes, extract from: Barn, Beachfront, Breweries & Wineries, Castle, City Skyline, Country Club, Desert, Estate, Garden, Historic, Hotel, Industrial, Mountain, Rooftop, Tent, Tropical, Vineyard, Ballroom, Resort, Beach House
- For venueStyle, extract from: Artistic, Boho, Casual, Chic, Classic, Cozy, Electric, Elegant, Glamorous, Grand, Industrial, Luxury, Minimalist, Modern, Playful, Romantic, Rustic, Traditional, Vintage, Whimsical, Tropical
- For scenery, extract from: Beach, Beach View, City Skyline, Courtyard, Desert Landscape, Forest, Garden, Lake View, Mountain, Mountain View, Ocean View, Open Fields, River View, Vineyard View, Woodland

FIELD EXTRACTION RULES:

1. For requiredSpaces (Q8 - spaces question):
   Extract only physical venue spaces selected:
   - "Bridal Suite", "Groom Suite", "Indoor Ceremony Space", "Outdoor Ceremony Space", 
   - "Indoor Reception Space", "Outdoor Reception Space", "On-site Accommodations"

2. For petsAllowed (Q9 - pets question):
   - If user said "Yes" / "need pet-friendly" / "we need pet-friendly" → true
   - If user said "No" / "no pets" → false
   - If not answered → null

3. For wheelchairAccessible (Q10 - accessibility question):
   - If user said "Yes" / "accessibility needed" / "wheelchair accessibility needed" → true
   - If user said "No" / "not needed" → false
   - If not answered → null

4. For vendorHandling (Q11 - vendors question):
   - "All-Inclusive" if user said "All-Inclusive" / "venue provides food" / "venue provides food & drinks"
   - "Flexible" if user said "Flexible" / "pick my own caterer"
   - "DIY" if user said "DIY" / "blank canvas" / "bring everything myself"
   - null if not answered

5. For coordinationRequired (Q12 - coordination question):
   - If user said "Yes" / "coordination included" → true
   - If user said "No" / "I have my own planner" / "own planner" → false
   - If not answered → null

- For celebrationType, use one of: "Full Wedding (Ceremony + Reception)", "Ceremony Only", "Reception Only", "Multi-Day Celebration", "Cocktail-Style Reception"

Summary rules:
- Overview should be conversational and capture the essence of what was discussed
- Key takeaways should highlight unique requirements or concerns
- Lead temperature: "hot" if ready to book, "warm" if interested but has questions, "cold" if just browsing
- Next steps should be actionable for the sales team

Return ONLY the JSON object, no other text. If a field wasn't discussed or is unknown, use null for strings/numbers, empty array for arrays. For the boolean fields (petsAllowed, wheelchairAccessible, coordinationRequired), default to false if the Q8 extras question was asked but that specific option was not selected.`;

// Geocode a location using Mapbox API
async function geocodeLocation(placeName: string): Promise<[number, number]> {
  const MAPBOX_ACCESS_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN");

  if (!MAPBOX_ACCESS_TOKEN || !placeName) {
    console.log("Mapbox geocoding skipped - no token or place name");
    return [0, 0];
  }

  try {
    const encoded = encodeURIComponent(placeName);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
    );

    if (!response.ok) {
      console.error("Mapbox geocoding error:", response.status);
      return [0, 0];
    }

    const data = await response.json();
    const center = data.features?.[0]?.center; // [lng, lat]

    if (center && Array.isArray(center) && center.length === 2) {
      console.log(`Geocoded "${placeName}" to coordinates:`, center);
      return center as [number, number];
    }

    console.log("No geocoding results for:", placeName);
    return [0, 0];
  } catch (error) {
    console.error("Geocoding error:", error);
    return [0, 0];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Sync to GHL request received, extracting data from conversation...");

    // Format conversation for extraction
    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    // Use OpenAI to extract structured data from conversation
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: conversationText },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI extraction error:", aiResponse.status, errorText);
      throw new Error("Failed to extract data from conversation");
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || "";

    console.log("AI extraction response:", extractedText);

    // Parse the extracted JSON
    let extractedData;
    try {
      // Try to find JSON in the response (in case there's extra text)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse extracted data:", parseError);
      throw new Error("Failed to parse extracted conversation data");
    }

    // Get location and geocode it
    const placeName = extractedData.quizData?.location?.place_name || "";
    const coordinates = await geocodeLocation(placeName);

    // Build the webhook payload in GHL expected format
    const quizData: Record<string, unknown> = {};

    // Only include fields that have values
    if (placeName) {
      quizData.location = {
        place_name: placeName,
        center: coordinates,
        geometry: {
          type: "Point",
          coordinates: coordinates,
        },
      };
    }
    if (extractedData.quizData?.guestCount != null) {
      quizData.guestCount = extractedData.quizData.guestCount;
    }
    if (extractedData.quizData?.budget) {
      quizData.budget = extractedData.quizData.budget;
    }
    if (extractedData.quizData?.season) {
      quizData.season = extractedData.quizData.season;
    }
    if (Array.isArray(extractedData.quizData?.venueTypes) && extractedData.quizData.venueTypes.length > 0) {
      quizData.venueTypes = extractedData.quizData.venueTypes;
    }
    if (Array.isArray(extractedData.quizData?.venueStyle) && extractedData.quizData.venueStyle.length > 0) {
      quizData.venueStyle = extractedData.quizData.venueStyle;
    }
    if (Array.isArray(extractedData.quizData?.scenery) && extractedData.quizData.scenery.length > 0) {
      quizData.scenery = extractedData.quizData.scenery;
    }
    if (extractedData.quizData?.celebrationType) {
      quizData.celebrationType = extractedData.quizData.celebrationType;
    }
    if (Array.isArray(extractedData.quizData?.requiredSpaces) && extractedData.quizData.requiredSpaces.length > 0) {
      quizData.requiredSpaces = extractedData.quizData.requiredSpaces;
    }

    // Boolean/string fields from Q8 extras - default to false if not set
    quizData.petsAllowed = extractedData.quizData?.petsAllowed === true;
    quizData.wheelchairAccessible = extractedData.quizData?.wheelchairAccessible === true;
    quizData.coordinationRequired = extractedData.quizData?.coordinationRequired === true;
    quizData.vendorHandling = extractedData.quizData?.vendorHandling || null;

    const webhookPayload: Record<string, unknown> = {
      email: extractedData.contact?.email || null,
    };

    // Only include quizData if it has any fields
    if (Object.keys(quizData).length > 0) {
      webhookPayload.quizData = quizData;
    }

    // Include contact info separately for full details
    if (extractedData.contact?.firstName || extractedData.contact?.lastName || extractedData.contact?.phone) {
      webhookPayload.contact = {
        firstName: extractedData.contact?.firstName || null,
        lastName: extractedData.contact?.lastName || null,
        phone: extractedData.contact?.phone || null,
      };
    }

    // Include conversation summary for internal tracking
    if (extractedData.conversationSummary) {
      webhookPayload.conversationSummary = {
        overview: extractedData.conversationSummary.overview || null,
        keyTakeaways: Array.isArray(extractedData.conversationSummary.keyTakeaways)
          ? extractedData.conversationSummary.keyTakeaways
          : [],
        leadTemperature: extractedData.conversationSummary.leadTemperature || "warm",
        nextSteps: extractedData.conversationSummary.nextSteps || null,
      };
    }

    // Add metadata
    webhookPayload.source = "pura_ai_chat";
    webhookPayload.timestamp = new Date().toISOString();
    webhookPayload.conversationId = conversationId || `conv-${Date.now()}`;

    console.log("Sending webhook payload to GHL:", JSON.stringify(webhookPayload, null, 2));

    // Send to GHL webhook
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!ghlResponse.ok) {
      const ghlError = await ghlResponse.text();
      console.error("GHL webhook error:", ghlResponse.status, ghlError);
      throw new Error(`GHL webhook failed: ${ghlResponse.status}`);
    }

    console.log("Successfully synced to GHL");

    return new Response(
      JSON.stringify({ success: true, message: "Successfully synced to GHL" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync to GHL error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
