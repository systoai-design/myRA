import { getTopMygaRates } from '../src/utils/annuityApi';

async function test() {
    console.log("Fetching live MYGA rates from Annuity Rate Watch...");
    const rates = await getTopMygaRates();
    console.log("\nTop Rates Extracted for MyRA:");
    rates.forEach(r => {
        console.log(`- ${r.years}-Year MYGA (${r.rating} Rated): ${r.company} - ${r.product} @ ${r.rate}%`);
    });
}

test();
