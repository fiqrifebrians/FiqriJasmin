// galleries.js - iOS-Style Photo Vault & Security
document.addEventListener('DOMContentLoaded', () => {
    const vaultPassword = "fiqrijasmin+";
    const uploadInput = document.getElementById('photo-upload');
    const grid = document.getElementById('gallery-grid');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Simulate Metadata Extraction (Location/Date)
                const mockLocations = ["Late Night Drive", "Our Favorite Cafe", "The Park", "Home", "City Center"];
                const photoData = {
                    id: Date.now(),
                    src: event.target.result,
                    date: new Date().toISOString(), // In real app, extracted via EXIF JS
                    location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
                    hidden: false
                };
                window.store.addPhoto(photoData);
            };
            reader.readAsDataURL(file);
        }
    });

    function renderGalleries() {
        grid.innerHTML = '';
        const photos = window.store.state.photos;

        if (photos.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">No memories uploaded yet. Add the first one.</p>';
            return;
        }

        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = `grid-item ${photo.hidden ? 'vault-hidden' : ''}`;
            
            const dateStr = new Date(photo.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            item.innerHTML = `
                <img src="${photo.src}" alt="Memory">
                ${photo.hidden ? '<div class="hidden-icon">👁️‍🗨️</div>' : ''}
                <div class="meta-tag">${dateStr} • ${photo.location}</div>
                <div class="toggle-hide-wrapper" title="${photo.hidden ? 'Unhide' : 'Hide in Vault'}">
                    <input type="checkbox" class="toggle-hide" ${photo.hidden ? 'checked' : ''}>
                </div>
            `;

            // Prevent modal click when toggling checkbox
            const checkbox = item.querySelector('.toggle-hide');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                window.store.togglePhotoVisibility(photo.id, e.target.checked);
            });

            // Expand Image Logic with Vault Protection
            item.addEventListener('click', () => {
                if (photo.hidden) {
                    const pwd = prompt("Vault is locked. Enter password to view this hidden memory:");
                    if (pwd !== vaultPassword) {
                        alert("Incorrect password.");
                        return;
                    }
                }
                
                modalImg.src = photo.src;
                modalCaption.innerHTML = `<strong>${dateStr}</strong><br>Location: ${photo.location}`;
                modal.classList.add('active');
            });

            grid.appendChild(item);
        });
    }

    renderGalleries();
    window.store.subscribe(() => {
        renderGalleries();
    });
});