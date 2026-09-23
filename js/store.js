// Ganti config dengan API key asli Firebase Anda
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class AppStore {
    constructor() {
        this.state = { photos: [], wishes: [], letters: [], journey: {} };
        this.listeners = [];
        
        db.ref('sanctuary_data').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData) {
                this.state = {
                    photos: cloudData.photos || [],
                    wishes: cloudData.wishes || [],
                    letters: cloudData.letters || [],
                    journey: cloudData.journey || {}
                };
                this.notify();
            }
        });
    }

    subscribe(listener) { this.listeners.push(listener); }
    notify() { this.listeners.forEach(listener => listener(this.state)); }
    saveToCloud() { db.ref('sanctuary_data').set(this.state); }

    // -- JOURNEY HUB --
    linkToJourney(dateString, attachment) {
        if (!dateString) return;
        const dateObj = new Date(dateString);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        if (!this.state.journey[dateKey]) this.state.journey[dateKey] = [];
        
        // Hapus duplikat ID jika ada (mencegah double entry)
        this.state.journey[dateKey] = this.state.journey[dateKey].filter(item => item.id !== attachment.id);
        this.state.journey[dateKey].push(attachment);
    }
    
    removeFromJourney(dateString, id) {
        if(!dateString) return;
        const dateObj = new Date(dateString);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        if (this.state.journey[dateKey]) {
            this.state.journey[dateKey] = this.state.journey[dateKey].filter(item => item.id !== id);
            if (this.state.journey[dateKey].length === 0) delete this.state.journey[dateKey];
        }
    }
    
    updateJourney(dateString, id, newData) {
        if(!dateString) return;
        const dateObj = new Date(dateString);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        if (this.state.journey[dateKey]) {
            let entry = this.state.journey[dateKey].find(e => e.id === id);
            if (entry) entry.data = newData;
        }
    }

    // -- PHOTOS --
    addPhoto(photoData) {
        this.state.photos.unshift(photoData);
        this.linkToJourney(photoData.date, { id: photoData.id, type: 'Memory Added', data: photoData.location });
        this.saveToCloud();
    }
    updatePhoto(id, newLoc) {
        const p = this.state.photos.find(x => x.id === id);
        if(p) { p.location = newLoc; this.updateJourney(p.date, id, newLoc); this.saveToCloud(); }
    }
    deletePhoto(id) {
        const p = this.state.photos.find(x => x.id === id);
        if(p) { this.removeFromJourney(p.date, id); this.state.photos = this.state.photos.filter(x => x.id !== id); this.saveToCloud(); }
    }

    // -- WISHES --
    addWish(wish) { this.state.wishes.unshift(wish); this.saveToCloud(); }
    
    // Toggle wish logic baru mencakup tanggal tercapai
    toggleWish(id, completionDateStr = null) {
        const w = this.state.wishes.find(x => x.id === id);
        if(!w) return;

        if (!w.done && completionDateStr) {
            // Mencapai wishlist
            w.done = true;
            w.completedAt = completionDateStr;
            this.linkToJourney(completionDateStr, { id: w.id, type: 'Wish Achieved', data: w.title });
        } else if (w.done) {
            // Membatalkan capaian wishlist
            if (w.completedAt) this.removeFromJourney(w.completedAt, w.id);
            w.done = false;
            w.completedAt = null;
        }
        this.saveToCloud();
    }
    
    updateWish(id, data) {
        const w = this.state.wishes.find(x => x.id === id);
        if(w) { 
            w.title = data.title; w.desc = data.desc; 
            if (w.done && w.completedAt) this.updateJourney(w.completedAt, id, data.title);
            this.saveToCloud(); 
        }
    }
    deleteWish(id) {
        const w = this.state.wishes.find(x => x.id === id);
        if(w && w.done && w.completedAt) this.removeFromJourney(w.completedAt, id);
        this.state.wishes = this.state.wishes.filter(x => x.id !== id); 
        this.saveToCloud(); 
    }

    // -- LETTERS --
    addLetter(letter) {
        this.state.letters.unshift(letter);
        this.linkToJourney(letter.date, { id: letter.id, type: 'Love Letter', data: letter.title });
        this.saveToCloud();
    }
    updateLetter(id, data) {
        const l = this.state.letters.find(x => x.id === id);
        if(l) { l.title = data.title; l.body = data.body; this.updateJourney(l.date, id, data.title); this.saveToCloud(); }
    }
    deleteLetter(id) {
        const l = this.state.letters.find(x => x.id === id);
        if(l) { this.removeFromJourney(l.date, id); this.state.letters = this.state.letters.filter(x => x.id !== id); this.saveToCloud(); }
    }
}

window.store = new AppStore();