document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Central Menu & Workspace Routing
    const centralMenu = document.getElementById('central-menu');
    const dashboardContainer = document.getElementById('dashboard-container');
    const sections = document.querySelectorAll('.dash-section');
    const menuCards = document.querySelectorAll('.menu-card');
    const backBtn = document.getElementById('back-to-menu');

    menuCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetId = card.dataset.target;
            
            // Hide Menu, Show Workspace
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

    // 2. Global Modal Closers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // 3. Floating Decorative Photos Logic
    const decorContainer = document.getElementById('floating-decorations');
    const placeholderImages = [
        'https://images.unsplash.com/photo-1518199268839-496c462dcb01?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1611077544760-4969246f481c?auto=format&fit=crop&w=300&q=80'
    ];

    for (let i = 0; i < 8; i++) {
        let img = document.createElement('img');
        img.src = placeholderImages[i % placeholderImages.length];
        img.className = 'floating-photo';
        img.style.left = `${Math.random() * 90}vw`;
        img.style.top = `${Math.random() * 90}vh`;
        img.style.animationDuration = `${Math.random() * 15 + 20}s`;
        img.style.animationDelay = `${Math.random() * 5}s`;
        decorContainer.appendChild(img);
    }

    // 4. Love Letters Logic with Author Attribution
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

        if (letters.length === 0) {
            feed.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">The mailbox is empty. Drop the first letter...</p>';
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
            `;
            feed.appendChild(card);
        });
    }

    renderLetters();
    window.store.subscribe(() => {
        renderLetters();
    });
});