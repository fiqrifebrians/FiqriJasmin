// store.js - Simulates Real-Time Database via LocalStorage Event Broadcasting
class AppStore {
    constructor() {
        this.state = {
            photos: JSON.parse(localStorage.getItem('photos')) || [],
            wishes: JSON.parse(localStorage.getItem('wishes')) || [],
            letters: JSON.parse(localStorage.getItem('letters')) || [],
            journey: JSON.parse(localStorage.getItem('journey')) || {}
        };
        this.listeners = [];
        
        // Cross-tab real-time sync simulation
        window.addEventListener('storage', (e) => {
            if (this.state.hasOwnProperty(e.key)) {
                this.state[e.key] = JSON.parse(e.newValue);
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

    save(key, data) {
        this.state[key] = data;
        localStorage.setItem(key, JSON.stringify(data));
        this.notify();
    }

    // Actions
    addPhoto(photoData) {
        const photos = [photoData, ...this.state.photos];
        this.save('photos', photos);
        this.linkToJourney(photoData.date, { type: 'Photo Uploaded', data: photoData.location });
    }

    togglePhotoVisibility(id, isHidden) {
        const photos = this.state.photos.map(p => p.id === id ? { ...p, hidden: isHidden } : p);
        this.save('photos', photos);
    }

    addWish(wish) {
        const wishes = [wish, ...this.state.wishes];
        this.save('wishes', wishes);
    }

    toggleWish(id) {
        const wishes = this.state.wishes.map(w => w.id === id ? { ...w, done: !w.done } : w);
        this.save('wishes', wishes);
    }

    addLetter(letter) {
        const letters = [letter, ...this.state.letters];
        this.save('letters', letters);
        this.linkToJourney(letter.date, { type: 'Love Letter', data: letter.title });
    }

    linkToJourney(dateString, attachment) {
        const dateKey = new Date(dateString).toISOString().split('T')[0];
        const journey = { ...this.state.journey };
        if (!journey[dateKey]) journey[dateKey] = [];
        journey[dateKey].push(attachment);
        this.save('journey', journey);
    }
}

window.store = new AppStore();