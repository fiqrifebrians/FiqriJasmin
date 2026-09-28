document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('photo-upload');
    const grid = document.getElementById('gallery-grid');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const modalCaption = document.getElementById('modal-caption');
    const loadingText = document.getElementById('upload-loading');
    const mapContainer = document.getElementById('map-container');
    const toggleMapBtn = document.getElementById('toggle-map-btn');
    
    const toggleHiddenBtn = document.getElementById('toggle-hidden-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('vault-password');
    const submitPasswordBtn = document.getElementById('submit-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const pageTitle = document.getElementById('gallery-page-title');

    let isHiddenView = false;
    const VAULT_PASSWORD = "fiqrijasmin+";

    let map = L.map('map').setView([-2.5489, 118.0149], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    let markers = [];

    toggleHiddenBtn.addEventListener('click', () => {
        if (isHiddenView) {
            isHiddenView = false;
            pageTitle.innerText = "Gallery";
            toggleHiddenBtn.innerHTML = '<i data-feather="eye-off"></i>';
            feather.replace();
            renderGalleries();
        } else {
            passwordInput.value = '';
            passwordModal.classList.add('active');
        }
    });

    submitPasswordBtn.addEventListener('click', () => {
        if (passwordInput.value === VAULT_PASSWORD) {
            passwordModal.classList.remove('active');
            isHiddenView = true;
            pageTitle.innerText = "Hidden";
            toggleHiddenBtn.innerHTML = '<i data-feather="eye"></i>';
            feather.replace();
            renderGalleries();
        } else {
            alert("Incorrect Password!");
        }
    });

    cancelPasswordBtn.addEventListener('click', () => {
        passwordModal.classList.remove('active');
    });

    toggleMapBtn.addEventListener('click', () => {
        mapContainer.classList.toggle('hidden');
        if(!mapContainer.classList.contains('hidden')) {
            setTimeout(() => { map.invalidateSize(); }, 300);
        }
    });

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

    function compressImage(file, maxWidth, quality) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
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
            
            const isVideo = file.type.startsWith('video/');
            let finalSrc = "";

            if (isVideo) {
                // PENCEGAHAN CRASH DATABASE: Batas maksimal video 10MB
                if (file.size > 10 * 1024 * 1024) {
                    alert(`Video file "${file.name}" is too large. Max 10MB allowed.`);
                    continue;
                }
                
                finalSrc = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            } else {
                // Ekstrak GPS Exif hanya untuk Foto
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
                
                finalSrc = await compressImage(file, 1200, 0.7);
            }

            window.store.addPhoto({ 
                id: Date.now() + i, 
                src: finalSrc, 
                date: photoDate, 
                location: locationName, 
                lat: lat, 
                lon: lon, 
                hidden: isHiddenView 
            });

            await new Promise(res => setTimeout(res, 500));
        }
        
        loadingText.classList.add('hidden');
        uploadInput.value = '';
    });

    function renderGalleries() {
        grid.innerHTML = '';
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        const allPhotos = window.store.state.photos || [];
        let displayPhotos = allPhotos.filter(p => !!p.hidden === isHiddenView);
        displayPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (displayPhotos.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted); padding: 1rem;">No ${isHiddenView ? 'hidden ' : ''}files uploaded yet.</p>`;
            return;
        }

        let mapBounds = [];
        displayPhotos.forEach(photo => {
            if (photo.lat && photo.lon) {
                let marker = L.marker([photo.lat, photo.lon]).addTo(map).bindPopup(`<b>${photo.location}</b>`);
                markers.push(marker);
                mapBounds.push([photo.lat, photo.lon]);
            }
            
            const isVideoFormat = photo.src.startsWith('data:video');
            const item = document.createElement('div');
            item.className = `grid-item ${isHiddenView ? 'vault-hidden' : ''}`;
            const dateStr = new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const hideIcon = isHiddenView ? "eye" : "eye-off";
            const hideTitle = isHiddenView ? "Unhide" : "Hide";
            
            const mediaTag = isVideoFormat 
                ? `<video src="${photo.src}" muted autoplay loop playsinline></video>`
                : `<img src="${photo.src}" alt="Memory">`;

            item.innerHTML = `
                <div class="photo-wrapper">
                    <div class="photo-date-badge">${dateStr}</div>
                    ${isVideoFormat ? `<div style="position:absolute; top:10px; right:10px; color:#fff; z-index:5;"><i data-feather="video" style="width:16px;height:16px;"></i></div>` : ''}
                    ${mediaTag}
                </div>
                <div class="photo-info-bar">
                    <div class="photo-location" title="${photo.location}">
                        <i data-feather="map-pin"></i> ${photo.location}
                    </div>
                    <div class="photo-actions-bottom">
                        <button class="action-btn toggle-visibility-btn" title="${hideTitle}"><i data-feather="${hideIcon}"></i></button>
                        <button class="action-btn delete-btn" title="Delete"><i data-feather="trash-2"></i></button>
                    </div>
                </div>
            `;
            
            item.querySelector('.toggle-visibility-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const confirmMsg = isHiddenView 
                    ? "Are you sure you want to unhide this file?" 
                    : "Are you sure you want to hide this file in the vault?";
                
                if (confirm(confirmMsg)) {
                    window.store.togglePhotoVisibility(photo.id, !isHiddenView);
                }
            });

            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm("Are you sure you want to permanently delete this file?")) {
                    window.store.deletePhoto(photo.id);
                }
            });

            item.querySelector('.photo-wrapper').addEventListener('click', () => {
                if (isVideoFormat) {
                    modalImg.classList.add('hidden');
                    modalVideo.classList.remove('hidden');
                    modalVideo.src = photo.src;
                } else {
                    modalVideo.classList.add('hidden');
                    modalVideo.pause();
                    modalImg.classList.remove('hidden');
                    modalImg.src = photo.src;
                }
                modalCaption.innerHTML = `<strong>${dateStr}</strong><br>Location: ${photo.location}`;
                modal.classList.add('active');
            });

            grid.appendChild(item);
        });
        
        if (mapBounds.length > 0) map.fitBounds(mapBounds);
        if(typeof feather !== 'undefined') feather.replace();
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() { 
            this.closest('.modal').classList.remove('active'); 
            if(modalVideo) modalVideo.pause();
        });
    });

    window.store.subscribe(renderGalleries);
});