document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('next-btn');
    const continueBtn = document.getElementById('continue-btn');
    const controlsContainer = document.getElementById('controls-container');

    if (!slides.length) return;

    nextBtn.addEventListener('click', () => {
        // Fade out current slide
        slides[currentSlide].style.opacity = '0';
        slides[currentSlide].style.transform = 'translate(-50%, -55%)';
        
        setTimeout(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide++;
            
            if (currentSlide >= slides.length - 1) {
                controlsContainer.classList.add('hidden');
                continueBtn.classList.remove('hidden');
            }
            
            if (currentSlide < slides.length) {
                slides[currentSlide].classList.add('active');
                // Reset styles overridden by fade out
                slides[currentSlide].style.opacity = '';
                slides[currentSlide].style.transform = '';
            }
        }, 1000); // Wait for fade out transition
    });
});