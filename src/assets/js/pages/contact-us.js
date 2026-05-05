/**
 * 
 *  Basic 
 */

const basicMapVar = document.getElementById('contact-us');
if (basicMapVar) {
  const basicMap = L.map('contact-us').setView([42.35, -71.08], 10);
  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(basicMap);
}








