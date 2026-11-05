document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('wishlist-grid');
    const openModalBtn = document.getElementById('open-add-modal');
    const modal = document.getElementById('wishlist-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const form = document.getElementById('wish-form');
    
    const completeModal = document.getElementById('complete-modal');
    const closeCompleteModalBtn = document.getElementById('close-complete-modal');
    const completeForm = document.getElementById('complete-form');
    
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    let currentWishes = [];

    window.store.subscribe((state) => {
        currentWishes = state.wishes || [];
        renderWishes();
    });

    function renderWishes() {
        const selectedCategory = categoryFilter.value;
        const sortOrder = sortSelect.value;

        // Filter kategori
        let filtered = currentWishes.filter(w => {
            if (selectedCategory === 'all') return true;
            return w.category === selectedCategory;
        });

        // Sorting berdasarkan tanggal ditambahkan (id as timestamp)
        filtered.sort((a, b) => {
            if (sortOrder === 'latest') {
                return Number(b.id) - Number(a.id);
            } else {
                return Number(a.id) - Number(b.id);
            }
        });

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No wishes found in this category yet. Add one!</p>`;
            return;
        }

        filtered.forEach(w => {
            const card = document.createElement('div');
            card.className = `wishlist-card ${w.done ? 'completed' : ''}`;
            
            const catName = w.category ? w.category.toUpperCase() : 'OTHER';
            const dateStr = new Date(Number(w.id)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            card.innerHTML = `
                <div>
                    <div class="card-top">
                        <span class="card-category">${catName}</span>
                        ${w.done ? '<span style="color: #4CAF50; font-size: 0.85rem; font-weight: 500;">✓ Achieved</span>' : ''}
                    </div>
                    <h3 class="card-title">${escapeHtml(w.title)}</h3>
                    <p class="card-desc">${escapeHtml(w.desc || 'No description provided.')}</p>
                </div>
                <div>
                    <div class="card-footer">
                        <span>By ${escapeHtml(w.author)} • ${dateStr}</span>
                        <div class="card-actions">
                            <button class="action-btn" onclick="openCompleteModal('${w.id}')" title="${w.done ? 'Mark Incomplete' : 'Mark Achieved'}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            <button class="action-btn" onclick="editWish('${w.id}')" title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn" onclick="deleteWish('${w.id}')" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    categoryFilter.addEventListener('change', renderWishes);
    sortSelect.addEventListener('change', renderWishes);

    // Modal Handler
    openModalBtn.addEventListener('click', () => {
        document.getElementById('modal-title').innerText = 'Add New Wish';
        document.getElementById('edit-wish-id').value = '';
        document.getElementById('wish-title').value = '';
        document.getElementById('wish-desc').value = '';
        document.getElementById('wish-category').value = 'date';
        document.getElementById('author-container').style.display = 'block';
        modal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    closeCompleteModalBtn.addEventListener('click', () => completeModal.classList.remove('active'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-wish-id').value;
        const title = document.getElementById('wish-title').value;
        const category = document.getElementById('wish-category').value;
        const desc = document.getElementById('wish-desc').value;
        const author = document.getElementById('wish-author').value;

        if (id) {
            window.store.updateWish(id, { title, desc, category });
        } else {
            const newWish = { id: String(Date.now()), title, category, desc, author, done: false };
            window.store.addWish(newWish);
        }
        modal.classList.remove('active');
    });

    window.openCompleteModal = function(id) {
        const w = currentWishes.find(x => String(x.id) === String(id));
        if (!w) return;
        
        if (w.done) {
            window.store.toggleWish(id); // Jika sudah selesai, klik lagi untuk membatalkan
        } else {
            document.getElementById('complete-wish-id').value = id;
            document.getElementById('completion-date').valueAsDate = new Date();
            completeModal.classList.add('active');
        }
    };

    completeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('complete-wish-id').value;
        const dateStr = document.getElementById('completion-date').value;
        window.store.toggleWish(id, dateStr);
        completeModal.classList.remove('active');
    });

    window.editWish = function(id) {
        const w = currentWishes.find(x => String(x.id) === String(id));
        if(!w) return;
        document.getElementById('modal-title').innerText = 'Edit Wish';
        document.getElementById('edit-wish-id').value = w.id;
        document.getElementById('wish-title').value = w.title;
        document.getElementById('wish-category').value = w.category || 'date';
        document.getElementById('wish-desc').value = w.desc || '';
        document.getElementById('author-container').style.display = 'none';
        modal.classList.add('active');
    };

    window.deleteWish = function(id) {
        if(confirm('Are you sure you want to delete this wish?')) {
            window.store.deleteWish(id);
        }
    };

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});