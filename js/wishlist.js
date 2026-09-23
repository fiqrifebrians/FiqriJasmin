document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-wish-btn');
    const titleInput = document.getElementById('wish-title');
    const descInput = document.getElementById('wish-desc');
    const catInput = document.getElementById('wish-category');
    const container = document.getElementById('wishlist-container');
    
    // Modal Date Elements
    const dateModal = document.getElementById('wish-date-modal');
    const dateInput = document.getElementById('wish-date-input');
    const todayBtn = document.getElementById('wish-today-btn');
    const saveDateBtn = document.getElementById('wish-save-date-btn');
    
    let activeWishId = null;

    addBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const desc = descInput.value.trim();
        const cat = catInput.value;
        const author = document.querySelector('input[name="wish-author"]:checked').value;

        if (title) {
            window.store.addWish({ id: Date.now(), title, desc, cat, author, done: false, completedAt: null });
            titleInput.value = ''; descInput.value = '';
        }
    });

    // Logika Modal Tanggal
    todayBtn.addEventListener('click', () => {
        if(activeWishId) {
            window.store.toggleWish(activeWishId, new Date().toISOString());
            dateModal.classList.remove('active');
            activeWishId = null;
        }
    });

    saveDateBtn.addEventListener('click', () => {
        if(activeWishId && dateInput.value) {
            window.store.toggleWish(activeWishId, new Date(dateInput.value).toISOString());
            dateModal.classList.remove('active');
            activeWishId = null;
        } else {
            alert("Pilih tanggal terlebih dahulu.");
        }
    });

    function renderWishlist() {
        container.innerHTML = '';
        const wishes = window.store.state.wishes || [];

        if (wishes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No dreams added yet.</p>';
            return;
        }

        wishes.forEach(wish => {
            const item = document.createElement('div');
            item.className = `wish-item ${wish.done ? 'done' : ''}`;
            
            item.innerHTML = `
                <div class="wish-content-wrap">
                    <div class="wish-header">
                        <h4>${wish.title}</h4>
                        <span class="wish-cat">${wish.cat}</span>
                        <span class="wish-author-badge">By ${wish.author || 'Unknown'}</span>
                    </div>
                    ${wish.desc ? `<p class="wish-desc">${wish.desc}</p>` : ''}
                    ${wish.done && wish.completedAt ? `<p style="font-size:0.8rem; color:var(--primary-purple); margin-top:5px;">Terwujud pada: ${new Date(wish.completedAt).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="wish-tools">
                    <button class="action-btn edit-btn"><i data-feather="edit-2"></i></button>
                    <button class="action-btn delete-btn"><i data-feather="trash-2"></i></button>
                    <input type="checkbox" class="wish-checkbox" ${wish.done ? 'checked' : ''}>
                </div>
            `;
            
            item.querySelector('.wish-checkbox').addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                if (isChecked) {
                    // Prevent checking visually immediately until date is selected
                    e.target.checked = false; 
                    activeWishId = wish.id;
                    dateInput.value = new Date().toISOString().split('T')[0]; // Default to today
                    dateModal.classList.add('active');
                } else {
                    // Batalkan capaian
                    window.store.toggleWish(wish.id);
                }
            });
            
            item.querySelector('.edit-btn').addEventListener('click', () => {
                window.openEditModal("Edit Wish", wish.title, wish.desc || "", (newTitle, newDesc) => {
                    if(newTitle.trim()) window.store.updateWish(wish.id, { title: newTitle.trim(), desc: newDesc.trim() });
                });
            });

            item.querySelector('.delete-btn').addEventListener('click', () => {
                if(confirm("Delete this dream?")) window.store.deleteWish(wish.id);
            });

            container.appendChild(item);
        });

        if(typeof feather !== 'undefined') feather.replace();
    }

    renderWishlist();
    window.store.subscribe(renderWishlist);
});