const API_URL = 'https://www.fuelcheck.nsw.gov.au/fuel/api/v1/fuel/refData';

async function getValidData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const refData = await response.json();
    const fuelTypes = refData.fueltypes.items.filter((item) => item.isactive).map((item) => item.code);
    const brands = refData.brands.items.filter((item) => item.isactive).map((item) => item.description);
    const result = { fuelTypes, brands };

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error.message);
    process.exit(1);
  }
}

getValidData();
