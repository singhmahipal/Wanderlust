// MapLibre GL JS implementation (no API key required)
// Note: Make sure to include MapLibre GL JS library in your HTML
// <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
// <link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet" />

// Check if listing has valid coordinates
if (listing && listing.geometry && listing.geometry.coordinates &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2 &&
    !isNaN(listing.geometry.coordinates[0]) &&
    !isNaN(listing.geometry.coordinates[1])) {

    const coordinates = listing.geometry.coordinates;

    const map = new maplibregl.Map({
        container: 'map', // container ID
        style: {
            'version': 8,
            'sources': {
                'osm': {
                    'type': 'raster',
                    'tiles': [
                        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    'tileSize': 256,
                    'attribution': '© OpenStreetMap contributors'
                }
            },
            'layers': [{
                'id': 'osm',
                'source': 'osm',
                'type': 'raster'
            }]
        },
        center: coordinates, // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl());

    // Create marker
    const marker = new maplibregl.Marker({color: "red"})
        .setLngLat(coordinates)
        .setPopup(
            new maplibregl.Popup({offset: 25})
                .setHTML(`<h4>${listing.location}</h4><p>Exact location will be shared after booking</p>`)
        )
        .addTo(map);
        
} else {
    // Fallback: Hide map container or show message
    console.log("No valid coordinates found for this listing");
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '<div class="alert alert-info">Map not available for this location</div>';
    }
}