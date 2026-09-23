document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-letter-btn');
    const titleInput = document.getElementById('letter-title');
    const bodyInput = document.getElementById('letter-body');

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

    sendBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        const author = document.querySelector('input[name="letter-author"]:checked').value;
        if (title && body) {
            window.store.addLetter({ id: Date.now(), date: new Date().toISOString(), title, body, author });
            titleInput.value = ''; bodyInput.value = '';
        }
    });

    function renderLetters() {
        const feed = document.getElementById('letters-feed');
        feed.innerHTML = '';
        const letters = window.store.state.letters || [];
        if (letters.length === 0) {
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
                <div style="position:absolute; top:20px; right:20px; display:flex; gap:5px;">
                    <button class="action-btn edit-btn"><i data-feather="edit-2"></i></button>
                    <button class="action-btn delete-btn"><i data-feather="trash-2"></i></button>
                </div>
            `;
            card.querySelector('.edit-btn').addEventListener('click', () => {
                window.openEditModal("Edit Letter", letter.title, letter.body, (newTitle, newBody) => {
                    if (newTitle.trim() && newBody.trim()) window.store.updateLetter(letter.id, { title: newTitle.trim(), body: newBody.trim() });
                });
            });
            card.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm("Delete this letter permanently?")) window.store.deleteLetter(letter.id);
            });
            feed.appendChild(card);
        });
        if(typeof feather !== 'undefined') feather.replace();
    }
    window.store.subscribe(renderLetters);
});