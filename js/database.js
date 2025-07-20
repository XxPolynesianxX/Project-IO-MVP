/**
 * JSON Database Manager for Project IO MVP
 * Handles all database operations for pages content
 */

const fs = require('fs');
const path = require('path');

class JSONDatabase {
    constructor(dbPath = './data/pages.json') {
        this.dbPath = dbPath;
        this.data = null;
        this.init();
    }
    
    init() {
        try {
            if (fs.existsSync(this.dbPath)) {
                this.load();
            } else {
                this.createEmptyDatabase();
            }
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            this.createEmptyDatabase();
        }
    }
    
    createEmptyDatabase() {
        this.data = {
            metadata: {
                version: "1.0",
                totalPages: 0,
                lastUpdated: new Date().toISOString(),
                description: "Project IO MVP Content Database"
            },
            pages: []
        };
        this.save();
    }
    
    load() {
        try {
            const rawData = fs.readFileSync(this.dbPath, 'utf8');
            this.data = JSON.parse(rawData);
            console.log(`📖 Loaded database with ${this.data.pages.length} pages`);
        } catch (error) {
            console.error('❌ Failed to load database:', error.message);
            this.createEmptyDatabase();
        }
    }
    
    save() {
        try {
            // Update metadata
            this.data.metadata.totalPages = this.data.pages.length;
            this.data.metadata.lastUpdated = new Date().toISOString();
            
            // Create backup before saving
            this.createBackup();
            
            // Write to file with pretty formatting
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
            console.log(`💾 Database saved with ${this.data.pages.length} pages`);
        } catch (error) {
            console.error('❌ Failed to save database:', error.message);
            throw error;
        }
    }
    
    createBackup() {
        if (fs.existsSync(this.dbPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `./data/backup-${timestamp}.json`;
            
            // Create backups directory if it doesn't exist
            const backupDir = path.dirname(backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            fs.copyFileSync(this.dbPath, backupPath);
            console.log(`🔄 Database backup created: ${backupPath}`);
        }
    }
    
    // CRUD Operations
    getAllPages() {
        return this.data.pages;
    }
    
    getPage(id) {
        return this.data.pages.find(page => page.id === id);
    }
    
    getPageByIndex(index) {
        return this.data.pages[index];
    }
    
    addPage(pageData) {
        const newId = this.getNextId();
        const newPage = {
            id: newId,
            order: this.data.pages.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...pageData
        };
        
        this.data.pages.push(newPage);
        this.save();
        
        console.log(`✅ Added new page: ${newPage.chineseCharacter} (ID: ${newId})`);
        return newPage;
    }
    
    updatePage(id, updates) {
        const pageIndex = this.data.pages.findIndex(page => page.id === id);
        if (pageIndex === -1) {
            throw new Error(`Page with ID ${id} not found`);
        }
        
        this.data.pages[pageIndex] = {
            ...this.data.pages[pageIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.save();
        console.log(`✅ Updated page ID ${id}`);
        return this.data.pages[pageIndex];
    }
    
    deletePage(id) {
        const pageIndex = this.data.pages.findIndex(page => page.id === id);
        if (pageIndex === -1) {
            throw new Error(`Page with ID ${id} not found`);
        }
        
        const deletedPage = this.data.pages.splice(pageIndex, 1)[0];
        
        // Reorder remaining pages
        this.data.pages.forEach((page, index) => {
            page.order = index + 1;
        });
        
        this.save();
        console.log(`🗑️  Deleted page: ${deletedPage.chineseCharacter} (ID: ${id})`);
        return deletedPage;
    }
    
    // Search and filter
    searchPages(query) {
        const searchTerm = query.toLowerCase();
        return this.data.pages.filter(page => 
            page.chineseCharacter.includes(searchTerm) ||
            page.pinyin.toLowerCase().includes(searchTerm) ||
            page.quote.toLowerCase().includes(searchTerm) ||
            (page.category && page.category.toLowerCase().includes(searchTerm)) ||
            (page.tags && page.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    getPagesByCategory(category) {
        return this.data.pages.filter(page => page.category === category);
    }
    
    getPagesByTag(tag) {
        return this.data.pages.filter(page => 
            page.tags && page.tags.includes(tag)
        );
    }
    
    // Utility methods
    getNextId() {
        if (this.data.pages.length === 0) return 1;
        return Math.max(...this.data.pages.map(page => page.id)) + 1;
    }
    
    getTotalPages() {
        return this.data.pages.length;
    }
    
    getMetadata() {
        return this.data.metadata;
    }
    
    // Validation
    validatePageData(pageData) {
        const required = ['chineseCharacter', 'pinyin', 'quote'];
        const missing = required.filter(field => !pageData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        return true;
    }
    
    // Import/Export utilities
    exportToJSON(filePath) {
        fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
        console.log(`📤 Database exported to: ${filePath}`);
    }
    
    importFromJSON(filePath) {
        try {
            const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Validate structure
            if (!importData.pages || !Array.isArray(importData.pages)) {
                throw new Error('Invalid database structure');
            }
            
            // Create backup before import
            this.createBackup();
            
            this.data = importData;
            this.save();
            
            console.log(`📥 Database imported from: ${filePath}`);
            console.log(`📊 Imported ${this.data.pages.length} pages`);
        } catch (error) {
            console.error('❌ Import failed:', error.message);
            throw error;
        }
    }
}

module.exports = JSONDatabase;