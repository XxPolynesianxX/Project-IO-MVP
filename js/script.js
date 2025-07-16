/**
 * Project IO MVP - Simple Scrolling Navigation
 * Handles smooth scrolling between content pages with Instagram-like experience
 */

class SimpleScroller {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 4; // Update this when you add your 300 pages
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

/**
 * Music Control Functionality
 */
class MusicController {
    constructor() {
        this.isPlaying = false;
        this.audio = null;
        this.musicBtn = null;
        this.init();
    }
    
    init() {
        this.audio = document.getElementById('background-music');
        this.musicBtn = document.getElementById('music-btn');
        
        if (this.musicBtn && this.audio) {
            this.musicBtn.addEventListener('click', () => this.toggleMusic());
            
            // Handle audio events
            this.audio.addEventListener('ended', () => this.onAudioEnded());
            this.audio.addEventListener('error', (e) => this.onAudioError(e));
            
            console.log('🎵 Music controller initialized');
        }
    }
    
    toggleMusic() {
        if (this.isPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    playMusic() {
        if (this.audio) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateButtonState();
                console.log('🎵 Music started playing');
            }).catch(error => {
                console.log('❌ Audio play failed:', error);
                // Handle autoplay restrictions - common in modern browsers
                alert('Please interact with the page first to enable audio');
            });
        }
    }
    
    pauseMusic() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updateButtonState();
            console.log('⏸️ Music paused');
        }
    }
    
    updateButtonState() {
        if (this.musicBtn) {
            if (this.isPlaying) {
                this.musicBtn.textContent = '⏸';
                this.musicBtn.classList.add('playing');
                this.musicBtn.title = 'Pause Music (⏸)';
            } else {
                this.musicBtn.textContent = '♪';
                this.musicBtn.classList.remove('playing');
                this.musicBtn.title = 'Play Music (♪)';
            }
        }
    }
    
    onAudioEnded() {
        // Audio will loop automatically due to 'loop' attribute
        // This is just for logging
        console.log('🔄 Music track ended (will loop)');
    }
    
    onAudioError(error) {
        console.error('❌ Audio error:', error);
        this.isPlaying = false;
        this.updateButtonState();
    }
    
    // Public methods
    isPlaying() {
        return this.isPlaying;
    }
    
    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global scroller instance
    window.scroller = new SimpleScroller();
    
    // Create global music controller instance
    window.musicController = new MusicController();
    
    // Add some helpful console messages
    console.log('🚀 Project IO MVP initialized!');
    console.log('📱 Use arrow keys, spacebar, or scroll to navigate');
    console.log('🔄 Current page:', window.scroller.getCurrentPage());
    
    // Add keyboard shortcut info
    console.log('⌨️  Keyboard shortcuts:');
    console.log('   ↓ Arrow Down / Spacebar: Next page');
    console.log('   ↑ Arrow Up: Previous page');
    console.log('   Home: Go to first page');
    console.log('   End: Go to last page');
    console.log('🎵 Click the music button (♪) to toggle background music');
});

// Add some helpful utility functions to window object
window.ProjectIO = {
    // Navigation functions
    goToPage: (page) => window.scroller?.goToPage(page),
    getCurrentPage: () => window.scroller?.getCurrentPage(),
    setTotalPages: (count) => window.scroller?.setTotalPages(count),
    nextPage: () => window.scroller?.nextPage(),
    prevPage: () => window.scroller?.prevPage(),
    
    // Music functions
    toggleMusic: () => window.musicController?.toggleMusic(),
    playMusic: () => window.musicController?.playMusic(),
    pauseMusic: () => window.musicController?.pauseMusic(),
    setVolume: (volume) => window.musicController?.setVolume(volume),
    isMusicPlaying: () => window.musicController?.isPlaying
};

// Handle page visibility changes (pause/resume when tab becomes active/inactive)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App paused (tab not visible)');
        // Optionally pause music when tab is hidden
        // window.musicController?.pauseMusic();
    } else {
        console.log('📱 App resumed (tab visible)');
        // Refresh current page detection
        window.scroller?.detectCurrentPage();
    }
});