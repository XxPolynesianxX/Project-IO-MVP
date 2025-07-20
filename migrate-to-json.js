/**
 * Migration Script: Convert existing HTML files to JSON database
 * Run with: node migrate-to-json.js
 */

const fs = require('fs');
const path = require('path');
const JSONDatabase = require('./js/database.js');

class ContentMigrator {
    constructor() {
        this.db = new JSONDatabase();
        this.contentDir = './content';
    }
    
    async migrate() {
        console.log('🚀 Starting migration from HTML files to JSON database...');
        
        try {
            // Get existing page files
            const pageFiles = this.getExistingPageFiles();
            console.log(`📄 Found ${pageFiles.length} existing page files`);
            
            if (pageFiles.length === 0) {
                console.log('⚠️  No existing page files found. Nothing to migrate.');
                return;
            }
            
            // Process each page file
            const migratedPages = [];
            for (const file of pageFiles) {
                const pageData = await this.extractPageData(file);
                if (pageData) {
                    migratedPages.push(pageData);
                }
            }
            
            // Add all pages to database
            console.log(`🔄 Adding ${migratedPages.length} pages to database...`);
            for (const pageData of migratedPages) {
                this.db.addPage(pageData);
            }
            
            console.log('✅ Migration completed successfully!');
            console.log(`📊 Migrated ${migratedPages.length} pages to JSON database`);
            
            // Create archive of original files
            await this.archiveOriginalFiles(pageFiles);
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    }
    
    getExistingPageFiles() {
        if (!fs.existsSync(this.contentDir)) {
            return [];
        }
        
        const files = fs.readdirSync(this.contentDir);
        return files
            .filter(file => file.match(/^page\d+\.html$/))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });
    }
    
    async extractPageData(filename) {
        const filePath = path.join(this.contentDir, filename);
        const pageNumber = parseInt(filename.match(/\d+/)[0]);
        
        try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            console.log(`🔍 Processing ${filename}...`);
            
            // Extract Chinese character
            const chineseMatch = htmlContent.match(/class="home-character"[^>]*>([^<]+)</);
            const chineseCharacter = chineseMatch ? chineseMatch[1].trim() : '';
            
            // Extract pinyin
            const pinyinMatch = htmlContent.match(/font-style: italic[^>]*>([^<]+)</);
            const pinyin = pinyinMatch ? pinyinMatch[1].trim() : '';
            
            // Extract quote
            const quoteMatch = htmlContent.match(/font-weight: 300[^>]*"?>([^<]+)</);
            const quote = quoteMatch ? quoteMatch[1].trim().replace(/^"|"$/g, '') : '';
            
            // Extract background image from CSS (if exists)
            const backgroundImage = this.extractBackgroundImage(pageNumber);
            
            // Determine category based on content
            const category = this.categorizeContent(chineseCharacter, quote);
            
            if (!chineseCharacter && !quote) {
                console.log(`⚠️  Skipping ${filename} - no extractable content`);
                return null;
            }
            
            const pageData = {
                chineseCharacter: chineseCharacter || `Page ${pageNumber}`,
                pinyin: pinyin || '',
                quote: quote || 'Content extracted from HTML file',
                backgroundImage: backgroundImage || '',
                category: category,
                tags: this.generateTags(chineseCharacter, quote),
                sourceFile: filename,
                migrationNotes: 'Migrated from HTML file'
            };
            
            console.log(`✅ Extracted: ${pageData.chineseCharacter} (${pageData.pinyin})`);
            return pageData;
            
        } catch (error) {
            console.error(`❌ Error processing ${filename}:`, error.message);
            return null;
        }
    }
    
    extractBackgroundImage(pageNumber) {
        try {
            const cssPath = './css/background-transitions.css';
            if (!fs.existsSync(cssPath)) return '';
            
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            const bgMatch = cssContent.match(new RegExp(`\\.bg-page-${pageNumber}[^}]*background-image:\\s*url\\(['"]?([^'"\\)]+)['"]?\\)`));
            
            if (bgMatch) {
                return bgMatch[1];
            }
            
            // Try online version
            const onlineMatch = cssContent.match(new RegExp(`\\.bg-online-${pageNumber}[^}]*background-image:\\s*url\\(['"]?([^'"\\)]+)['"]?\\)`));
            if (onlineMatch) {
                return onlineMatch[1];
            }
            
            return '';
        } catch (error) {
            console.log(`⚠️  Could not extract background for page ${pageNumber}`);
            return '';
        }
    }
    
    categorizeContent(chineseCharacter, quote) {
        const categories = {
            'family': ['家', '母', '父', '子', '女'],
            'nature': ['山', '水', '花', '树', '天'],
            'wisdom': ['智', '慧', '学', '知', '道'],
            'emotion': ['爱', '情', '心', '感', '喜'],
            'action': ['做', '行', '走', '来', '去'],
            'virtue': ['仁', '义', '礼', '智', '信'],
            'balance': ['衡', '平', '和', '调', '协'],
            'transformation': ['蛻', '变', '化', '成', '长']
        };
        
        for (const [category, chars] of Object.entries(categories)) {
            if (chars.some(char => chineseCharacter.includes(char))) {
                return category;
            }
        }
        
        // Categorize by quote content
        const quoteWords = quote.toLowerCase();
        if (quoteWords.includes('home') || quoteWords.includes('family')) return 'family';
        if (quoteWords.includes('nature') || quoteWords.includes('mountain')) return 'nature';
        if (quoteWords.includes('wisdom') || quoteWords.includes('knowledge')) return 'wisdom';
        if (quoteWords.includes('love') || quoteWords.includes('heart')) return 'emotion';
        if (quoteWords.includes('balance') || quoteWords.includes('harmony')) return 'balance';
        if (quoteWords.includes('transform') || quoteWords.includes('change')) return 'transformation';
        
        return 'general';
    }
    
    generateTags(chineseCharacter, quote) {
        const tags = [];
        
        // Add character-based tags
        if (chineseCharacter) {
            tags.push('chinese-character');
            if (chineseCharacter.length === 1) tags.push('single-character');
            if (chineseCharacter.length > 1) tags.push('phrase');
        }
        
        // Add quote-based tags
        const quoteWords = quote.toLowerCase();
        if (quoteWords.includes('eastern')) tags.push('eastern-philosophy');
        if (quoteWords.includes('western')) tags.push('western-philosophy');
        if (quoteWords.includes('wisdom')) tags.push('wisdom');
        if (quoteWords.includes('life')) tags.push('life-advice');
        
        return tags;
    }
    
    async archiveOriginalFiles(pageFiles) {
        console.log('📦 Creating archive of original HTML files...');
        
        const archiveDir = './Archive/migration-backup';
        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }
        
        for (const file of pageFiles) {
            const sourcePath = path.join(this.contentDir, file);
            const destPath = path.join(archiveDir, file);
            fs.copyFileSync(sourcePath, destPath);
        }
        
        console.log(`📦 Archived ${pageFiles.length} original files to ${archiveDir}`);
    }
    
    // Utility method to validate migration
    async validateMigration() {
        console.log('🔍 Validating migration...');
        
        const originalFiles = this.getExistingPageFiles();
        const dbPages = this.db.getAllPages();
        
        console.log(`📊 Original files: ${originalFiles.length}`);
        console.log(`📊 Database pages: ${dbPages.length}`);
        
        if (dbPages.length === 0) {
            console.log('❌ No pages found in database');
            return false;
        }
        
        // Check if all pages have required fields
        const invalidPages = dbPages.filter(page => 
            !page.chineseCharacter || !page.quote
        );
        
        if (invalidPages.length > 0) {
            console.log(`⚠️  ${invalidPages.length} pages missing required fields`);
        }
        
        console.log('✅ Migration validation completed');
        return true;
    }
}

// Run migration if called directly
if (require.main === module) {
    async function main() {
        try {
            const migrator = new ContentMigrator();
            await migrator.migrate();
            await migrator.validateMigration();
            
            console.log('\n🎉 Migration completed successfully!');
            console.log('📝 Next steps:');
            console.log('   1. Run "node build-json.js" to build from database');
            console.log('   2. Test the website to ensure everything works');
            console.log('   3. Update your workflow to use database commands');
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = ContentMigrator;