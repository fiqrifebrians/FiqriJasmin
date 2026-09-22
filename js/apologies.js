// apologies.js - Logic for the introductory slider
document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('next-btn');
    const continueBtn = document.getElementById('continue-btn');
    const dotsContainer = document.getElementById('dots-container');

    if (!slides.length) return;

    // Create progress dots
    slides.forEach((_, i) => {
        let dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });

    nextBtn.addEventListener('click', () => {
        slides[currentSlide].classList.remove('active');
        dotsContainer.children[currentSlide].classList.remove('active');
        
        currentSlide++;
        
        if (currentSlide >= slides.length - 1) {
            nextBtn.classList.add('hidden');
            continueBtn.classList.remove('hidden');
        }
        
        if (currentSlide < slides.length) {
            slides[currentSlide].classList.add('active');
            dotsContainer.children[currentSlide].classList.add('active');
        }
    });

    continueBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});