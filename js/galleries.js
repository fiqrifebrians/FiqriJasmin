document.addEventListener('DOMContentLoaded', () => {
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
                const mockLocations = ["Late Night Drive", "Our Favorite Cafe", "The Park", "Home", "City Center"];
                const photoData = {
                    id: Date.now(),
                    src: event.target.result,
                    date: new Date().toISOString(),
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
                ${photo.hidden ? '<div class="hidden-icon">👁️‍🗨️</div>' : ''}
                <div class="meta-tag">${photo.location}</div>
                <div class="photo-actions">
                    <button class="action-btn edit-btn">✏️</button>
                    <button class="action-btn delete-btn">🗑️</button>
                </div>
            `;

            // Aksi Edit & Delete
            item.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Stop trigger zoom modal
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
    }

    renderGalleries();
    window.store.subscribe(renderGalleries);
});