/**
 * Project IO MVP - Simple Scrolling Navigation
 * Handles smooth scrolling between content pages with Instagram-like experience
 */

class SimpleScroller {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 7; // Update this when you add your 300 pages
        this.container = document.getElementById('content-container');
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollDetection();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
        this.setupMusicPlayer(); // Add music player setup
        this.updateProgress();
        
        // Hide touch hint after 5 seconds
        setTimeout(() => {
            const hint = document.getElementById('touch-hint');
            if (hint) hint.style.display = 'none';
        }, 5000);
    }
    
    setupNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.addEventListener('click', () => this.prevPage());
        nextBtn.addEventListener('click', () => this.nextPage());
        
        // Update button states
        this.updateNavigationButtons();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for navigation keys
            if (['ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
            switch(e.key) {
                case 'ArrowDown':
                case ' ': // Spacebar
                    this.nextPage();
                    break;
                case 'ArrowUp':
                    this.prevPage();
                    break;
                case 'Home':
                    this.goToPage(1);
                    break;
                case 'End':
                    this.goToPage(this.totalPages);
                    break;
            }
        });
    }
    
    setupTouchGestures() {
        let touchStartY = 0;
        let touchEndY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartY, touchEndY);
        });
    }
    
    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const swipeDistance = startY - endY;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swiped up - go to next page
                this.nextPage();
            } else {
                // Swiped down - go to previous page
                this.prevPage();
            }
        }
    }
    
    setupMusicPlayer() {
        const musicTrigger = document.getElementById('music-trigger');
        const spotifyNav = document.getElementById('spotify-nav');
        const closeSpotify = document.getElementById('close-spotify');
        
        if (!musicTrigger || !spotifyNav || !closeSpotify) {
            console.warn('Music player elements not found');
            return;
        }
        
        // Enhanced toggle function with debugging and force reflow
        const toggleMusicPlayer = (source = 'unknown') => {
            console.log(`🎵 Toggle called from: ${source}`);
            const isVisible = spotifyNav.classList.contains('spotify-nav-visible');
            console.log(`🎵 Current state: ${isVisible ? 'visible' : 'hidden'}`);
            
            if (isVisible) {
                // Hide the player
                spotifyNav.classList.remove('spotify-nav-visible');
                spotifyNav.classList.add('spotify-nav-hidden');
                console.log('🎵 Player hidden');
            } else {
                // Show the player
                spotifyNav.classList.remove('spotify-nav-hidden');
                spotifyNav.classList.add('spotify-nav-visible');
                console.log('🎵 Player shown');
            }
            
            // Force a reflow to ensure CSS changes are applied
            spotifyNav.offsetHeight;
            console.log(`🎵 Classes after toggle: ${spotifyNav.className}`);
        };
        
        // Event listeners with improved event handling
        musicTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMusicPlayer('music-trigger');
        });
        
        closeSpotify.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMusicPlayer('close-button');
        });
        
        // Add a backup event listener with mousedown for better responsiveness
        closeSpotify.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 Close button mousedown triggered');
        });
        
        // Touch events for mobile
        closeSpotify.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMusicPlayer('close-button-touch');
        });
        
        // Click outside to close (optional)
        document.addEventListener('click', (e) => {
            const isVisible = spotifyNav.classList.contains('spotify-nav-visible');
            const clickedInsidePlayer = spotifyNav.contains(e.target);
            const clickedTrigger = musicTrigger.contains(e.target);
            
            if (isVisible && !clickedInsidePlayer && !clickedTrigger) {
                toggleMusicPlayer();
            }
        });
        
        // Prevent scrolling when music player is visible
        spotifyNav.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
        
        spotifyNav.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
        
        spotifyNav.addEventListener('touchend', (e) => {
            e.stopPropagation();
        });
        
        console.log('🎵 Music player initialized!');
    }
    
    setupScrollDetection() {
        this.container.addEventListener('scroll', () => {
            // Clear existing timeout
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            // Set a timeout to detect when scrolling stops
            this.scrollTimeout = setTimeout(() => {
                this.detectCurrentPage();
            }, 150);
        });
    }
    
    detectCurrentPage() {
        const scrollTop = this.container.scrollTop;
        const pageHeight = window.innerHeight;
        const newPage = Math.round(scrollTop / pageHeight) + 1;
        
        // Ensure page is within bounds
        const clampedPage = Math.max(1, Math.min(newPage, this.totalPages));
        
        if (clampedPage !== this.currentPage) {
            this.currentPage = clampedPage;
            this.updateProgress();
            this.updateNavigationButtons();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages && !this.isScrolling) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    prevPage() {
        if (this.currentPage > 1 && !this.isScrolling) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || this.isScrolling) {
            return;
        }
        
        this.isScrolling = true;
        this.currentPage = pageNum;
        
        const targetPage = document.getElementById(`page-${pageNum}`);
        if (targetPage) {
            targetPage.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Reset scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 800);
    }
    
    updateProgress() {
        const progress = (this.currentPage / this.totalPages) * 100;
        const progressFill = document.getElementById('progress-fill');
        const pageCounter = document.getElementById('page-counter');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (pageCounter) {
            pageCounter.textContent = `${this.currentPage} / ${this.totalPages}`;
        }
        
        // Update page title
        document.title = `Project IO MVP - Page ${this.currentPage}`;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }
    
    // Method to update total pages (call this after adding content)
    setTotalPages(count) {
        this.totalPages = count;
        this.updateProgress();
        this.updateNavigationButtons();
    }
    
    // Method to get current page (useful for external scripts)
    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global scroller instance
    window.scroller = new SimpleScroller();
    
    // Add some helpful console messages
    console.log('🚀 Project IO MVP initialized!');
    console.log('📱 Use arrow keys, spacebar, or scroll to navigate');
    console.log('🔄 Current page:', window.scroller.getCurrentPage());
    console.log('🎵 Music player ready! Click the music icon to open.');
    
    // Add keyboard shortcut info
    console.log('⌨️  Keyboard shortcuts:');
    console.log('   ↓ Arrow Down / Spacebar: Next page');
    console.log('   ↑ Arrow Up: Previous page');
    console.log('   Home: Go to first page');
    console.log('   End: Go to last page');
    
    // Add music player API info
    console.log('🎵 Music Player API:');
    console.log('   ProjectIO.toggleMusicPlayer() - Toggle music player');
    console.log('   ProjectIO.showMusicPlayer() - Show music player');
    console.log('   ProjectIO.hideMusicPlayer() - Hide music player');
});

// Add some helpful utility functions to window object
window.ProjectIO = {
    goToPage: (page) => window.scroller?.goToPage(page),
    getCurrentPage: () => window.scroller?.getCurrentPage(),
    setTotalPages: (count) => window.scroller?.setTotalPages(count),
    nextPage: () => window.scroller?.nextPage(),
    prevPage: () => window.scroller?.prevPage(),
    toggleMusicPlayer: () => {
        const musicTrigger = document.getElementById('music-trigger');
        if (musicTrigger) {
            musicTrigger.click();
        }
    },
    showMusicPlayer: () => {
        const spotifyNav = document.getElementById('spotify-nav');
        if (spotifyNav && !spotifyNav.classList.contains('spotify-nav-visible')) {
            spotifyNav.classList.remove('spotify-nav-hidden');
            spotifyNav.classList.add('spotify-nav-visible');
        }
    },
    hideMusicPlayer: () => {
        const spotifyNav = document.getElementById('spotify-nav');
        if (spotifyNav && spotifyNav.classList.contains('spotify-nav-visible')) {
            spotifyNav.classList.remove('spotify-nav-visible');
            spotifyNav.classList.add('spotify-nav-hidden');
        }
    }
};

// Handle page visibility changes (pause/resume when tab becomes active/inactive)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App paused (tab not visible)');
    } else {
        console.log('📱 App resumed (tab visible)');
        // Refresh current page detection
        window.scroller?.detectCurrentPage();
    }
});