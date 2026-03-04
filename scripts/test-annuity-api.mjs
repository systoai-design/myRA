import fetch from 'node-fetch';

const API_KEY = 'BE7ECDAFCACE7EB955B3B1D3FA36BF13';
const BASE_URL = 'https://api.annuityratewatch.com/rest';

async function testEndpoint(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();

        console.log(`\n=== Sample output from ${endpoint} ===`);
        if (data.data && Array.isArray(data.data)) {
            console.log(`Total records: ${data.data.length}`);
            console.log("First item:", JSON.stringify(data.data[0], null, 2));
        } else if (Array.isArray(data)) {
            console.log(`Total records: ${data.length}`);
            console.log("First item:", JSON.stringify(data[0], null, 2));
        } else if (data.data) {
            console.log("Data object keys:", Object.keys(data.data));
            if (data.data.MYGAs) {
                console.log(`Total MYGA rates currently offered: ${data.data.Recordcount}`);
                console.log("First MYGA rate structure:", JSON.stringify(data.data.MYGAs[0], null, 2));
            } else {
                console.log("First 1000 characters:", JSON.stringify(data.data).slice(0, 1000));
            }
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testEndpoint('rates/v4/myga');
