// ==========================================
// TEMA & DEKORASI GLOBAL
// ==========================================
(function() {
    const savedTheme = localStorage.getItem('app-theme') || 'twilight';
    document.body.className = `theme-${savedTheme}`;

    const themeImages = {
        cony: ['assets/cony-1.png', 'assets/cony-2.png', 'assets/cony-3.png', 'assets/cony-brown-1.png', 'assets/cony-brown-2.png'],
        brown: ['assets/brown-1.png', 'assets/brown-2.png', 'assets/brown-3.png', 'assets/cony-brown-1.png', 'assets/cony-brown-2.png'],
        twilight: ['assets/twilight-1.png', 'assets/twilight-2.png', 'assets/twilight-3.png', 'assets/twilight-4.png']
    };

    const themeIcons = {
        cony: 'assets/cony-icon.png',
        brown: 'assets/brown-icon.png',
        twilight: 'assets/twilight-icon.png'
    };

    function updateFavicon(theme) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = themeIcons[theme];
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderDecorations() {
        document.querySelectorAll('.theme-decor').forEach(el => el.remove());
        const currentTheme = localStorage.getItem('app-theme') || 'twilight';
        let images = themeImages[currentTheme];
        
        if (images.length > 4) images = shuffleArray(images).slice(0, 4);
        updateFavicon(currentTheme);
        
        images.forEach((src, idx) => {
            let img = document.createElement('img');
            img.src = src;
            img.className = 'theme-decor';
            
            if(idx === 0) { img.style.top = '10%'; img.style.left = '5%'; }
            else if(idx === 1) { img.style.top = '15%'; img.style.right = '5%'; }
            else if(idx === 2) { img.style.bottom = '10%'; img.style.left = '10%'; }
            else if(idx === 3) { img.style.bottom = '15%'; img.style.right = '10%'; }
            
            img.style.marginTop = (Math.random() * 40) + 'px';
            img.style.marginLeft = (Math.random() * 40) + 'px';
            img.style.animationDelay = (idx * 0.7) + 's';
            
            document.body.appendChild(img);
        });
    }

    window.setTheme = function(themeName) {
        localStorage.setItem('app-theme', themeName);
        document.body.className = `theme-${themeName}`;
        renderDecorations();
    };

    document.addEventListener('DOMContentLoaded', renderDecorations);
})();

// ==========================================
// KONFIGURASI FIREBASE & SINKRONISASI
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCtaAAhSd605dOM_2gX14WyIz2xC0lo1TQ",
  authDomain: "fiqrijasmin.firebaseapp.com",
  databaseURL: "https://fiqrijasmin-default-rtdb.firebaseio.com",
  projectId: "fiqrijasmin",
  storageBucket: "fiqrijasmin.firebasestorage.app",
  messagingSenderId: "596021282856",
  appId: "1:596021282856:web:2b1a38cb7dadc32d074d1d",
  measurementId: "G-D5181Q5JFM"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class AppStore {
    constructor() {
        this.state = { photos: [], wishes: [], letters: [], journey: {} };
        this.listeners = [];
        this.isLoaded = false;
        
        db.ref('sanctuary_data').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData) {
                this.state = {
                    photos: cloudData.photos || [],
                    wishes: cloudData.wishes || [],
                    letters: cloudData.letters || [],
                    journey: cloudData.journey || {}
                };
            }
            this.isLoaded = true;
            this.notify();
        }, (error) => {
            console.error("Firebase Read Error: ", error);
        });
    }

    // --- FITUR PENGIRIMAN EMAIL OTOMATIS (VIA EMAILJS) ---
    async sendNotification(author, type, title) {
        const toEmail = author === 'Fiqri' ? 'jasmina.azzahra.e@gmail.com' : 'febriansfiqri@gmail.com';
        const toName = author === 'Fiqri' ? 'Jasmin' : 'Fiqri';
        const fromName = author === 'Fiqri' ? 'Fiqri' : 'Jasmin';
        
        const romanticMsg = `My dearest ${toName}, I just added a new ${type.toLowerCase()} titled "${title}" to our sanctuary. Every little thing we share reminds me of how deeply I love you. I can't wait to build our future together. Forever yours, ${fromName} 🤍`;
        const subject = `${fromName} just added a new ${type.toLowerCase()} 💌`;

        // Anda harus mendaftar di emailjs.com dan mengganti string "YOUR_..." di bawah ini.
        const data = {
            service_id: 'service_620oyuh', 
            template_id: 'template_uj31rl8', 
            user_id: '6sl34tm18kTkVSl6H',
            template_params: {
                to_email: toEmail,
                to_name: toName,
                from_name: fromName,
                item_type: type,
                item_title: title,
                message: romanticMsg,
                subject: subject
            }
        };

        try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("Email sent successfully!");
        } catch (err) {
            console.error('Failed to send notification', err);
        }
    }

    subscribe(listener) { 
        this.listeners.push(listener); 
        if (this.isLoaded) listener(this.state);
    }
    
    notify() { this.listeners.forEach(listener => listener(this.state)); }
    saveToCloud() { db.ref('sanctuary_data').set(this.state); }

    _getDateKey(dateString) {
        if (!dateString) return null;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    linkToJourney(dateString, attachment) {
        const dateKey = this._getDateKey(dateString);
        if (!dateKey) return;
        if (!this.state.journey[dateKey]) this.state.journey[dateKey] = [];
        this.state.journey[dateKey] = this.state.journey[dateKey].filter(item => String(item.id) !== String(attachment.id));
        this.state.journey[dateKey].push(attachment);
    }
    
    removeFromJourney(dateString, id) {
        const dateKey = this._getDateKey(dateString);
        if (!dateKey) return;
        if (this.state.journey[dateKey]) {
            this.state.journey[dateKey] = this.state.journey[dateKey].filter(item => String(item.id) !== String(id));
            if (this.state.journey[dateKey].length === 0) delete this.state.journey[dateKey];
        }
    }

    updateJourney(dateString, id, newData) {
        const dateKey = this._getDateKey(dateString);
        if (!dateKey) return;
        if (this.state.journey[dateKey]) {
            let entry = this.state.journey[dateKey].find(e => String(e.id) === String(id));
            if (entry) entry.data = newData;
        }
    }

    addPhoto(photoData) {
        this.state.photos.unshift(photoData);
        if (!photoData.hidden) {
            this.linkToJourney(photoData.date, { id: photoData.id, type: 'Memory', data: photoData.location });
        }
        this.saveToCloud();
    }

    deletePhoto(id) {
        const p = this.state.photos.find(x => String(x.id) === String(id));
        if(p) { 
            this.removeFromJourney(p.date, id); 
            this.state.photos = this.state.photos.filter(x => String(x.id) !== String(id)); 
            this.saveToCloud(); 
        }
    }

    togglePhotoVisibility(id, isHidden) {
        const p = this.state.photos.find(x => String(x.id) === String(id));
        if(p) { 
            p.hidden = isHidden;
            if (isHidden) this.removeFromJourney(p.date, id);
            else this.linkToJourney(p.date, { id: p.id, type: 'Memory', data: p.location });
            this.saveToCloud(); 
        }
    }

    addWish(wish) { 
        this.state.wishes.unshift(wish); 
        this.saveToCloud(); 
        this.sendNotification(wish.author, 'Wishlist', wish.title); // Trigger Email
    }
    
    toggleWish(id, completionDateStr = null) {
        const w = this.state.wishes.find(x => String(x.id) === String(id));
        if(!w) return;
        if (!w.done && completionDateStr) {
            w.done = true; w.completedAt = completionDateStr;
            this.linkToJourney(completionDateStr, { id: w.id, type: 'Dream Achieved', data: w.title });
        } else if (w.done) {
            if (w.completedAt) this.removeFromJourney(w.completedAt, w.id);
            w.done = false; w.completedAt = null;
        }
        this.saveToCloud();
    }
    
    updateWish(id, data) {
        const w = this.state.wishes.find(x => String(x.id) === String(id));
        if(w) { 
            w.title = data.title; w.desc = data.desc; 
            if (w.done && w.completedAt) this.updateJourney(w.completedAt, id, data.title); 
            this.saveToCloud(); 
        }
    }
    
    deleteWish(id) {
        const w = this.state.wishes.find(x => String(x.id) === String(id));
        if(w && w.done && w.completedAt) this.removeFromJourney(w.completedAt, id);
        this.state.wishes = this.state.wishes.filter(x => String(x.id) !== String(id)); 
        this.saveToCloud(); 
    }

    addLetter(letter) {
        this.state.letters.unshift(letter);
        this.linkToJourney(letter.date, { id: letter.id, type: 'Love Letter', data: letter.title });
        this.saveToCloud();
        this.sendNotification(letter.author, 'Love Letter', letter.title); // Trigger Email
    }
    
    updateLetter(id, data) {
        const l = this.state.letters.find(x => String(x.id) === String(id));
        if(l) { 
            l.title = data.title; l.body = data.body; 
            this.updateJourney(l.date, id, data.title); 
            this.saveToCloud(); 
        }
    }
    
    deleteLetter(id) {
        const l = this.state.letters.find(x => String(x.id) === String(id));
        if(l) { 
            this.removeFromJourney(l.date, id); 
            this.state.letters = this.state.letters.filter(x => String(x.id) !== String(id)); 
            this.saveToCloud(); 
        }
    }
}
window.store = new AppStore();

// Page Transition Interceptor
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target && !target.startsWith('http') && !target.startsWith('#')) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => { window.location.href = target; }, 750); 
            }
        });
    });
});