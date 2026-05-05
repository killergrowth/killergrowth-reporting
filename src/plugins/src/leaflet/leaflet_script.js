/**
 * 
 *  Basic 
 */


const basicMapVar = document.getElementById('basic-map');
if (basicMapVar) {
  const basicMap = L.map('basic-map').setView([42.35, -71.08], 10);
  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(basicMap);
}


/**
 * 
 *  Markers
 */

const shapeMapVar = document.getElementById('shape-map');
  if (shapeMapVar) {
    const markerMap = L.map('shape-map').setView([51.5, -0.09], 12);
    const marker = L.marker([51.5, -0.09]).addTo(markerMap);
    const circle = L.circle([51.508, -0.11], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(markerMap);
    const polygon = L.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ]).addTo(markerMap);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(markerMap);
  }

    

/**
 * 
 *  Drag and popup
 */
    
const dragMapVar = document.getElementById('drag-map');
  if (dragMapVar) {
    const draggableMap = L.map('drag-map').setView([49.817152, 2.455], 12);
    const markerLocation = L.marker([49.817152, 2.455], {
      draggable: 'true'
    }).addTo(draggableMap);
    markerLocation.bindPopup("<b>You're here!</b>").openPopup();
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(draggableMap);
  }





// GeoJson
const geoJsonVar = document.getElementById('geo-json');
if (geoJsonVar) {
  const geoJsonMap = L.map('geo-json').setView([44.2669, -72.576], 3);
  L.geoJson(statesData).addTo(geoJsonMap);
  function getColor(d) {
    return d > 1000
      ? '#800026'
      : d > 500
        ? '#BD0026'
        : d > 200
          ? '#E31A1C'
          : d > 100
            ? '#FC4E2A'
            : d > 50
              ? '#FD8D3C'
              : d > 20
                ? '#FEB24C'
                : d > 10
                  ? '#FED976'
                  : '#FFEDA0';
  }

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  L.geoJson(statesData, {
    style: style
  }).addTo(geoJsonMap);
  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(geoJsonMap);
}









// Layer Control
const layerControlVar = document.getElementById('layer-control');
  if (layerControlVar) {
    const littleton = L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
      denver = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
      aurora = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
      golden = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');
    const cities = L.layerGroup([littleton, denver, aurora, golden]);
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      }),
      osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
      });
    const layerControl = L.map('layer-control', {
      center: [39.73, -104.99],
      zoom: 10,
      layers: [osm, cities]
    });
    const baseMaps = {
      OpenStreetMap: osm,
      'OpenStreetMap.HOT': osmHOT
    };
    const overlayMaps = {
      Cities: cities
    };
    L.control.layers(baseMaps, overlayMaps).addTo(layerControl);
    L.tileLayer('https://c.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(layerControl);
  }
