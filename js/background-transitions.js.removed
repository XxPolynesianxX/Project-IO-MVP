/**
 * Background Transition Manager
 * Smoothly changes background images as user scrolls between pages
 */

class BackgroundTransitionManager {
    constructor() {
        this.currentBgClass = '';
        this.backgroundMappings = {
            1: 'bg-online-1', // Mountain vista
            2: 'bg-online-2', // Tranquil lake
            3: 'bg-online-3', // Forest path
            4: 'bg-online-4', // Ocean waves
            5: 'bg-online-5'  // Desert sunset
        };
        
        // Add more mappings for your 300 pages
        // You can use patterns like:
        // for (let i = 6; i <= 300; i++) {
        //     this.backgroundMappings[i] = `bg-page-${i}`;
        // }
        
        this.init();
    }
    
    init() {
        // Set initial background
        this.changeBackground(1);
        
        // Listen for page changes from the main scroller
        this.setupPageChangeListener();
    }
    
    setupPageChangeListener() {
        // Override the existing updateProgress method to include background changes
        if (window.scroller) {
            const originalUpdateProgress = window.scroller.updateProgress.bind(window.scroller);
            
            window.scroller.updateProgress = () => {
                originalUpdateProgress();
                this.changeBackground(window.scroller.currentPage);
            };
        }
        
        // Also listen for manual scroll detection
        const container = document.getElementById('content-container');
        if (container) {
            container.addEventListener('scroll', () => {
                // Throttle scroll events
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    const scrollTop = container.scrollTop;
                    const pageHeight = window.innerHeight;
                    const currentPage = Math.round(scrollTop / pageHeight) + 1;
                    this.changeBackground(currentPage);
                }, 100);
            });
        }
    }
    
    changeBackground(pageNumber) {
        const newBgClass = this.backgroundMappings[pageNumber];
        
        if (newBgClass && newBgClass !== this.currentBgClass) {
            // Remove previous background class
            if (this.currentBgClass) {
                document.body.classList.remove(this.currentBgClass);
            }
            
            // Add new background class
            document.body.classList.add(newBgClass);
            this.currentBgClass = newBgClass;
            
            // Optional: Log the change for debugging
            console.log(`🎨 Background changed to page ${pageNumber}: ${newBgClass}`);
        }
    }
    
    // Method to add custom background mappings
    addBackgroundMapping(pageNumber, backgroundClass) {
        this.backgroundMappings[pageNumber] = backgroundClass;
    }
    
    // Method to bulk add background mappings
    addBackgroundMappings(mappings) {
        Object.assign(this.backgroundMappings, mappings);
    }
    
    // Preload background images for smoother transitions
    preloadBackgrounds() {
        Object.values(this.backgroundMappings).forEach(bgClass => {
            // Extract URL from CSS class (simplified approach)
            // You might want to implement a more robust solution
            const tempDiv = document.createElement('div');
            tempDiv.className = bgClass;
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);
            
            // Force browser to load the background image
            const styles = window.getComputedStyle(tempDiv);
            const bgImage = styles.backgroundImage;
            
            if (bgImage && bgImage !== 'none') {
                const img = new Image();
                const urlMatch = bgImage.match(/url\("?([^"]*)"?\)/);
                if (urlMatch) {
                    img.src = urlMatch[1];
                }
            }
            
            document.body.removeChild(tempDiv);
        });
    }
}

// Initialize background transition manager after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the main scroller to initialize
    setTimeout(() => {
        window.backgroundManager = new BackgroundTransitionManager();
        
        // Preload backgrounds for smoother experience
        window.backgroundManager.preloadBackgrounds();
        
        console.log('🎨 Background transition manager initialized!');
    }, 100);
});

// Utility function to easily add background mappings from external scripts
window.addPageBackground = (pageNumber, backgroundClass) => {
    if (window.backgroundManager) {
        window.backgroundManager.addBackgroundMapping(pageNumber, backgroundClass);
    }
};

// Utility function to bulk add backgrounds
window.addPageBackgrounds = (mappings) => {
    if (window.backgroundManager) {
        window.backgroundManager.addBackgroundMappings(mappings);
    }
};
