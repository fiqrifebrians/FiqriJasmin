document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('photo-upload');
    const grid = document.getElementById('gallery-grid');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const loadingText = document.getElementById('upload-loading');

    // Konversi koordinat EXIF ke desimal
    function getDecimalGPS(data, ref) {
        if (!data) return null;
        let decimal = data[0].valueOf() + data[1].valueOf()/60 + data[2].valueOf()/3600;
        if (ref === "S" || ref === "W") decimal = decimal * -1;
        return decimal;
    }

    // Fetch API Nominatim untuk nama lokasi (Geocoding)
    async function getLocationName(lat, lon) {
        try {
            let res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            let data = await res.json();
            return data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
        } catch(e) {
            return "Unknown Location";
        }
    }

    uploadInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        
        loadingText.classList.remove('hidden');

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            
            // Ekstrak EXIF
            let photoDate = new Date(file.lastModified).toISOString(); // Default fallback
            let locationName = "Unknown Location";

            await new Promise((resolve) => {
                EXIF.getData(file, async function() {
                    // Coba ambil tanggal asli difoto
                    let exifDate = EXIF.getTag(this, "DateTimeOriginal");
                    if (exifDate) {
                        // Format EXIF: "YYYY:MM:DD HH:MM:SS" -> Ubah ke format ISO
                        let parts = exifDate.split(" ");
                        let dateParts = parts[0].split(":");
                        photoDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${parts[1]}`).toISOString();
                    }

                    // Coba ambil lokasi GPS
                    let lat = getDecimalGPS(EXIF.getTag(this, "GPSLatitude"), EXIF.getTag(this, "GPSLatitudeRef"));
                    let lon = getDecimalGPS(EXIF.getTag(this, "GPSLongitude"), EXIF.getTag(this, "GPSLongitudeRef"));
                    
                    if (lat && lon) {
                        locationName = await getLocationName(lat, lon);
                    }
                    resolve();
                });
            });

            // Baca file sebagai base64 untuk disimpan (Catatan: Untuk production besar, sebaiknya Firebase Storage. Ini menggunakan Realtime DB untuk kemudahan)
            let reader = new FileReader();
            reader.onload = (event) => {
                const photoData = {
                    id: Date.now() + i, // Hindari id bentrok dalam loop
                    src: event.target.result,
                    date: photoDate,
                    location: locationName,
                    hidden: false
                };
                window.store.addPhoto(photoData);
            };
            reader.readAsDataURL(file);
        }
        
        loadingText.classList.add('hidden');
        uploadInput.value = ''; // Reset input
    });

    function renderGalleries() {
        grid.innerHTML = '';
        const photos = window.store.state.photos || [];

        if (photos.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; padding: 1rem;">No memories uploaded yet.</p>';
            return;
        }

        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = `grid-item ${photo.hidden ? 'vault-hidden' : ''}`;
            const dateStr = new Date(photo.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            item.innerHTML = `
                <img src="${photo.src}" alt="Memory">
                ${photo.hidden ? '<div class="hidden-icon"><i data-feather="eye-off"></i></div>' : ''}
                <div class="meta-tag">${photo.location}</div>
                <div class="photo-actions">
                    <button class="action-btn edit-btn" title="Edit Location"><i data-feather="edit-2"></i></button>
                    <button class="action-btn delete-btn" title="Delete Photo"><i data-feather="trash-2"></i></button>
                </div>
            `;

            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                window.openEditModal("Edit Location", photo.location, null, (newLoc) => {
                    if(newLoc.trim()) window.store.updatePhoto(photo.id, newLoc.trim());
                });
            });

            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm("Delete this photo permanently?")) {
                    window.store.deletePhoto(photo.id);
                }
            });

            item.addEventListener('click', () => {
                modalImg.src = photo.src;
                modalCaption.innerHTML = `<strong>${dateStr}</strong><br>Location: ${photo.location}`;
                modal.classList.add('active');
            });

            grid.appendChild(item);
        });

        // Initialize Feather icons
        if(typeof feather !== 'undefined') feather.replace();
    }

    renderGalleries();
    window.store.subscribe(renderGalleries);
});