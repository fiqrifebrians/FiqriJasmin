// app.js - Application Logic, DOM Binding, and Password Authentication
document.addEventListener('DOMContentLoaded', () => {
    
    // --- INTRO SLIDER LOGIC ---
    if (document.getElementById('slider-container')) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const nextBtn = document.getElementById('next-btn');
        const continueBtn = document.getElementById('continue-btn');
        const dotsContainer = document.querySelector('.progress-dots');

        slides.forEach((_, i) => {
            let dot = document.createElement('span');
            dot.innerHTML = '• ';
            dot.style.opacity = i === 0 ? '1' : '0.3';
            dotsContainer.appendChild(dot);
        });

        nextBtn.addEventListener('click', () => {
            slides[currentSlide].classList.remove('active');
            dotsContainer.children[currentSlide].style.opacity = '0.3';
            currentSlide++;
            
            if (currentSlide >= slides.length - 1) {
                nextBtn.classList.add('hidden');
                continueBtn.classList.remove('hidden');
            }
            if (currentSlide < slides.length) {
                slides[currentSlide].classList.add('active');
                dotsContainer.children[currentSlide].style.opacity = '1';
            }
        });
        return; // Exit if on slider page
    }

    // --- DASHBOARD LOGIC ---
    const vaultPassword = "fiqrijasmin+";
    
    // Navigation Routing
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    // Subscriptions to Store
    window.store.subscribe(() => {
        renderJourney();
        renderGalleries();
        renderWishlist();
        renderLetters();
    });

    // 1. JOURNEY CALENDAR GENERATOR
    function renderJourney() {
        const container = document.getElementById('horizontal-calendar');
        container.innerHTML = '';
        const startDate = new Date('2023-12-13');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 30; // +30 for future buffer

        for (let i = 0; i <= diffDays; i++) {
            let d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateKey = d.toISOString().split('T')[0];
            
            const node = document.createElement('div');
            node.className = 'date-node';
            node.innerHTML = `
                <div class="month">${d.toLocaleString('default', { month: 'short' })}</div>
                <div class="day">${d.getDate()}</div>
                <div class="month">${d.getFullYear()}</div>
            `;

            if (window.store.state.journey[dateKey]) {
                const dot = document.createElement('div');
                dot.className = 'indicator-dot';
                node.appendChild(dot);
                
                node.addEventListener('click', () => {
                    const attachments = window.store.state.journey[dateKey].map(a => `<p><b>${a.type}:</b> ${a.data}</p>`).join('');
                    document.getElementById('journey-detail').innerHTML = `<h3>${d.toDateString()}</h3><br>${attachments}`;
                    document.getElementById('journey-modal').classList.add('active');
                });
            }
            container.appendChild(node);
        }
    }

    // 2. GALLERY VAULT & METADATA EXTRACTION SIMULATOR
    document.getElementById('photo-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Simulate iOS Metadata Extraction
                const simLocations = ["Our Favorite Cafe", "Late Night Drive", "The Park", "Home"];
                const photoData = {
                    id: Date.now(),
                    src: event.target.result,
                    date: new Date().toISOString(),
                    location: simLocations[Math.floor(Math.random() * simLocations.length)],
                    hidden: false
                };
                window.store.addPhoto(photoData);
            };
            reader.readAsDataURL(file);
        }
    });

    function renderGalleries() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';
        window.store.state.photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = `grid-item ${photo.hidden ? 'vault-hidden' : ''}`;
            
            item.innerHTML = `
                <img src="${photo.src}" alt="Memory">
                ${photo.hidden ? '<div class="hidden-icon">👁️‍🗨️</div>' : ''}
                <div class="meta-tag">${new Date(photo.date).toLocaleDateString()} • ${photo.location}</div>
                <input type="checkbox" class="toggle-hide" ${photo.hidden ? 'checked' : ''} title="Hide in Vault">
            `;

            // Hide Toggle Logic
            item.querySelector('.toggle-hide').addEventListener('click', (e) => {
                e.stopPropagation();
                window.store.togglePhotoVisibility(photo.id, e.target.checked);
            });

            // Image Zoom / Vault Auth Logic
            item.addEventListener('click', () => {
                if (photo.hidden) {
                    const pwd = prompt("Vault is locked. Enter password to view:");
                    if (pwd !== vaultPassword) {
                        alert("Incorrect password.");
                        return;
                    }
                }
                document.getElementById('modal-img').src = photo.src;
                document.getElementById('modal-caption').innerHTML = `<p>${new Date(photo.date).toLocaleString()} <br> Location: ${photo.location}</p>`;
                document.getElementById('image-modal').classList.add('active');
            });

            grid.appendChild(item);
        });
    }

    // 3. WISHLIST
    document.getElementById('add-wish-btn').addEventListener('click', () => {
        const title = document.getElementById('wish-title').value;
        const desc = document.getElementById('wish-desc').value;
        const cat = document.getElementById('wish-category').value;
        if (title) {
            window.store.addWish({ id: Date.now(), title, desc, cat, done: false });
            document.getElementById('wish-title').value = '';
            document.getElementById('wish-desc').value = '';
        }
    });

    function renderWishlist() {
        const container = document.getElementById('wishlist-container');
        container.innerHTML = '';
        window.store.state.wishes.forEach(wish => {
            const item = document.createElement('div');
            item.className = `wish-item ${wish.done ? 'done' : ''}`;
            item.innerHTML = `
                <div class="wish-text">
                    <h4>${wish.title} <span style="font-size:0.7rem; color:var(--neon-violet);">[${wish.cat}]</span></h4>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${wish.desc}</p>
                </div>
                <input type="checkbox" ${wish.done ? 'checked' : ''}>
            `;
            item.querySelector('input').addEventListener('change', () => window.store.toggleWish(wish.id));
            container.appendChild(item);
        });
    }

    // 4. LOVE LETTERS
    document.getElementById('send-letter-btn').addEventListener('click', () => {
        const title = document.getElementById('letter-title').value;
        const body = document.getElementById('letter-body').value;
        if (title && body) {
            window.store.addLetter({ id: Date.now(), date: new Date().toISOString(), title, body });
            document.getElementById('letter-title').value = '';
            document.getElementById('letter-body').value = '';
        }
    });

    function renderLetters() {
        const feed = document.getElementById('letters-feed');
        feed.innerHTML = '';
        window.store.state.letters.forEach(letter => {
            const card = document.createElement('div');
            card.className = 'letter-card glass-panel';
            card.innerHTML = `
                <div class="letter-date">${new Date(letter.date).toLocaleString()}</div>
                <h3>${letter.title}</h3>
                <p style="margin-top: 1rem; line-height: 1.6;">${letter.body.replace(/\n/g, '<br>')}</p>
            `;
            feed.appendChild(card);
        });
    }

    // Global Modal Closers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.classList.remove('active');
        });
    });

    // Initial Render
    renderJourney();
    renderGalleries();
    renderWishlist();
    renderLetters();
});