document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year-display');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const modal = document.getElementById('activity-modal');
    const activityDate = document.getElementById('activity-date');
    const activityList = document.getElementById('activity-list');
    
    let currentDate = new Date();

    function renderCalendar() {
        grid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYear.textContent = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const journeyData = window.store.state.journey || {};

        for (let i = 0; i < firstDay; i++) {
            let emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            grid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            let dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            dayDiv.textContent = i;
            
            let dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            
            if (journeyData[dateKey] && journeyData[dateKey].length > 0) {
                dayDiv.classList.add('has-event');
                dayDiv.addEventListener('click', () => {
                    activityDate.textContent = new Date(dateKey).toLocaleDateString('en-US', {weekday: 'long', day:'numeric', month:'long', year:'numeric'});
                    
                    // MENARIK DATA ASLI BERDASARKAN ID
                    activityList.innerHTML = journeyData[dateKey].map(e => {
                        let fullContent = '';
                        
                        if (e.type === 'Memory') {
                            const photo = window.store.state.photos.find(p => String(p.id) === String(e.id));
                            if (photo) fullContent = `<img src="${photo.src}" style="width:100%; border-radius:8px; margin-top:10px; max-height:250px; object-fit:cover;"><p style="font-size:0.85rem; color:var(--text-muted); margin-top:5px;"><i data-feather="map-pin" style="width:12px;height:12px;"></i> ${photo.location}</p>`;
                        } 
                        else if (e.type === 'Love Letter') {
                            const letter = window.store.state.letters.find(l => String(l.id) === String(e.id));
                            if (letter) fullContent = `<h4 style="margin-top:10px; font-size:1.1rem; color:var(--text-main);">${letter.title}</h4><p style="margin-top:5px; font-size:0.9rem; white-space:pre-wrap; line-height:1.6; color:var(--text-muted);">${letter.body}</p>`;
                        } 
                        else if (e.type === 'Dream Achieved') {
                            const wish = window.store.state.wishes.find(w => String(w.id) === String(e.id));
                            if (wish) fullContent = `<h4 style="margin-top:10px; font-size:1.1rem; color:var(--text-main);">${wish.title}</h4><p style="margin-top:5px; font-size:0.9rem; color:var(--text-muted);">${wish.desc}</p>`;
                        }
                        
                        return `
                            <div style="margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--glass-border);">
                                <span style="font-size:0.75rem; color:var(--primary-purple); text-transform:uppercase; letter-spacing:1px; border: 1px solid var(--primary-purple); padding:2px 8px; border-radius:12px;">${e.type}</span>
                                ${fullContent || `<p style="margin-top:10px; font-size:1rem;">${e.data}</p>`}
                            </div>
                        `;
                    }).join('');
                    
                    if(typeof feather !== 'undefined') feather.replace();
                    modal.classList.add('active');
                });
            }
            grid.appendChild(dayDiv);
        }
    }

    prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    window.store.subscribe(renderCalendar);
});