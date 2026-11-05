document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('letters-grid');
    const openWriteBtn = document.getElementById('open-letter-modal');
    const writeModal = document.getElementById('write-modal');
    const closeWriteBtn = document.getElementById('close-write');
    const form = document.getElementById('letter-form');
    
    const readModal = document.getElementById('read-modal');
    const closeReadBtn = document.getElementById('close-read');
    const sortSelect = document.getElementById('sort-letters');

    let currentLetters = [];

    window.store.subscribe((state) => {
        currentLetters = state.letters || [];
        renderLetters();
    });

    function renderLetters() {
        const sortOrder = sortSelect.value;
        let sorted = [...currentLetters];

        sorted.sort((a, b) => {
            if (sortOrder === 'latest') {
                return Number(b.id) - Number(a.id);
            } else {
                return Number(a.id) - Number(b.id);
            }
        });

        grid.innerHTML = '';
        if (sorted.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No love letters found. Write one to each other!</p>`;
            return;
        }

        sorted.forEach(l => {
            const card = document.createElement('div');
            card.className = 'letter-card glass-panel';
            
            const dateFormatted = new Date(l.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            card.innerHTML = `
                <div onclick="openReadModal('${l.id}')" style="cursor: pointer; flex-grow: 1;">
                    <span class="letter-author">From ${escapeHtml(l.author)}</span>
                    <h3 class="letter-title">${escapeHtml(l.title)}</h3>
                    <p class="letter-date">${dateFormatted}</p>
                    <p class="letter-preview">${escapeHtml(l.body)}</p>
                </div>
                <div class="letter-footer">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Tap to read</span>
                    <div class="card-actions">
                        <button class="action-btn" onclick="editLetter('${l.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn" onclick="deleteLetter('${l.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    sortSelect.addEventListener('change', renderLetters);

    openWriteBtn.addEventListener('click', () => {
        document.getElementById('write-modal-title').innerText = 'Write a Love Letter';
        document.getElementById('edit-letter-id').value = '';
        document.getElementById('letter-title').value = '';
        document.getElementById('letter-body').value = '';
        document.getElementById('letter-date').valueAsDate = new Date();
        document.getElementById('letter-author-group').style.display = 'block';
        writeModal.classList.add('active');
    });

    closeWriteBtn.addEventListener('click', () => writeModal.classList.remove('active'));
    closeReadBtn.addEventListener('click', () => readModal.classList.remove('active'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-letter-id').value;
        const title = document.getElementById('letter-title').value;
        const date = document.getElementById('letter-date').value;
        const body = document.getElementById('letter-body').value;
        const author = document.getElementById('letter-author').value;

        if (id) {
            window.store.updateLetter(id, { title, body });
        } else {
            const newLetter = { id: String(Date.now()), title, date, body, author };
            window.store.addLetter(newLetter);
        }
        writeModal.classList.remove('active');
    });

    window.openReadModal = function(id) {
        const l = currentLetters.find(x => String(x.id) === String(id));
        if(!l) return;
        document.getElementById('read-author').innerText = `From ${l.author}`;
        document.getElementById('read-title').innerText = l.title;
        document.getElementById('read-date').innerText = new Date(l.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('read-body').innerText = l.body;
        readModal.classList.add('active');
    };

    window.editLetter = function(id) {
        const l = currentLetters.find(x => String(x.id) === String(id));
        if(!l) return;
        document.getElementById('write-modal-title').innerText = 'Edit Love Letter';
        document.getElementById('edit-letter-id').value = l.id;
        document.getElementById('letter-title').value = l.title;
        document.getElementById('letter-date').value = l.date;
        document.getElementById('letter-body').value = l.body;
        document.getElementById('letter-author-group').style.display = 'none';
        writeModal.classList.add('active');
    };

    window.deleteLetter = function(id) {
        if(confirm('Are you sure you want to delete this letter?')) {
            window.store.deleteLetter(id);
        }
    };

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});