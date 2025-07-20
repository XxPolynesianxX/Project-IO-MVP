/**
 * Enhanced Build System with JSON Database Support
 * Extends the original build.js to work with JSON database
 */

const fs = require('fs');
const path = require('path');
const JSONDatabase = require('./js/database.js');
const RobustProjectBuilder = require('./build.js');

class DatabaseBuilder extends RobustProjectBuilder {
    constructor() {
        super();
        this.db = new JSONDatabase();
        this.useDatabase = true; // Flag to switch between database and file-based
    }
    
    async build() {
        this.log('info', '🚀 Starting database-aware build process...');
        
        try {
            // Step 1: Validate environment
            await this.validateEnvironment();
            
            // Step 2: Determine build source
            const buildSource = await this.determineBuildSource();
            this.log('info', `📊 Building from: ${buildSource}`);
            
            // Step 3: Create backup
            await this.createBackup();
            
            if (buildSource === 'database') {
                await this.buildFromDatabase();
            } else {
                await this.buildFromFiles(); // Fallback to original method
            }
            
            this.log('info', '✅ Database-aware build completed successfully!');
            
        } catch (error) {
            this.log('error', '❌ Build failed:', error.message);
            await this.handleBuildError(error);
            throw error;
        }
    }
    
    async determineBuildSource() {
        // Check if database exists and has content
        const dbExists = fs.existsSync('./data/pages.json');
        if (!dbExists) {
            this.log('info', '📄 No database found, using file-based build');
            return 'files';
        }
        
        try {
            this.db.load();
            const pages = this.db.getAllPages();
            
            if (pages.length === 0) {
                this.log('info', '📄 Database empty, using file-based build');
                return 'files';
            }
            
            this.log('info', `📊 Database found with ${pages.length} pages`);
            return 'database';
            
        } catch (error) {
            this.log('warn', '⚠️  Database error, falling back to files:', error.message);
            return 'files';
        }
    }
    
    async buildFromDatabase() {
        this.log('debug', '🗄️  Building from JSON database...');
        
        // Get all pages from database
        const pages = this.db.getAllPages();
        
        if (pages.length === 0) {
            throw new Error('Database contains no pages');
        }
        
        // Sort pages by order
        pages.sort((a, b) => (a.order || a.id) - (b.order || b.id));
        
        // Generate HTML content for each page
        const combinedContent = this.generateContentFromDatabase(pages);
        
        // Build from template
        await this.buildFromTemplate(combinedContent, pages.length);
        
        // Update JavaScript
        await this.updateJavaScript(pages.length);
        
        // Update CSS backgrounds
        await this.updateBackgroundCSS(pages);
        
        // Validate result
        await this.validateResult(pages.length);
        
        this.log('info', `📊 Built website with ${pages.length} pages from database`);
    }
    
    generateContentFromDatabase(pages) {
        this.log('debug', '🔄 Generating content from database pages...');
        
        let combinedContent = '';
        
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const pageHtml = this.generatePageHTML(page, pageNumber);
            
            combinedContent += `\n            <div class="page-section" id="page-${pageNumber}">\n                <div class="page-content">\n                    ${pageHtml}\n                </div>\n            </div>`;
            
            this.log('debug', `✅ Generated page ${pageNumber}: ${page.chineseCharacter}`);
        });
        
        return combinedContent;
    }
    
    generatePageHTML(pageData, pageNumber) {
        const {
            chineseCharacter = '',
            pinyin = '',
            quote = '',
            customHTML = null
        } = pageData;
        
        // If custom HTML is provided, use it
        if (customHTML) {
            return customHTML;
        }
        
        // Generate standard template
        const linkHref = pageData.linkUrl || '#';
        const linkTarget = pageData.linkUrl ? 'target="_blank"' : '';
        
        return `<div style="text-align: center; padding: 20px;">
    <div style="font-size: clamp(8rem, 25vw, 16rem); line-height: 1; margin: 20px 0; color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.3);">
        <a href="${linkHref}" ${linkTarget} class="home-character">
            ${chineseCharacter}
        </a>
    </div>
    <div style="font-size: clamp(1.2rem, 4vw, 1.8rem); color: #ccc; margin: 10px 0; font-style: italic; letter-spacing: 0.2em;">
        ${pinyin}
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 30px 20px; border-radius: 15px; margin: 40px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
        <p style="font-size: clamp(1rem, 3vw, 1.3rem); line-height: 1.6; color: #fff; margin: 0; font-weight: 300;">
            "${quote}"
        </p>
    </div>
</div>`;
    }
    
    async updateBackgroundCSS(pages) {
        this.log('debug', '🎨 Updating background CSS from database...');
        
        const cssPath = './css/background-transitions.css';
        let cssContent = '';
        
        // Read existing CSS header
        if (fs.existsSync(cssPath)) {
            const existingCSS = fs.readFileSync(cssPath, 'utf8');
            const headerMatch = existingCSS.match(/^([\s\S]*?\/\* Page-specific background classes \*\/)/);
            if (headerMatch) {
                cssContent = headerMatch[1] + '\n\n';
            } else {
                cssContent = `/* Background Transition Enhancement for Project IO MVP */

/* Smooth body background transitions */
body {
    transition: background-image 1s ease-in-out;
}

/* Page-specific background classes */

`;
            }
        }
        
        // Generate CSS for each page
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const backgroundImage = page.backgroundImage || '';
            
            if (backgroundImage) {
                // Determine if it's a local or external image
                const isLocal = !backgroundImage.startsWith('http');
                const imagePath = isLocal ? `../assets/images/${backgroundImage}` : backgroundImage;
                
                cssContent += `.bg-page-${pageNumber} {
    background-image: url('${imagePath}') !important;
}

`;
            }
        });
        
        // Add fallback online backgrounds
        cssContent += `
/* Fallback online backgrounds */
`;
        
        pages.forEach((page, index) => {
            const pageNumber = index + 1;
            const fallbackImage = this.generateFallbackImage(page);
            
            cssContent += `.bg-online-${pageNumber} {
    background-image: url('${fallbackImage}') !important;
}

`;
        });
        
        fs.writeFileSync(cssPath, cssContent);
        this.log('debug', '✅ Background CSS updated');
    }
    
    generateFallbackImage(pageData) {
        // Generate appropriate Unsplash URLs based on content
        const { category, tags, chineseCharacter } = pageData;
        
        const imageMap = {
            'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&h=1080&fit=crop',
            'nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
            'wisdom': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop',
            'emotion': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
            'balance': 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?w=1920&h=1080&fit=crop',
            'transformation': 'https://images.pexels.com/photos/133442/pexels-photo-133442.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
            'general': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop'
        };
        
        return imageMap[category] || imageMap['general'];
    }
    
    // Database management methods
    async addPageToDatabase(pageData) {
        this.log('info', '➕ Adding new page to database...');
        
        try {
            this.db.validatePageData(pageData);
            const newPage = this.db.addPage(pageData);
            
            // Rebuild site
            await this.buildFromDatabase();
            
            this.log('info', `✅ Added page: ${newPage.chineseCharacter} (ID: ${newPage.id})`);
            return newPage;
            
        } catch (error) {
            this.log('error', '❌ Failed to add page:', error.message);
            throw error;
        }
    }
    
    async updatePageInDatabase(id, updates) {
        this.log('info', `📝 Updating page ${id} in database...`);
        
        try {
            const updatedPage = this.db.updatePage(id, updates);
            
            // Rebuild site
            await this.buildFromDatabase();
            
            this.log('info', `✅ Updated page: ${updatedPage.chineseCharacter}`);
            return updatedPage;
            
        } catch (error) {
            this.log('error', '❌ Failed to update page:', error.message);
            throw error;
        }
    }
    
    async deletePageFromDatabase(id) {
        this.log('info', `🗑️  Deleting page ${id} from database...`);
        
        try {
            const deletedPage = this.db.deletePage(id);
            
            // Rebuild site
            await this.buildFromDatabase();
            
            this.log('info', `✅ Deleted page: ${deletedPage.chineseCharacter}`);
            return deletedPage;
            
        } catch (error) {
            this.log('error', '❌ Failed to delete page:', error.message);
            throw error;
        }
    }
    
    // Enhanced [create page] command for database
    async createPageFromPrompt(prompt) {
        this.log('info', '🎨 Creating page from prompt...');
        
        try {
            // Generate Chinese word/phrase
            const chineseWord = await this.generateChineseWord(prompt);
            
            // Generate quote
            const quote = await this.generateQuote(chineseWord, prompt);
            
            // Generate pinyin
            const pinyin = this.generatePinyin(chineseWord);
            
            // Search for background image
            const backgroundImage = await this.findBackgroundImage(chineseWord, quote);
            
            // Determine category
            const category = this.categorizeContent(chineseWord, quote);
            
            // Create page data
            const pageData = {
                chineseCharacter: chineseWord,
                pinyin: pinyin,
                quote: quote,
                backgroundImage: backgroundImage,
                category: category,
                tags: this.generateTags(chineseWord, quote),
                prompt: prompt,
                sourceMethod: 'ai-generated'
            };
            
            // Add to database and rebuild
            const newPage = await this.addPageToDatabase(pageData);
            
            this.log('info', `✅ Created new page: ${chineseWord} (${pinyin})`);
            return newPage;
            
        } catch (error) {
            this.log('error', '❌ Failed to create page from prompt:', error.message);
            throw error;
        }
    }
    
    // AI-powered content generation methods
    async generateChineseWord(prompt) {
        // This would integrate with your AI system to generate appropriate Chinese characters
        // For now, return a placeholder that can be manually edited
        this.log('info', '🤖 Generating Chinese word from prompt:', prompt);
        
        // Simple keyword mapping for demonstration
        const keywordMap = {
            'home': '家',
            'family': '家',
            'balance': '衡',
            'harmony': '和',
            'wisdom': '智',
            'love': '愛',
            'peace': '和',
            'strength': '力',
            'beauty': '美',
            'nature': '自然',
            'growth': '成長',
            'change': '變',
            'journey': '旅',
            'dream': '夢',
            'hope': '希望'
        };
        
        // Look for keywords in prompt
        const promptLower = prompt.toLowerCase();
        for (const [keyword, chinese] of Object.entries(keywordMap)) {
            if (promptLower.includes(keyword)) {
                return chinese;
            }
        }
        
        // Default return
        return '道'; // "The Way" - a universal concept
    }
    
    async generateQuote(chineseWord, prompt) {
        // AI-powered quote generation would go here
        // For now, return a template that can be customized
        return `"In the essence of ${chineseWord}, we find the bridge between ancient wisdom and modern understanding."`;
    }
    
    generatePinyin(chineseWord) {
        // Simple pinyin mapping - in production, use a proper pinyin library
        const pinyinMap = {
            '家': 'jiā',
            '衡': 'héng',
            '和': 'hé',
            '智': 'zhì',
            '愛': 'ài',
            '力': 'lì',
            '美': 'měi',
            '自然': 'zì rán',
            '成長': 'chéng zhǎng',
            '變': 'biàn',
            '旅': 'lǚ',
            '夢': 'mèng',
            '希望': 'xī wàng',
            '道': 'dào'
        };
        
        return pinyinMap[chineseWord] || 'unknown';
    }
    
    async findBackgroundImage(chineseWord, quote) {
        // In production, this would search for appropriate images
        // For now, return a default that can be updated manually
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop';
    }
    
    categorizeContent(chineseWord, quote) {
        // Simple categorization logic
        const categories = {
            'family': ['家', '母', '父', '子', '女'],
            'nature': ['自然', '山', '水', '花', '树'],
            'wisdom': ['智', '慧', '学', '道'],
            'emotion': ['愛', '情', '心', '感'],
            'balance': ['衡', '和', '平'],
            'transformation': ['變', '成長', '化']
        };
        
        for (const [category, chars] of Object.entries(categories)) {
            if (chars.some(char => chineseWord.includes(char))) {
                return category;
            }
        }
        
        return 'general';
    }
    
    generateTags(chineseWord, quote) {
        const tags = ['database-generated'];
        
        if (chineseWord.length === 1) tags.push('single-character');
        if (chineseWord.length > 1) tags.push('phrase');
        
        const quoteWords = quote.toLowerCase();
        if (quoteWords.includes('wisdom')) tags.push('wisdom');
        if (quoteWords.includes('ancient')) tags.push('traditional');
        if (quoteWords.includes('modern')) tags.push('contemporary');
        
        return tags;
    }
    
    // Database utility methods
    async listAllPages() {
        const pages = this.db.getAllPages();
        
        console.log('\n📚 Database Contents:');
        console.log('═════════════════════');
        
        if (pages.length === 0) {
            console.log('📄 No pages found in database');
            return;
        }
        
        pages.forEach((page, index) => {
            console.log(`${index + 1}. ${page.chineseCharacter} (${page.pinyin}) - ${page.category}`);
            console.log(`   "${page.quote.substring(0, 50)}..."`);
            console.log(`   ID: ${page.id}, Created: ${page.createdAt?.substring(0, 10)}\n`);
        });
        
        console.log(`📊 Total pages: ${pages.length}`);
    }
    
    async searchPages(query) {
        const results = this.db.searchPages(query);
        
        console.log(`\n🔍 Search results for "${query}":`);
        console.log('══════════════════════════════════');
        
        if (results.length === 0) {
            console.log('📄 No matching pages found');
            return;
        }
        
        results.forEach((page, index) => {
            console.log(`${index + 1}. ${page.chineseCharacter} (${page.pinyin})`);
            console.log(`   "${page.quote}"`);
            console.log(`   Category: ${page.category}, ID: ${page.id}\n`);
        });
        
        console.log(`📊 Found ${results.length} matching pages`);
    }
    
    async exportDatabase(filePath) {
        this.db.exportToJSON(filePath);
        this.log('info', `📤 Database exported to: ${filePath}`);
    }
    
    async importDatabase(filePath) {
        this.db.importFromJSON(filePath);
        await this.buildFromDatabase();
        this.log('info', `📥 Database imported and site rebuilt`);
    }
}

// Export for use as module
module.exports = DatabaseBuilder;

// Command line interface
if (require.main === module) {
    const builder = new DatabaseBuilder();
    const command = process.argv[2] || 'build';
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];
    
    async function main() {
        try {
            switch (command) {
                case 'build':
                    await builder.build();
                    break;
                    
                case 'add':
                    if (!arg1) {
                        console.log('❌ Usage: node build-json.js add "prompt text"');
                        return;
                    }
                    await builder.createPageFromPrompt(arg1);
                    break;
                    
                case 'list':
                    await builder.listAllPages();
                    break;
                    
                case 'search':
                    if (!arg1) {
                        console.log('❌ Usage: node build-json.js search "search term"');
                        return;
                    }
                    await builder.searchPages(arg1);
                    break;
                    
                case 'update':
                    if (!arg1 || !arg2) {
                        console.log('❌ Usage: node build-json.js update <id> "{\\"field\\": \\"value\\"}"');
                        return;
                    }
                    const updates = JSON.parse(arg2);
                    await builder.updatePageInDatabase(parseInt(arg1), updates);
                    break;
                    
                case 'delete':
                    if (!arg1) {
                        console.log('❌ Usage: node build-json.js delete <id>');
                        return;
                    }
                    await builder.deletePageFromDatabase(parseInt(arg1));
                    break;
                    
                case 'export':
                    const exportPath = arg1 || './data/export.json';
                    await builder.exportDatabase(exportPath);
                    break;
                    
                case 'import':
                    if (!arg1) {
                        console.log('❌ Usage: node build-json.js import <filepath>');
                        return;
                    }
                    await builder.importDatabase(arg1);
                    break;
                    
                case 'clean':
                    await builder.clean();
                    break;
                    
                case 'validate':
                    await builder.validate();
                    break;
                    
                default:
                    console.log('📖 Database Builder Usage:');
                    console.log('═══════════════════════════');
                    console.log('   node build-json.js build                    - Build from database');
                    console.log('   node build-json.js add "prompt"              - Add new page from prompt');
                    console.log('   node build-json.js list                     - List all pages');
                    console.log('   node build-json.js search "term"             - Search pages');
                    console.log('   node build-json.js update <id> "{...}"       - Update page');
                    console.log('   node build-json.js delete <id>              - Delete page');
                    console.log('   node build-json.js export [filepath]        - Export database');
                    console.log('   node build-json.js import <filepath>        - Import database');
                    console.log('   node build-json.js clean                    - Clean rebuild');
                    console.log('   node build-json.js validate                 - Validate database');
                    console.log('');
                    console.log('📝 Examples:');
                    console.log('   node build-json.js add "finding inner peace"');
                    console.log('   node build-json.js search "wisdom"');
                    console.log('   node build-json.js update 5 "{\\"quote\\": \\"New quote here\\"}"');
            }
        } catch (error) {
            console.error('❌ Command failed:', error.message);
            process.exit(1);
        }
    }
    
    main();
}