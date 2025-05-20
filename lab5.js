const fs = require('fs');
const openCageApiKey = '40c15ded079740a29d4d9b562bbc94a9';
const geoapifyKey = 'aef46db442dd473e9f327bb434b91919';

const address = 'вулиця Хрещатик 1, Київ, Україна';

// Отримання координатів через OpenCage 
const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${openCageApiKey}`;

const results = [];

fetch(geoUrl)
  .then(response => response.json())
  .then(data => {
    if (data.results.length > 0) {
      const lat = data.results[0].geometry.lat;
      const lon = data.results[0].geometry.lng;
      console.log(`Координати для "${address}":`);
      console.log(`  Широта: ${lat}`);
      console.log(`  Довгота: ${lon}`);

      // Пошук ресторанів через Geoapify 
      const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},2000&bias=proximity:${lon},${lat}&limit=10&apiKey=${geoapifyKey}`;
      return fetch(geoapifyUrl);
    } else {
      throw new Error('Не вдалося знайти координати');
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('\nРесторани поблизу:');
    if (data.features.length === 0) {
      console.log('Нічого не знайдено.');
      return;
    }

 data.features.forEach((place, index) => {
      const name = place.properties.name || 'Без назви';
      const address = place.properties.address_line1 || 'Без адреси';
      const line = `${index + 1}. ${name} — ${address}`;
      console.log(line);
      results.push(line);
    });

    fs.writeFile('restaurants.txt', results.join('\n'), err => {
      if (err) {
        console.error('Помилка запису у файл:', err);
      } else {
        console.log('\nРезультати збережено у файл restaurants.txt');
      }
    });
  })
  .catch(error => console.error('Помилка:', error));
