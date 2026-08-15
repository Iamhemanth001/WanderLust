// coordinates are stored in MongoDB as [longitude, latitude]
const [lng, lat] = coordinates;

const mapContainer = document.getElementById("map");

if (!mapContainer) {
    console.error("Map container element not found.");
} else {
    // Initialize Leaflet map
    const map = L.map("map").setView([lat, lng], 12);

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 20
    }).addTo(map);

    // Custom marker
    const customIcon = L.icon({
        iconUrl: "../marker.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Add marker
    const marker = L.marker([lat, lng], {
        icon: customIcon
    }).addTo(map);

    // Popup
    marker.bindPopup(`
        <div class="popup-content">
            <p>Exact location provided after booking!</p>
        </div>
    `);

    // Open popup when marker is clicked
    marker.on("click", function () {
        marker.openPopup();
    });

    // Fix map size when window is resized
    window.addEventListener("resize", () => {
        map.invalidateSize();
    });
}