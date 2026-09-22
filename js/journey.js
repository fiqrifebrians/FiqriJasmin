document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('horizontal-calendar');
    
    function renderJourney() {
        container.innerHTML = '';
        
        // Compact Strip anchored exactly to Dec 13, 2023
        const startDate = new Date('2023-12-13T00:00:00');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 7; // Only 1 week ahead for compactness

        for (let i = 0; i <= diffDays; i++) {
            let d = new Date(startDate);
            d.setDate(d.getDate() + i);
            
            const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            
            const node = document.createElement('div');
            const attachments = window.store.state.journey[dateKey];
            
            node.className = `date-node ${attachments ? 'has-data' : ''}`;
            node.innerHTML = `
                <div class="month">${d.toLocaleString('default', { month: 'short' })}</div>
                <div class="day">${d.getDate()}</div>
            `;

            if (attachments) {
                const dot = document.createElement('div');
                dot.className = 'indicator-dot';
                node.appendChild(dot);
                
                node.addEventListener('click', () => {
                    const html = attachments.map(a => `
                        <div class="journey-entry">
                            <div class="type">${a.type}</div>
                            <div class="content">${a.data}</div>
                        </div>
                    `).join('');
                    
                    document.getElementById('journey-detail').innerHTML = `
                        <h3 style="color: var(--neon-violet); margin-bottom: 25px; font-weight: 300; font-size: 1.5rem; letter-spacing: 1px;">
                            ${d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        ${html}
                    `;
                    document.getElementById('journey-modal').classList.add('active');
                });
            }
            container.appendChild(node);
        }
        
        // Auto-scroll to the right-most end to show the most recent dates
        setTimeout(() => {
            container.scrollLeft = container.scrollWidth;
        }, 150);
    }

    renderJourney();
    window.store.subscribe(() => {
        renderJourney();
    });
});