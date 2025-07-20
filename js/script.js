/**
 * Project IO MVP - Simple Scrolling Navigation
 * Handles smooth scrolling between content pages with Instagram-like experience
 */

class SimpleScroller {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 11; // Will be automatically loaded from JSON database
        this.container = document.getElementById('content-container');
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }
    
    init() {
        this.loadJSONDatabase();
        this.setupNavigation();
        this.setupScrollDetection();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
        this.updateProgress();
        
        // Set initial background for page 1
        console.log('🎨 Setting initial background for page 1...');
        this.updateBackgroundUnified();
        
        // Hide touch hint after 5 seconds
        setTimeout(() => {
            const hint = document.getElementById('touch-hint');
            if (hint) hint.style.display = 'none';
        }, 5000);
    }
    
    async loadJSONDatabase() {
        try {
            console.log('📄 Loading JSON database for page data...');
            
            const response = await fetch('data/pages.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            
            // Update total pages from JSON
            if (jsonData.metadata && jsonData.metadata.totalPages) {
                this.totalPages = jsonData.metadata.totalPages;
                console.log(`📊 Updated total pages to ${this.totalPages} from JSON`);
            }
            
            // Load background mappings if available
            if (jsonData.pages) {
                this.loadBackgroundMappings(jsonData.pages);
            }
            
            this.updateProgress();
            this.updateNavigationButtons();
            
        } catch (error) {
            console.log(`❌ Failed to load JSON database: ${error.message}`);
            console.log('📄 Using embedded content as fallback');
        }
    }
    
    loadBackgroundMappings(pages) {
        // Check if UnifiedBackgroundManager already has JSON mappings loaded
        if (window.unifiedBackgroundManager && Object.keys(window.unifiedBackgroundManager.backgroundMappings).length > 0) {
            console.log('✅ Background mappings already loaded from JSON, skipping override');
            return; // Don't override existing JSON mappings
        }
        
        // Fallback: Create mappings if JSON system failed
        const mappings = {};
        pages.forEach((page) => {
            const pageNumber = page.order || page.id;
            if (page.backgroundImage) {
                mappings[pageNumber] = {
                    primary: `bg-page-${pageNumber}`, // Legacy fallback
                    fallback: `bg-online-${pageNumber}`, // Legacy fallback
                    image: page.backgroundImage, // JSON-driven approach
                    category: page.category,
                    chineseCharacter: page.chineseCharacter,
                    pinyin: page.pinyin
                };
            }
        });
        
        if (Object.keys(mappings).length > 0 && window.unifiedBackgroundManager) {
            window.unifiedBackgroundManager.addBackgroundMappings(mappings);
            console.log(`🎨 Added ${Object.keys(mappings).length} fallback background mappings`);
        }
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
        // Don't update page during programmatic scrolling to prevent race conditions
        if (this.isScrolling) {
            return;
        }
        
        const scrollTop = this.container.scrollTop;
        const pageHeight = window.innerHeight;
        const newPage = Math.round(scrollTop / pageHeight) + 1;
        
        // Ensure page is within bounds
        const clampedPage = Math.max(1, Math.min(newPage, this.totalPages));
        
        if (clampedPage !== this.currentPage) {
            this.currentPage = clampedPage;
            this.updateProgress();
            this.updateNavigationButtons();
            this.updateBackgroundUnified();
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
        this.updateBackgroundUnified();
        
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
    
    updateBackgroundUnified() {
        // Use the unified background manager if available
        if (window.unifiedBackgroundManager) {
            window.unifiedBackgroundManager.changeBackground(this.currentPage);
        } else {
            // Fallback: create unified manager if not available
            console.log('🎨 Creating UnifiedBackgroundManager...');
            if (window.UnifiedBackgroundManager) {
                window.unifiedBackgroundManager = new window.UnifiedBackgroundManager();
                window.unifiedBackgroundManager.changeBackground(this.currentPage);
            } else {
                console.warn('⚠️ UnifiedBackgroundManager class not available');
            }
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
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize background manager first (with JSON loading)
    console.log('🎨 Creating Unified Background Manager...');
    window.unifiedBackgroundManager = new UnifiedBackgroundManager();
    console.log('✅ Unified Background Manager created successfully');
    
    // Wait for background manager to fully initialize and load JSON
    console.log('⏳ Waiting for background manager initialization...');
    
    // Wait for JSON loading to complete by checking if mappings exist
    let attempts = 0;
    while (attempts < 20 && Object.keys(window.unifiedBackgroundManager.backgroundMappings).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (Object.keys(window.unifiedBackgroundManager.backgroundMappings).length > 0) {
        console.log('✅ Background mappings loaded successfully');
    } else {
        console.warn('⚠️ Background mappings may not be fully loaded');
    }
    
    // Create global scroller instance
    window.scroller = new SimpleScroller();
    
    // Create global music controller instance
    window.musicController = new MusicController();
    
    // Performance monitoring
    setTimeout(() => {
        if (window.unifiedBackgroundManager) {
            const stats = window.unifiedBackgroundManager.getStats();
            console.log('📊 Performance Stats:', stats);
            
            if (stats.memoryUsage.status === 'high') {
                console.warn('⚠️ High memory usage detected. Consider enabling lazy loading.');
            }
        }
    }, 2000);
    
    // Add some helpful console messages
    console.log('🚀 Project IO MVP initialized with performance optimizations!');
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
    isMusicPlaying: () => window.musicController?.isPlaying,
    
    // Performance and background functions
    getStats: () => window.unifiedBackgroundManager?.getStats(),
    enableDebugMode: () => window.unifiedBackgroundManager?.setDebugMode(true),
    disableDebugMode: () => window.unifiedBackgroundManager?.setDebugMode(false),
    preloadNearbyImages: (radius) => window.unifiedBackgroundManager?.preloadNearbyImages(window.scroller?.getCurrentPage(), radius),
    resetBackgrounds: () => window.unifiedBackgroundManager?.reset(),
    
    // Database functions (if using JSON build)
    reloadDatabase: () => window.scroller?.loadJSONDatabase()
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