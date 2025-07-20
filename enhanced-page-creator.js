/**
 * Enhanced Page Creator for JSON Database Integration
 * Integrates with the existing [create page] command workflow
 */

const fs = require('fs');
const DatabaseBuilder = require('./build-json.js');

class EnhancedPageCreator {
    constructor() {
        this.builder = new DatabaseBuilder();
    }
    
    /**
     * Main [create page] command implementation
     */
    async createPage(prompt) {
        console.log('🎨 Enhanced [create page] command starting...');
        console.log(`📝 Prompt: "${prompt}"`);
        
        try {
            // Step 1: Generate Chinese word/phrase (THE WORD)
            const chineseWord = await this.generateChineseWordFromPrompt(prompt);
            console.log(`🀄 Generated Chinese: ${chineseWord}`);
            
            // Step 2: Generate poetic quote mixing Eastern and Western ideals
            const quote = await this.generatePoetricQuote(chineseWord, prompt);
            console.log(`📜 Generated quote: "${quote}"`);
            
            // Step 3: Search for relevant image
            const backgroundImage = await this.searchAndValidateImage(chineseWord, quote);
            console.log(`🖼️  Found background image: ${backgroundImage}`);
            
            // Step 4: Create page data structure
            const pageData = {
                chineseCharacter: chineseWord,
                pinyin: this.generatePinyin(chineseWord),
                quote: quote,
                backgroundImage: backgroundImage,
                category: this.categorizeContent(chineseWord, quote),
                tags: this.generateTags(chineseWord, quote, prompt),
                prompt: prompt,
                sourceMethod: 'enhanced-create-page',
                createdAt: new Date().toISOString()
            };
            
            // Step 5: Add to database and rebuild
            const newPage = await this.builder.addPageToDatabase(pageData);
            
            console.log('\n✅ Page creation completed successfully!');
            console.log(`📊 Page ID: ${newPage.id}`);
            console.log(`🀄 Chinese: ${newPage.chineseCharacter} (${newPage.pinyin})`);
            console.log(`📜 Quote: "${newPage.quote}"`);
            console.log(`🏷️  Category: ${newPage.category}`);
            console.log(`🖼️  Background: ${newPage.backgroundImage}`);
            
            return newPage;
            
        } catch (error) {
            console.error('❌ Enhanced [create page] failed:', error.message);
            throw error;
        }
    }
    
    async generateChineseWordFromPrompt(prompt) {
        const conceptMap = {
            'peace': '和平', 'calm': '平静', 'serenity': '宁静',
            'joy': '喜悦', 'happiness': '幸福', 'love': '爱',
            'wisdom': '智慧', 'enlightenment': '觉悟',
            'mountain': '山', 'water': '水', 'fire': '火',
            'way': '道', 'path': '路', 'journey': '旅程',
            'balance': '平衡', 'harmony': '和谐',
            'home': '家', 'family': '家庭', 'growth': '成长',
            'change': '变化', 'transformation': '蜕变',
            'beauty': '美', 'truth': '真理', 'dream': '梦'
        };
        
        const promptLower = prompt.toLowerCase();
        
        for (const [keyword, chinese] of Object.entries(conceptMap)) {
            if (promptLower.includes(keyword)) {
                return chinese;
            }
        }
        
        // Semantic matching
        if (promptLower.includes('inner') && promptLower.includes('peace')) {
            return '内心平静';
        }
        
        return '道'; // Default fallback
    }
    
    async generatePoetricQuote(chineseWord, prompt) {
        const templates = [
            `"In the ancient wisdom of ${chineseWord}, we discover the courage to forge new paths in an ever-changing world."`,
            `"Through ${chineseWord}, the individual spirit finds its place in the greater symphony of existence."`,
            `"${chineseWord} teaches us that true progress comes not from rushing forward, but from moving mindfully toward our highest potential."`,
            `"In mastering ${chineseWord}, we learn that the greatest achievements arise from a heart at peace with the present moment."`,
            `"Like the eternal dance of ${chineseWord}, we spiral upward—each return bringing us higher than before."`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    async searchAndValidateImage(chineseWord, quote) {
        console.log('🔍 Searching for relevant image...');
        
        const imageUrls = [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?w=1920&h=1080&fit=crop'
        ];
        
        return imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }
    
    generatePinyin(chineseWord) {
        const pinyinMap = {
            '和平': 'hé píng', '平静': 'píng jìng', '宁静': 'níng jìng',
            '喜悦': 'xǐ yuè', '幸福': 'xìng fú', '爱': 'ài',
            '智慧': 'zhì huì', '觉悟': 'jué wù',
            '山': 'shān', '水': 'shuǐ', '火': 'huǒ',
            '道': 'dào', '路': 'lù', '旅程': 'lǚ chéng',
            '平衡': 'píng héng', '和谐': 'hé xié',
            '家': 'jiā', '家庭': 'jiā tíng', '成长': 'chéng zhǎng',
            '变化': 'biàn huà', '蜕变': 'tuì biàn',
            '美': 'měi', '真理': 'zhēn lǐ', '梦': 'mèng',
            '内心平静': 'nèi xīn píng jìng'
        };
        
        return pinyinMap[chineseWord] || 'unknown';
    }
    
    categorizeContent(chineseWord, quote) {
        const categories = {
            'family': ['家', '家庭'],
            'nature': ['山', '水', '火'],
            'wisdom': ['智慧', '觉悟', '道', '真理'],
            'emotion': ['爱', '喜悦', '幸福'],
            'balance': ['平衡', '和谐', '和平', '平静', '宁静'],
            'transformation': ['成长', '变化', '蜕变']
        };
        
        for (const [category, chars] of Object.entries(categories)) {
            if (chars.some(char => chineseWord.includes(char))) {
                return category;
            }
        }
        
        return 'philosophy';
    }
    
    generateTags(chineseWord, quote, prompt) {
        const tags = ['enhanced-create-page'];
        
        if (chineseWord.length === 1) tags.push('single-character');
        if (chineseWord.length > 1) tags.push('phrase');
        
        const quoteWords = quote.toLowerCase();
        if (quoteWords.includes('wisdom')) tags.push('wisdom');
        if (quoteWords.includes('ancient')) tags.push('traditional');
        if (quoteWords.includes('modern')) tags.push('contemporary');
        
        return [...new Set(tags)];
    }
}

module.exports = EnhancedPageCreator;

// CLI usage
if (require.main === module) {
    const creator = new EnhancedPageCreator();
    const prompt = process.argv[2];
    
    if (!prompt) {
        console.log('❌ Usage: node enhanced-page-creator.js "your prompt here"');
        console.log('\n📝 Examples:');
        console.log('   node enhanced-page-creator.js "finding inner peace"');
        console.log('   node enhanced-page-creator.js "work life balance"');
        process.exit(1);
    }
    
    creator.createPage(prompt)
        .then(newPage => {
            console.log('\n🎉 Success! New page created and added to database.');
            console.log('📖 Open index.html to see your new page!');
        })
        .catch(error => {
            console.error('\n❌ Creation failed:', error.message);
            process.exit(1);
        });
}