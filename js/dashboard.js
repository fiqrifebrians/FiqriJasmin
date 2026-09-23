document.addEventListener('DOMContentLoaded', () => {
    const centralMenu = document.getElementById('central-menu');
    const sections = document.querySelectorAll('.dash-section');
    const menuCards = document.querySelectorAll('.menu-card');
    const backBtn = document.getElementById('back-to-menu');

    // Routing Layout
    menuCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetId = card.dataset.target;
            centralMenu.classList.remove('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            backBtn.classList.remove('hidden');
        });
    });

    backBtn.addEventListener('click', () => {
        sections.forEach(s => s.classList.remove('active'));
        backBtn.classList.add('hidden');
        centralMenu.classList.add('active');
    });

    // Closers Modal
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Edit Modal Universal Logic
    window.openEditModal = function(title, val1, val2, callback) {
        document.getElementById('edit-modal-title').innerText = title;
        const in1 = document.getElementById('edit-input-1');
        const in2 = document.getElementById('edit-input-2');
        
        in1.value = val1;
        if (val2 !== null) {
            in2.style.display = 'block';
            in2.value = val2;
        } else {
            in2.style.display = 'none';
        }
        
        document.getElementById('edit-modal').classList.add('active');
        
        const saveBtn = document.getElementById('save-edit-btn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener('click', () => {
            callback(in1.value, in2.value);
            document.getElementById('edit-modal').classList.remove('active');
        });
    };

    // Letters Logic
    const sendBtn = document.getElementById('send-letter-btn');
    const titleInput = document.getElementById('letter-title');
    const bodyInput = document.getElementById('letter-body');

    sendBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        const author = document.querySelector('input[name="letter-author"]:checked').value;
        
        if (title && body) {
            window.store.addLetter({ 
                id: Date.now(), 
                date: new Date().toISOString(), 
                title, 
                body,
                author
            });
            titleInput.value = '';
            bodyInput.value = '';
        }
    });

    function renderLetters() {
        const feed = document.getElementById('letters-feed');
        feed.innerHTML = '';
        const letters = window.store.state.letters;

        if (!letters || letters.length === 0) {
            feed.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">The mailbox is empty.</p>';
            return;
        }

        letters.forEach(letter => {
            const card = document.createElement('div');
            card.className = 'letter-card';
            card.innerHTML = `
                <div class="letter-meta">
                    <span class="letter-date">${new Date(letter.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span class="letter-author-badge">By ${letter.author || 'Unknown'}</span>
                </div>
                <h3>${letter.title}</h3>
                <p>${letter.body.replace(/\n/g, '<br>')}</p>
                <div style="position:absolute; top:25px; right:20px; display:flex; gap:8px;">
                    <button class="action-btn edit-btn">✏️</button>
                    <button class="action-btn delete-btn">🗑️</button>
                </div>
            `;
            
            card.querySelector('.edit-btn').addEventListener('click', () => {
                window.openEditModal("Edit Letter", letter.title, letter.body, (newTitle, newBody) => {
                    if (newTitle.trim() && newBody.trim()) {
                        window.store.updateLetter(letter.id, { title: newTitle.trim(), body: newBody.trim() });
                    }
                });
            });

            card.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm("Delete this letter permanently?")) {
                    window.store.deleteLetter(letter.id);
                }
            });

            feed.appendChild(card);
        });
    }

    renderLetters();
    window.store.subscribe(renderLetters);
});