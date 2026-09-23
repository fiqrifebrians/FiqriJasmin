// Ganti nilai-nilai ini dengan kunci asli dari Firebase Console Anda
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

// Mencegah duplikasi inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

class AppStore {
    constructor() {
        this.state = {
            photos: [],
            wishes: [],
            letters: [],
            journey: {}
        };
        this.listeners = [];
        
        // Listener Real-Time dari Cloud Database
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

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Fungsi untuk mendorong pembaruan data ke server Firebase
    saveToCloud() {
        db.ref('sanctuary_data').set(this.state);
    }

    // --- Actions ---
    
    addPhoto(photoData) {
        this.state.photos.unshift(photoData);
        this.linkToJourney(photoData.date, { type: 'Memory Added', data: photoData.location });
        this.saveToCloud();
    }

    togglePhotoVisibility(id, isHidden) {
        this.state.photos = this.state.photos.map(p => p.id === id ? { ...p, hidden: isHidden } : p);
        this.saveToCloud();
    }

    addWish(wish) {
        this.state.wishes.unshift(wish);
        this.saveToCloud();
    }

    toggleWish(id) {
        this.state.wishes = this.state.wishes.map(w => w.id === id ? { ...w, done: !w.done } : w);
        this.saveToCloud();
    }

    addLetter(letter) {
        this.state.letters.unshift(letter);
        this.linkToJourney(letter.date, { type: 'Love Letter Received', data: letter.title });
        this.saveToCloud();
    }

    linkToJourney(dateString, attachment) {
        const dateObj = new Date(dateString);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        
        if (!this.state.journey[dateKey]) {
            this.state.journey[dateKey] = [];
        }
        
        this.state.journey[dateKey].push(attachment);
        this.saveToCloud(); 
    }
}

// Inisialisasi store global
window.store = new AppStore();