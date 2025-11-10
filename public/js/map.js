// Ensure mapApi and coordinates are defined
if (typeof mapApi === 'undefined' || typeof coordinates === 'undefined') {
    console.error("mapApi or coordinates are not defined. Make sure to pass the API key and coordinates correctly.");
}

// Step 1: initialize communication with the platform
const platform = new H.service.Platform({
    apikey: mapApi,
});

// Step 2: Create a Raster Tile Provider (using function getURL)
const rasterTileProvider = new H.map.provider.ImageTileProvider({
    getURL: (col, row, level) => {
        // HERE Raster Tile API v3 endpoint
        return `https://${1 + (col % 4)}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/${level}/${col}/${row}/256/png8?apiKey=${mapApi}`;
    },
    tileSize: 256,
    pixelRatio: window.devicePixelRatio || 1,
});

// Create a raster tile layer
const rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);

// Step 3: initialize the map and center it on provided coordinates
const mapContainer = document.getElementById("map");

if (mapContainer) {
    const map = new H.Map(mapContainer, rasterTileLayer, {
        zoom: 12,
        center: { lat: coordinates[1], lng: coordinates[0] }
    });

    // Step 4: enable map interactions
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Step 5: add default UI components
    const ui = H.ui.UI.createDefault(map, rasterTileLayer);

    // Step 6: resize map dynamically
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Step 7: add a custom marker
    const customIcon = new H.map.Icon('/images/marker.png', { size: { w: 40, h: 40 } });
    const marker = new H.map.Marker({ lat: coordinates[1], lng: coordinates[0] }, { icon: customIcon });
    map.addObject(marker);

    // Step 8: create info bubble
    function createInfoBubble() {
        return new H.ui.InfoBubble(
            { lat: coordinates[1], lng: coordinates[0] },
            {
                content: `<div class="popup-content"><p>Exact location provided after booking!</p></div>`,
                offset: { x: 0, y: -40 },
            }
        );
    }

    // Show popup when marker is tapped
    marker.addEventListener('tap', function () {
        ui.getBubbles().forEach(bubble => bubble.close());
        const infoBubble = createInfoBubble();
        customizeInfoBubble(infoBubble);
        ui.addBubble(infoBubble);
        setTimeout(() => customizeInfoBubble(infoBubble), 0);
    });

    // Step 9: style the InfoBubble
    function customizeInfoBubble(infoBubble) {
        const bubbleElement = infoBubble.getElement();
        if (bubbleElement) {
            bubbleElement.style.width = '250px';
            bubbleElement.style.marginTop = '-20px';
        }
    }

} else {
    console.error("Map container element not found.");
}
