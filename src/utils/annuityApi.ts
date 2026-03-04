// src/utils/annuityApi.ts
const API_KEY = import.meta.env.VITE_ANNUITY_RATE_WATCH_API_KEY;
const BASE_URL = 'https://api.annuityratewatch.com/rest';

// Cache to prevent spamming the API on every message
let mygaCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

export interface MygaRate {
    company: string;
    product: string;
    rating: string;
    years: number;
    rate: number;
}

export async function getTopMygaRates(): Promise<MygaRate[]> {
    if (!API_KEY) {
        console.warn("Annuity Rate Watch API key is missing. Falling back to default rates.");
        return getDefaultRates();
    }

    // Return cached rates if valid
    if (mygaCache && (Date.now() - lastFetchTime < CACHE_DURATION_MS)) {
        return mygaCache;
    }

    try {
        const response = await fetch(`${BASE_URL}/rates/v4/myga`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Annuity API Error: ${response.status}`);
            return getDefaultRates();
        }

        const data = await response.json();

        if (!data?.data?.MYGAs || !Array.isArray(data.data.MYGAs)) {
            return getDefaultRates();
        }

        // Process and sort rates
        const extractedRates: MygaRate[] = [];

        data.data.MYGAs.forEach((item: any) => {
            if (item.rates && Array.isArray(item.rates) && item.rates.length > 0) {
                const rateObj = item.rates[0];
                if (rateObj.fixedRate && rateObj.rateGuaranteedYears) {
                    // Only include highly rated carriers (A- or better typically, but for simplicity we take all and sort)
                    extractedRates.push({
                        company: item.companyName,
                        product: item.annuityName,
                        rating: item.bestRating || "N/A",
                        years: rateObj.rateGuaranteedYears,
                        rate: rateObj.fixedRate
                    });
                }
            }
        });

        // Sort by highest rate first
        extractedRates.sort((a, b) => b.rate - a.rate);

        // Filter to find the absolute best rates for 3, 5, and 7 years
        const top3 = extractedRates.find(r => r.years === 3);
        const top5 = extractedRates.find(r => r.years === 5);
        const top7 = extractedRates.find(r => r.years === 7);

        const bestRates = [];
        if (top3) bestRates.push(top3);
        if (top5) bestRates.push(top5);
        if (top7) bestRates.push(top7);

        // Cache the parsed best rates
        mygaCache = bestRates.length > 0 ? bestRates : getDefaultRates();
        lastFetchTime = Date.now();

        return mygaCache;

    } catch (error) {
        console.error("Failed to fetch from Annuity API:", error);
        return getDefaultRates();
    }
}

function getDefaultRates(): MygaRate[] {
    return [
        { company: "Standard Carrier", product: "3-Year MYGA", rating: "A", years: 3, rate: 5.15 },
        { company: "Standard Carrier", product: "5-Year MYGA", rating: "A", years: 5, rate: 5.45 },
        { company: "Standard Carrier", product: "7-Year MYGA", rating: "A", years: 7, rate: 5.50 }
    ];
}
