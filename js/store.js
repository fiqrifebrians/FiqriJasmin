// ==========================================
// TEMA & DEKORASI GLOBAL (Dijalankan Pertama)
// ==========================================
(function() {
    const savedTheme = localStorage.getItem('app-theme') || 'twilight';
    document.body.className = `theme-${savedTheme}`;

    const themeImages = {
        cony: ['assets/cony-1.png', 'assets/cony-2.png', 'assets/cony-3.png', 'assets/cony-brown-1.png', 'assets/cony-brown-2.png'],
        brown: ['assets/brown-1.png', 'assets/brown-2.png', 'assets/brown-3.png', 'assets/cony-brown-1.png', 'assets/cony-brown-2.png'],
        twilight: ['assets/twilight-1.png', 'assets/twilight-2.png', 'assets/twilight-3.png', 'assets/twilight-4.png']
    };

    function renderDecorations() {
        // Hapus dekorasi lama jika mengganti tema
        document.querySelectorAll('.theme-decor').forEach(el => el.remove());
        const currentTheme = localStorage.getItem('app-theme') || 'twilight';
        const images = themeImages[currentTheme];
        
        images.forEach((src, idx) => {
            let img = document.createElement('img');
            img.src = src;
            img.className = 'theme-decor';
            
            // Distribusikan posisi agar tidak menumpuk dan di pinggiran layar (tidak memblokir tombol tengah)
            if(idx % 4 === 0) { img.style.top = '10%'; img.style.left = '5%'; }
            else if(idx % 4 === 1) { img.style.top = '15%'; img.style.right = '5%'; }
            else if(idx % 4 === 2) { img.style.bottom = '10%'; img.style.left = '10%'; }
            else { img.style.bottom = '15%'; img.style.right = '10%'; }
            
            // Randomize sedikit jarak ekstra dan animasi delay
            img.style.marginTop = (Math.random() * 40) + 'px';
            img.style.marginLeft = (Math.random() * 40) + 'px';
            img.style.animationDelay = (idx * 0.7) + 's';
            
            document.body.appendChild(img);
        });
    }

    // Fungsi global untuk di-trigger dari tombol tema index.html
    window.setTheme = function(themeName) {
        localStorage.setItem('app-theme', themeName);
        document.body.className = `theme-${themeName}`;
        renderDecorations();
    };

    document.addEventListener('DOMContentLoaded', renderDecorations);
})();

// ==========================================
// KONFIGURASI FIREBASE & SINKRONISASI DATA
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

    addWish(wish) { this.state.wishes.unshift(wish); this.saveToCloud(); }
    
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

// Interceptor Global Page Transition Exit (Slight delay for exit animation)
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target && !target.startsWith('http') && !target.startsWith('#')) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = target;
                }, 750); 
            }
        });
    });
});