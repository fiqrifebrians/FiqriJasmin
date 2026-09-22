// journey.js - Horizontal Calendar Log Logic
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('horizontal-calendar');
    
    function renderJourney() {
        container.innerHTML = '';
        
        // Start Date: December 13, 2023
        const startDate = new Date('2023-12-13T00:00:00');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 14; // Include 2 weeks ahead

        for (let i = 0; i <= diffDays; i++) {
            let d = new Date(startDate);
            d.setDate(d.getDate() + i);
            
            // Format YYYY-MM-DD
            const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            
            const node = document.createElement('div');
            const attachments = window.store.state.journey[dateKey];
            
            node.className = `date-node ${attachments ? 'has-data' : ''}`;
            node.innerHTML = `
                <div class="month">${d.toLocaleString('default', { month: 'short' })}</div>
                <div class="day">${d.getDate()}</div>
                <div class="month">${d.getFullYear()}</div>
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
                        <h3 style="color: var(--neon-violet); margin-bottom: 20px; font-weight: 300; font-size: 1.5rem;">
                            ${d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        ${html}
                    `;
                    document.getElementById('journey-modal').classList.add('active');
                });
            }
            container.appendChild(node);
        }
        
        // Scroll to the end (today) automatically
        setTimeout(() => {
            container.scrollLeft = container.scrollWidth;
        }, 100);
    }

    renderJourney();
    window.store.subscribe(() => {
        renderJourney();
    });
});