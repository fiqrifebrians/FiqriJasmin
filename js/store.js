// Ganti config dengan API key asli Anda
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
        const dateObj = new Date(dateString);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        if (!this.state.journey[dateKey]) this.state.journey[dateKey] = [];
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
    toggleWish(id) { this.state.wishes = this.state.wishes.map(w => w.id === id ? { ...w, done: !w.done } : w); this.saveToCloud(); }
    updateWish(id, data) {
        const w = this.state.wishes.find(x => x.id === id);
        if(w) { w.title = data.title; w.desc = data.desc; this.saveToCloud(); }
    }
    deleteWish(id) { this.state.wishes = this.state.wishes.filter(x => x.id !== id); this.saveToCloud(); }

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