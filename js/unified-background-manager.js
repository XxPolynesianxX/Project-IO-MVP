/**
 * Unified Background Management System
 * Replaces the background logic from script.js and background-transitions.js
 * Single source of truth for all background operations
 */

class UnifiedBackgroundManager {
    constructor() {
        this.currentBgClasses = new Set();
        this.isTransitioning = false;
        this.preloadedImages = new Set();
        this.jsonData = null; // Store JSON database
        
        // Configuration
        this.config = {
            transitionDuration: 800, // Faster transitions for better performance
            enablePreloading: true,
            enableFallbacks: true,
            enableLazyLoading: true,
            preloadBatchSize: 3, // Preload 3 images at a time
            debugMode: true, // Enable debug mode to see JSON loading
            useJsonBackgrounds: true // NEW: Enable JSON-driven backgrounds
        };
        
        // Background mappings - will be loaded from JSON
        this.backgroundMappings = {};
        
        this.init();
    }
    
    /**
     * Load background mappings from JSON database
     */
    async loadJSONDatabase() {
        try {
            this.log('📄 Loading JSON database for backgrounds...');
            
            // Try to fetch the JSON file
            const response = await fetch('data/pages.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.jsonData = await response.json();
            
            // Convert JSON data to background mappings
            this.backgroundMappings = this.convertJSONToMappings(this.jsonData);
            
            this.log(`✅ Loaded ${Object.keys(this.backgroundMappings).length} backgrounds from JSON`);
            
        } catch (error) {
            this.log(`❌ Failed to load JSON database: ${error.message}`);
            this.log('🔄 Falling back to CSS-based backgrounds');
            
            // Fallback to old system
            this.config.useJsonBackgrounds = false;
            this.backgroundMappings = this.initializeBackgroundMappings();
        }
    }
    
    /**
     * Convert JSON pages data to background mappings
     */
    convertJSONToMappings(jsonData) {
        const mappings = {};
        
        if (jsonData && jsonData.pages) {
            jsonData.pages.forEach((page) => {
                const pageNumber = page.order || page.id;
                mappings[pageNumber] = {
                    primary: `bg-page-${pageNumber}`, // Legacy fallback
                    fallback: `bg-online-${pageNumber}`, // Legacy fallback
                    image: page.backgroundImage, // JSON-driven URL
                    chineseCharacter: page.chineseCharacter,
                    pinyin: page.pinyin,
                    quote: page.quote,
                    category: page.category
                };
            });
        }
        
        return mappings;
    }
    
    initializeBackgroundMappings() {
        const mappings = {};
        
        // Initialize mappings for existing pages (1-10) - legacy fallback only
        for (let i = 1; i <= 10; i++) {
            mappings[i] = {
                primary: `bg-page-${i}`,
                fallback: `bg-online-${i}`
            };
        }
        
        return mappings;
    }
    
    async init() {
        this.log('🎨 Initializing Unified Background Manager');
        
        // Apply initial background transition CSS
        this.setupTransitionCSS();
        
        // Load JSON database first
        if (this.config.useJsonBackgrounds) {
            await this.loadJSONDatabase();
        } else {
            // Fallback to old CSS system
            this.backgroundMappings = this.initializeBackgroundMappings();
        }
        
        // Preload images if enabled
        if (this.config.enablePreloading) {
            this.preloadBackgrounds();
        }
        
        this.log('✅ Unified Background Manager initialized');
    }
    
    setupTransitionCSS() {
        // Ensure smooth transitions are applied to body
        const style = document.createElement('style');
        style.textContent = `
            body {
                transition: background-image ${this.config.transitionDuration}ms ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Main method to change background for a specific page
     * @param {number} pageNumber - The page number to change background for
     * @param {Object} options - Additional options for background change
     */
    changeBackground(pageNumber, options = {}) {
        if (this.isTransitioning && !options.force) {
            this.log(`⏳ Background transition in progress, skipping page ${pageNumber}`);
            return false;
        }
        
        const mapping = this.backgroundMappings[pageNumber];
        if (!mapping) {
            this.log(`⚠️ No background mapping found for page ${pageNumber}`);
            return false;
        }
        
        this.isTransitioning = true;
        
        // Remove all existing background classes and inline styles
        this.removeAllBackgroundClasses();
        
        // Apply new background using direct image URL from JSON
        if (this.config.useJsonBackgrounds && mapping.image) {
            this.applyBackgroundFromURL(mapping.image, pageNumber);
            this.log(`🎨 Background changed to page ${pageNumber} (JSON): ${mapping.image}`);
        } else {
            // Fallback to old class-based system if no direct image URL
            const classesToAdd = [mapping.primary];
            if (this.config.enableFallbacks && mapping.fallback) {
                classesToAdd.push(mapping.fallback);
            }
            this.applyBackgroundClasses(classesToAdd);
            this.log(`🎨 Background changed to page ${pageNumber} (CSS): ${classesToAdd.join(', ')}`);
        }
        
        // Preload nearby images for smooth navigation
        if (this.config.enablePreloading) {
            this.preloadNearbyImages(pageNumber);
        }
        
        // Reset transition flag after transition completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDuration);
        
        return true;
    }
    
    /**
     * Remove all background classes and inline styles from body
     */
    removeAllBackgroundClasses() {
        const body = document.body;
        const classList = Array.from(body.classList);
        
        // Remove all bg-page-*, bg-online-*, and bg-dynamic-* classes
        classList.forEach(className => {
            if (className.startsWith('bg-page-') || 
                className.startsWith('bg-online-') || 
                className.startsWith('bg-dynamic-')) {
                body.classList.remove(className);
                this.currentBgClasses.delete(className);
            }
        });
        
        // Remove inline background styles to ensure clean slate
        body.style.backgroundImage = '';
    }
    
    /**
     * Apply background classes to body
     * @param {Array<string>} classes - Array of CSS class names to apply
     */
    applyBackgroundClasses(classes) {
        const body = document.body;
        
        classes.forEach(className => {
            body.classList.add(className);
            this.currentBgClasses.add(className);
        });
    }
    
    /**
     * Apply background directly from image URL (JSON-driven approach)
     * @param {string} imageUrl - Direct URL to background image
     * @param {number} pageNumber - Page number for dynamic class naming
     */
    applyBackgroundFromURL(imageUrl, pageNumber) {
        const body = document.body;
        
        // Create a dynamic class name
        const dynamicClassName = `bg-dynamic-page-${pageNumber}`;
        
        // Create or update CSS rule for this dynamic class
        this.createDynamicCSSRule(dynamicClassName, imageUrl);
        
        // Apply the dynamic class
        body.classList.add(dynamicClassName);
        this.currentBgClasses.add(dynamicClassName);
        
        this.log(`🎨 Applied dynamic background: ${dynamicClassName}`);
    }
    
    /**
     * Create dynamic CSS rule for background image
     * @param {string} className - CSS class name
     * @param {string} imageUrl - Background image URL
     */
    createDynamicCSSRule(className, imageUrl) {
        // Get or create our dynamic stylesheet
        let dynamicStylesheet = document.getElementById('dynamic-backgrounds');
        if (!dynamicStylesheet) {
            dynamicStylesheet = document.createElement('style');
            dynamicStylesheet.id = 'dynamic-backgrounds';
            dynamicStylesheet.textContent = '/* Dynamic backgrounds from JSON data */';
            document.head.appendChild(dynamicStylesheet);
        }
        
        // Create CSS rule
        const cssRule = `
        .${className} {
            background-image: url('${imageUrl}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
        }`;
        
        // Check if rule already exists and update it
        const existingContent = dynamicStylesheet.textContent;
        const rulePattern = new RegExp(`\.${className}\s*\{[^}]*\}`, 'g');
        
        if (rulePattern.test(existingContent)) {
            // Update existing rule
            dynamicStylesheet.textContent = existingContent.replace(rulePattern, cssRule);
        } else {
            // Add new rule
            dynamicStylesheet.textContent += cssRule;
        }
        
        this.log(`📝 Created/updated CSS rule for ${className}`);
    }
    
    /**
     * Add a custom background mapping for a page
     * @param {number} pageNumber - Page number
     * @param {string|Object} mapping - Either a class name string or object with primary/fallback
     */
    addBackgroundMapping(pageNumber, mapping) {
        if (typeof mapping === 'string') {
            this.backgroundMappings[pageNumber] = {
                primary: mapping,
                fallback: null
            };
        } else {
            this.backgroundMappings[pageNumber] = {
                primary: mapping.primary || mapping.class,
                fallback: mapping.fallback || null
            };
        }
        
        this.log(`📝 Added background mapping for page ${pageNumber}: ${mapping}`);
    }
    
    /**
     * Bulk add background mappings
     * @param {Object} mappings - Object with page numbers as keys and mappings as values
     */
    addBackgroundMappings(mappings) {
        Object.entries(mappings).forEach(([pageNumber, mapping]) => {
            this.addBackgroundMapping(parseInt(pageNumber), mapping);
        });
        
        this.log(`📝 Added ${Object.keys(mappings).length} background mappings`);
    }
    
    /**
     * Preload background images for smooth transitions
     * Enhanced with lazy loading and intelligent batching
     */
    preloadBackgrounds() {
        this.log('🔄 Starting intelligent background image preloading');
        
        if (this.config.enableLazyLoading) {
            this.preloadBackgroundsLazy();
        } else {
            this.preloadBackgroundsAll();
        }
    }
    
    preloadBackgroundsAll() {
        Object.values(this.backgroundMappings).forEach((mapping, index) => {
            // Preload both primary and fallback images
            [mapping.primary, mapping.fallback].forEach(className => {
                if (className && !this.preloadedImages.has(className)) {
                    this.preloadImageFromClass(className);
                    this.preloadedImages.add(className);
                }
            });
        });
        
        this.log(`✅ Preloaded ${this.preloadedImages.size} background images`);
    }
    
    preloadBackgroundsLazy() {
        const mappings = Object.entries(this.backgroundMappings);
        let currentBatch = 0;
        
        const preloadBatch = () => {
            const startIndex = currentBatch * this.config.preloadBatchSize;
            const endIndex = Math.min(startIndex + this.config.preloadBatchSize, mappings.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const [pageNumber, mapping] = mappings[i];
                [mapping.primary, mapping.fallback].forEach(className => {
                    if (className && !this.preloadedImages.has(className)) {
                        this.preloadImageFromClass(className);
                        this.preloadedImages.add(className);
                    }
                });
            }
            
            currentBatch++;
            
            if (endIndex < mappings.length) {
                // Schedule next batch after a delay to avoid blocking
                setTimeout(preloadBatch, 100);
            } else {
                this.log(`✅ Lazy loaded ${this.preloadedImages.size} background images in batches`);
            }
        };
        
        preloadBatch();
    }
    
    /**
     * Preload images around current page for smooth navigation
     */
    preloadNearbyImages(currentPage, radius = 2) {
        const startPage = Math.max(1, currentPage - radius);
        const endPage = Math.min(Object.keys(this.backgroundMappings).length, currentPage + radius);
        
        for (let page = startPage; page <= endPage; page++) {
            const mapping = this.backgroundMappings[page];
            if (mapping) {
                // Prioritize JSON-driven image URLs
                if (mapping.image && !this.preloadedImages.has(mapping.image)) {
                    this.preloadImageFromClass(mapping.image, true); // High priority, direct URL
                    this.preloadedImages.add(mapping.image);
                }
                
                // Also preload legacy CSS classes as fallback
                [mapping.primary, mapping.fallback].forEach(className => {
                    if (className && !this.preloadedImages.has(className)) {
                        this.preloadImageFromClass(className, true); // High priority
                        this.preloadedImages.add(className);
                    }
                });
            }
        }
        
        this.log(`🎨 Preloaded nearby images for page ${currentPage} (radius: ${radius})`);
    }
    
    /**
     * Preload an image by creating a temporary element with the CSS class or direct URL
     * @param {string} classNameOrUrl - CSS class name containing background-image or direct URL
     * @param {boolean} highPriority - Whether this is a high priority load
     */
    preloadImageFromClass(classNameOrUrl, highPriority = false) {
        try {
            // Check if it's a direct URL (JSON-driven) or CSS class (legacy)
            if (classNameOrUrl.startsWith('http://') || classNameOrUrl.startsWith('https://') || classNameOrUrl.startsWith('../')) {
                // Direct URL preloading (JSON-driven approach)
                this.preloadImageFromURL(classNameOrUrl, highPriority);
            } else {
                // Legacy CSS class preloading
                this.preloadImageFromCSSClass(classNameOrUrl, highPriority);
            }
        } catch (error) {
            this.log(`❌ Error preloading ${classNameOrUrl}: ${error.message}`);
        }
    }
    
    /**
     * Preload image directly from URL (JSON-driven approach)
     * @param {string} imageUrl - Direct image URL
     * @param {boolean} highPriority - Whether this is a high priority load
     */
    preloadImageFromURL(imageUrl, highPriority = false) {
        const img = new Image();
        img.onload = () => this.log(`✅ Preloaded (JSON): ${imageUrl}`);
        img.onerror = () => this.log(`❌ Failed to preload (JSON): ${imageUrl}`);
        img.src = imageUrl;
        
        if (highPriority) {
            img.loading = 'eager';
        }
    }
    
    /**
     * Preload image from CSS class (legacy approach)
     * @param {string} className - CSS class name containing background-image
     * @param {boolean} highPriority - Whether this is a high priority load
     */
    preloadImageFromCSSClass(className, highPriority = false) {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.className = className;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '1px';
            tempDiv.style.height = '1px';
            
            document.body.appendChild(tempDiv);
            
            // Force browser to load the background image
            const styles = window.getComputedStyle(tempDiv);
            const bgImage = styles.backgroundImage;
            
            if (bgImage && bgImage !== 'none') {
                const img = new Image();
                const urlMatch = bgImage.match(/url\(["']?([^"']*)["']?\)/);
                if (urlMatch && urlMatch[1]) {
                    img.onload = () => this.log(`✅ Preloaded (CSS): ${className}`);
                    img.onerror = () => this.log(`❌ Failed to preload (CSS): ${className}`);
                    img.src = urlMatch[1];
                }
            }
            
            document.body.removeChild(tempDiv);
        } catch (error) {
            this.log(`❌ Error preloading CSS class ${className}: ${error.message}`);
        }
    }
    
    /**
     * Get current background classes
     * @returns {Array<string>} Array of current background class names
     */
    getCurrentBackgroundClasses() {
        return Array.from(this.currentBgClasses);
    }
    
    /**
     * Get background mapping for a specific page
     * @param {number} pageNumber - Page number
     * @returns {Object|null} Background mapping object or null if not found
     */
    getBackgroundMapping(pageNumber) {
        return this.backgroundMappings[pageNumber] || null;
    }
    
    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('⚙️ Configuration updated', this.config);
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode(enabled) {
        this.config.debugMode = enabled;
        this.log(`🐛 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get statistics about background management
     * @returns {Object} Statistics object
     */
    getStats() {
        const memoryUsage = this.estimateMemoryUsage();
        
        return {
            totalMappings: Object.keys(this.backgroundMappings).length,
            preloadedImages: this.preloadedImages.size,
            currentClasses: this.currentBgClasses.size,
            isTransitioning: this.isTransitioning,
            memoryUsage: memoryUsage,
            performance: this.getPerformanceMetrics(),
            config: { ...this.config }
        };
    }
    
    /**
     * Estimate memory usage of preloaded images
     */
    estimateMemoryUsage() {
        // Rough estimate: average 2MB per background image
        const estimatedMB = this.preloadedImages.size * 2;
        return {
            estimatedMB: estimatedMB,
            preloadedCount: this.preloadedImages.size,
            status: estimatedMB > 50 ? 'high' : estimatedMB > 20 ? 'medium' : 'low'
        };
    }
    
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            transitionDuration: this.config.transitionDuration,
            preloadingEnabled: this.config.enablePreloading,
            lazyLoadingEnabled: this.config.enableLazyLoading,
            batchSize: this.config.preloadBatchSize,
            averageTransitionTime: this.config.transitionDuration + 'ms'
        };
    }
    
    /**
     * Reset background manager to initial state
     */
    reset() {
        this.removeAllBackgroundClasses();
        this.isTransitioning = false;
        this.preloadedImages.clear();
        this.log('🔄 Background manager reset');
    }
    
    /**
     * Logging utility
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.config.debugMode) {
            if (data) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedBackgroundManager;
}

// Global utility functions for backward compatibility
window.UnifiedBackgroundManager = UnifiedBackgroundManager;

// Helper functions that maintain compatibility with existing code
window.addPageBackground = (pageNumber, backgroundClass) => {
    if (window.unifiedBackgroundManager) {
        window.unifiedBackgroundManager.addBackgroundMapping(pageNumber, backgroundClass);
    }
};

window.addPageBackgrounds = (mappings) => {
    if (window.unifiedBackgroundManager) {
        window.unifiedBackgroundManager.addBackgroundMappings(mappings);
    }
};

// Initialize on DOM ready (but don't auto-instantiate - let the main script handle it)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        // Only create if not already created
        if (!window.unifiedBackgroundManager) {
            window.unifiedBackgroundManager = new UnifiedBackgroundManager();
            console.log('🎨 Unified Background Manager auto-initialized');
        }
    });
}