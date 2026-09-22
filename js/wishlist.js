document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-wish-btn');
    const titleInput = document.getElementById('wish-title');
    const descInput = document.getElementById('wish-desc');
    const catInput = document.getElementById('wish-category');
    const container = document.getElementById('wishlist-container');

    addBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const desc = descInput.value.trim();
        const cat = catInput.value;
        const author = document.querySelector('input[name="wish-author"]:checked').value;

        if (title) {
            window.store.addWish({ 
                id: Date.now(), 
                title, 
                desc, 
                cat, 
                author,
                done: false 
            });
            titleInput.value = '';
            descInput.value = '';
        }
    });

    function renderWishlist() {
        container.innerHTML = '';
        const wishes = window.store.state.wishes;

        if (wishes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No dreams added yet. What do you want to achieve together?</p>';
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
                </div>
                <input type="checkbox" class="wish-checkbox" ${wish.done ? 'checked' : ''} title="Mark as completed">
            `;
            
            const checkbox = item.querySelector('.wish-checkbox');
            checkbox.addEventListener('change', () => {
                window.store.toggleWish(wish.id);
            });

            container.appendChild(item);
        });
    }

    renderWishlist();
    window.store.subscribe(() => {
        renderWishlist();
    });
});