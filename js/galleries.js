document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('photo-upload');
    const grid = document.getElementById('gallery-grid');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const loadingText = document.getElementById('upload-loading');
    const mapContainer = document.getElementById('map-container');
    const toggleMapBtn = document.getElementById('toggle-map-btn');

    // Restored to standard OpenStreetMap to avoid extra API requirements
    let map = L.map('map').setView([-2.5489, 118.0149], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    let markers = [];

    // Toggle Map Function
    toggleMapBtn.addEventListener('click', () => {
        mapContainer.classList.toggle('hidden');
        if(!mapContainer.classList.contains('hidden')) {
            setTimeout(() => { map.invalidateSize(); }, 300); // Fix rendering issue
        }
    });

    // Convert EXIF coordinates to decimal format
    function getDecimalGPS(data, ref) {
        if (!data) return null;
        let decimal = data[0].valueOf() + data[1].valueOf()/60 + data[2].valueOf()/3600;
        if (ref === "S" || ref === "W") decimal = decimal * -1;
        return decimal;
    }

    async function getLocationName(lat, lon) {
        try {
            let res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            let data = await res.json();
            return data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
        } catch(e) { return "Unknown Location"; }
    }

    uploadInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        loadingText.classList.remove('hidden');

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let photoDate = new Date(file.lastModified).toISOString(); 
            let locationName = "Unknown Location";
            let lat = null, lon = null;

            await new Promise((resolve) => {
                EXIF.getData(file, async function() {
                    let exifDate = EXIF.getTag(this, "DateTimeOriginal");
                    if (exifDate) {
                        let parts = exifDate.split(" ");
                        let dateParts = parts[0].split(":");
                        photoDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${parts[1]}`).toISOString();
                    }
                    lat = getDecimalGPS(EXIF.getTag(this, "GPSLatitude"), EXIF.getTag(this, "GPSLatitudeRef"));
                    lon = getDecimalGPS(EXIF.getTag(this, "GPSLongitude"), EXIF.getTag(this, "GPSLongitudeRef"));
                    if (lat && lon) locationName = await getLocationName(lat, lon);
                    resolve();
                });
            });

            let reader = new FileReader();
            reader.onload = (event) => {
                window.store.addPhoto({ 
                    id: Date.now() + i, 
                    src: event.target.result, 
                    date: photoDate, 
                    location: locationName, 
                    lat: lat, 
                    lon: lon, 
                    hidden: false 
                });
            };
            reader.readAsDataURL(file);
        }
        loadingText.classList.add('hidden');
        uploadInput.value = '';
    });

    function renderGalleries() {
        grid.innerHTML = '';
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        const photos = window.store.state.photos || [];
        
        if (photos.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No memories uploaded yet.</p>';
            return;
        }

        let mapBounds = [];
        photos.forEach(photo => {
            if (photo.lat && photo.lon) {
                let marker = L.marker([photo.lat, photo.lon]).addTo(map).bindPopup(`<b>${photo.location}</b>`);
                markers.push(marker);
                mapBounds.push([photo.lat, photo.lon]);
            }
            const item = document.createElement('div');
            item.className = `grid-item`;
            const dateStr = new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            item.innerHTML = `
                <img src="${photo.src}" alt="Memory">
                <div class="meta-tag">${photo.location}</div>
                <div class="photo-actions"><button class="action-btn delete-btn" title="Delete Photo"><i data-feather="trash-2"></i></button></div>
            `;
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm("Delete this photo permanently?")) window.store.deletePhoto(photo.id);
            });
            item.addEventListener('click', () => {
                modalImg.src = photo.src;
                modalCaption.innerHTML = `<strong>${dateStr}</strong><br>Location: ${photo.location}`;
                modal.classList.add('active');
            });
            grid.appendChild(item);
        });
        
        if (mapBounds.length > 0) map.fitBounds(mapBounds);
        if(typeof feather !== 'undefined') feather.replace();
    }

    document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    window.store.subscribe(renderGalleries);
});