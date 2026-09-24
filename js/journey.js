document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendar-grid');
    const monthYearPicker = document.getElementById('month-year-picker');
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
        
        // Update input picker value (Format: YYYY-MM)
        monthYearPicker.value = `${year}-${String(month + 1).padStart(2, '0')}`;
        
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
                    
                    activityList.innerHTML = journeyData[dateKey].map(e => {
                        let fullContent = '';
                        
                        if (e.type === 'Memory') {
                            const photo = window.store.state.photos.find(p => String(p.id) === String(e.id));
                            if (photo) fullContent = `<img src="${photo.src}" alt="Memory"><p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;"><i data-feather="map-pin" style="width:12px;height:12px;"></i> ${photo.location}</p>`;
                        } 
                        else if (e.type === 'Love Letter') {
                            const letter = window.store.state.letters.find(l => String(l.id) === String(e.id));
                            if (letter) fullContent = `<h4 style="margin-top:12px; font-size:1.15rem; color:var(--text-main);">${letter.title}</h4><p style="margin-top:6px; font-size:0.95rem; white-space:pre-wrap; line-height:1.6; color:var(--text-muted);">${letter.body}</p>`;
                        } 
                        else if (e.type === 'Dream Achieved') {
                            const wish = window.store.state.wishes.find(w => String(w.id) === String(e.id));
                            if (wish) fullContent = `<h4 style="margin-top:12px; font-size:1.15rem; color:var(--text-main);">${wish.title}</h4><p style="margin-top:6px; font-size:0.95rem; color:var(--text-muted);">${wish.desc}</p>`;
                        }
                        
                        return `
                            <div class="journey-log-item">
                                <span style="font-size:0.75rem; color:var(--theme-accent); text-transform:uppercase; letter-spacing:1px; border: 1px solid var(--theme-accent); padding:3px 10px; border-radius:12px; background: var(--theme-accent-trans);">${e.type}</span>
                                ${fullContent || `<p style="margin-top:12px; font-size:1rem; color:var(--text-main);">${e.data}</p>`}
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

    // Navigasi Bulan/Tahun via panah
    prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    
    // Lompat tanggal langsung dari Picker (Dropdown)
    monthYearPicker.addEventListener('change', (e) => {
        if(e.target.value) {
            const [y, m] = e.target.value.split('-');
            currentDate.setFullYear(parseInt(y), parseInt(m) - 1, 1);
            renderCalendar();
        }
    });

    document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    window.store.subscribe(renderCalendar);
});