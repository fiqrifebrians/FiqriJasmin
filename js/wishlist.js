document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-wish-btn');
    const titleInput = document.getElementById('wish-title');
    const descInput = document.getElementById('wish-desc');
    const catInput = document.getElementById('wish-category');
    const container = document.getElementById('wishlist-container');
    
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
        } else alert("Please select a date first.");
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', function() { this.closest('.modal').classList.remove('active'); }));

    window.openEditModal = function(title, val1, val2, callback) {
        document.getElementById('edit-modal-title').innerText = title;
        const in1 = document.getElementById('edit-input-1');
        const in2 = document.getElementById('edit-input-2');
        in1.value = val1; in2.value = val2;
        document.getElementById('edit-modal').classList.add('active');
        const saveBtn = document.getElementById('save-edit-btn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', () => {
            callback(in1.value, in2.value);
            document.getElementById('edit-modal').classList.remove('active');
        });
    };

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
                <div class="wish-header-wrap">
                    <div class="wish-info">
                        <div class="wish-title-row">
                            <h4>${wish.title}</h4>
                            <span class="wish-cat">${wish.cat}</span>
                            <span class="wish-author-badge">By ${wish.author || 'Unknown'}</span>
                        </div>
                        ${wish.desc ? `<p class="wish-desc">${wish.desc}</p>` : ''}
                        ${wish.done && wish.completedAt ? `<p style="font-size:0.8rem; color:var(--theme-accent); margin-top:5px;">Achieved on: ${new Date(wish.completedAt).toLocaleDateString('en-US')}</p>` : ''}
                    </div>
                </div>
                <div class="wish-tools">
                    <button class="action-btn edit-btn"><i data-feather="edit-2"></i></button>
                    <button class="action-btn delete-btn"><i data-feather="trash-2"></i></button>
                    <input type="checkbox" class="wish-checkbox" ${wish.done ? 'checked' : ''}>
                </div>
            `;
            item.querySelector('.wish-checkbox').addEventListener('change', (e) => {
                if (e.target.checked) {
                    e.target.checked = false; 
                    activeWishId = wish.id;
                    dateInput.value = new Date().toISOString().split('T')[0];
                    dateModal.classList.add('active');
                } else window.store.toggleWish(wish.id); 
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
    window.store.subscribe(renderWishlist);
});