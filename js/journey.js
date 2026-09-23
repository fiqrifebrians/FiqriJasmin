// Membangun Timeline Vertikal Murni dari data yang ada
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('journey-timeline');
    
    function renderJourney() {
        container.innerHTML = '';
        const journeyData = window.store.state.journey || {};
        
        // Hanya ambil tanggal yang ada datanya, lalu urutkan dari terbaru ke terlama
        const dates = Object.keys(journeyData).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); padding-left:10px;">The journey is just beginning...</p>';
            return;
        }

        dates.forEach(dateKey => {
            const entries = journeyData[dateKey];
            if (!entries || entries.length === 0) return;

            const d = new Date(dateKey);
            const dateStr = d.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

            const node = document.createElement('div');
            node.className = 'timeline-node';
            
            const entriesHtml = entries.map(a => `
                <div class="journey-entry">
                    <div class="journey-type">${a.type}</div>
                    <div class="journey-data">${a.data}</div>
                </div>
            `).join('');

            node.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-date">${dateStr}</div>
                <div class="timeline-content">${entriesHtml}</div>
            `;
            
            container.appendChild(node);
        });
    }

    renderJourney();
    window.store.subscribe(renderJourney);
});