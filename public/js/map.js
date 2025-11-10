// Ensure mapApi and coordinates are defined
if (typeof mapApi === 'undefined' || typeof coordinates === 'undefined') {
    console.error("mapApi or coordinates are not defined. Make sure to pass the API key and coordinates correctly.");
}

// Step 1: initialize communication with the platform
const platform = new H.service.Platform({
    apikey: mapApi,
});
const defaultLayers = platform.createDefaultLayers();

// Step 2: initialize a map - this map is centered over the provided coordinates
const mapContainer = document.getElementById("map");
if (mapContainer) {
    const map = new H.Map(
        mapContainer,
        defaultLayers.raster.normal.map,
        {
            zoom: 12,
            center: { lat: coordinates[1], lng: coordinates[0] }
        }
    );

    // Step 3: make the map interactive
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Step 4: create the default UI components
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    // Resize the map when the window is resized
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Create a custom icon for the marker similar to Google Maps red marker
    const customIcon = new H.map.Icon('../marker.png', { size: { w: 40, h: 40 } });

    // Add a marker to the map at the provided coordinates with the custom icon
    const marker = new H.map.Marker({ lat: coordinates[1], lng: coordinates[0] }, { icon: customIcon });
    map.addObject(marker);

    function createInfoBubble() {
        return new H.ui.InfoBubble({ lat: coordinates[1], lng: coordinates[0] }, {
            content: `<div class="popup-content"><p>Exact location provided after booking!</p></div>`,
            offset: { x: 0, y: -40 },
        });
    }

    // Step 6: Attach the popup to the marker
    marker.addEventListener('tap', function() {
        ui.getBubbles().forEach(bubble => bubble.close()); // Close any open bubbles
        const infoBubble = createInfoBubble();
        customizeInfoBubble(infoBubble);
        ui.addBubble(infoBubble);
        setTimeout(() => {
            customizeInfoBubble(infoBubble);
        }, 0);
    });

    function customizeInfoBubble(infoBubble) {
        const bubbleElement = infoBubble.getElement();  // Get the InfoBubble's DOM element
        if (bubbleElement) {
            // Apply custom width here
            bubbleElement.style.width = '250px';  // Set the desired width of the InfoBubble
            bubbleElement.style.height = '-100px';  // Set the desired width of the InfoBubble
        }
    }
    
} else {
    console.error("Map container element not found.");
}
