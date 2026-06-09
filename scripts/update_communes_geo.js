import fs from 'fs';

async function updateCommunesGeo() {
  const jsonPath = './src/data/communes.json';
  
  // 1. Read existing local communes data
  const localCommunes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${localCommunes.length} communes from local communes.json`);
  
  // 2. Fetch official geo data for Isère (Department 38)
  console.log("Fetching official coordinates from geo.api.gouv.fr...");
  const response = await fetch("https://geo.api.gouv.fr/departements/38/communes?fields=nom,code,codesPostaux,population,centre");
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const apiCommunes = await response.json();
  console.log(`Received ${apiCommunes.length} communes from French Gov API`);
  
  // Create a map by INSEE code for quick lookups
  const apiMap = new Map();
  apiCommunes.forEach(c => {
    if (c.centre && c.centre.coordinates) {
      apiMap.set(c.code, {
        longitude: c.centre.coordinates[0],
        latitude: c.centre.coordinates[1]
      });
    }
  });

  // 3. Map coordinates to local communes
  let matchedCount = 0;
  const updatedCommunes = localCommunes.map(c => {
    const geo = apiMap.get(c.codeInsee);
    if (geo) {
      matchedCount++;
      return {
        ...c,
        latitude: geo.latitude,
        longitude: geo.longitude
      };
    } else {
      console.warn(`Could not find coordinates for commune: ${c.nom} (INSEE: ${c.codeInsee})`);
      return c;
    }
  });

  console.log(`Successfully matched ${matchedCount}/${localCommunes.length} communes with coordinates.`);
  
  // 4. Save back to communes.json
  fs.writeFileSync(jsonPath, JSON.stringify(updatedCommunes, null, 2), 'utf8');
  console.log("Updated communes.json successfully written!");
}

updateCommunesGeo().catch(err => {
  console.error("Error updating communes geo data:", err);
  process.exit(1);
});
