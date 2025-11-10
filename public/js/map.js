// Ensure mapApi and coordinates are defined
if (typeof mapApi === 'undefined' || typeof coordinates === 'undefined') {
    console.error("mapApi or coordinates are not defined. Make sure to pass the API key and coordinates correctly.");
}

// Step 1: initialize communication with the platform
const platform = new H.service.Platform({
    apikey: mapApi,
});

// Step 2: Create Raster Tile API v3 provider (no deprecated MapTileService)
const rasterTileProvider = new H.map.provider.ImageTileProvider({
    label: 'RasterTileProvider',
    tileUrl: `https://{1-4}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey=${mapApi}`,
    subDomains: ['1', '2', '3', '4'],
    tileSize: 256,
    pixelRatio: window.devicePixelRatio || 1
});

// Create the raster tile layer
const rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);

// Step 3: initialize the map and center it on the provided coordinates
const mapContainer = document.getElementById("map");

if (mapContainer) {
    const map = new H.Map(mapContainer, rasterTileLayer, {
        zoom: 12,
        center: { lat: coordinates[1], lng: coordinates[0] }
    });

    // Step 4: make the map interactive (zoom, drag)
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Step 5: create default UI components
    const ui = H.ui.UI.createDefault(map, rasterTileLayer);

    // Resize map automatically on window resize
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Step 6: create a custom icon for the marker
    const customIcon = new H.map.Icon('/images/marker.png', { size: { w: 40, h: 40 } });

    // Add marker at the provided coordinates
    const marker = new H.map.Marker({ lat: coordinates[1], lng: coordinates[0] }, { icon: customIcon });
    map.addObject(marker);

    // Create InfoBubble (popup)
    function createInfoBubble() {
        return new H.ui.InfoBubble(
            { lat: coordinates[1], lng: coordinates[0] },
            {
                content: `<div class="popup-content"><p>Exact location provided after booking!</p></div>`,
                offset: { x: 0, y: -40 },
            }
        );
    }

    // Show popup on marker click
    marker.addEventListener('tap', function() {
        ui.getBubbles().forEach(bubble => bubble.close()); // Close existing bubbles
        const infoBubble = createInfoBubble();
        customizeInfoBubble(infoBubble);
        ui.addBubble(infoBubble);
        setTimeout(() => customizeInfoBubble(infoBubble), 0);
    });

    // Style the InfoBubble
    function customizeInfoBubble(infoBubble) {
        const bubbleElement = infoBubble.getElement();
        if (bubbleElement) {
            bubbleElement.style.width = '250px';
            // Removed invalid height; use margin or padding instead
            bubbleElement.style.marginTop = '-20px';
        }
    }
} else {
    console.error("Map container element not found.");
}
