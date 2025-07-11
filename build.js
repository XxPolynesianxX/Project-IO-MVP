/**
 * Project IO MVP - Robust Build System
 * Completely refactored to fix duplicate content accumulation issues
 * 
 * Key Features:
 * - Clean template-based approach (no content accumulation)
 * - Robust error handling and validation
 * - Backup and recovery systems
 * - Proper content replacement with unique placeholders
 * - Detailed logging and debugging information
 * 
 * Usage:
 * node build.js              - Build project from content files
 * node build.js clean        - Clean and rebuild from template
 * node build.js validate     - Validate current state
 * node build.js backup       - Create backup of current index.html
 * node build.js restore      - Restore from backup
 */

const fs = require('fs');
const path = require('path');

class RobustProjectBuilder {
    constructor() {
        this.contentDir = './content';
        this.templateFile = './template.html';
        this.outputFile = './index.html';
        this.backupFile = './index-backup.html';
        this.jsFile = './js/script.js';
        
        // Unique placeholders that won't conflict with content
        this.contentPlaceholder = '{{CONTENT_PLACEHOLDER}}';
        this.totalPagesPlaceholder = '{{TOTAL_PAGES}}';
        
        this.logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
    }
    
    log(level, message, ...args) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        if (levels[level] >= levels[this.logLevel]) {
            const timestamp = new Date().toISOString().substr(11, 8);
            console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, ...args);
        }
    }
    
    async build() {
        this.log('info', '🚀 Starting robust build process...');
        
        try {
            // Step 1: Validate environment
            await this.validateEnvironment();
            
            // Step 2: Create backup
            await this.createBackup();
            
            // Step 3: Get page files
            const pageFiles = await this.getPageFiles();
            this.log('info', `📄 Found ${pageFiles.length} page files`);
            
            if (pageFiles.length === 0) {
                this.log('warn', '⚠️  No page files found, creating samples...');
                await this.createSamplePages();
                return this.build(); // Rebuild after creating samples
            }
            
            // Step 4: Validate page files
            await this.validatePageFiles(pageFiles);
            
            // Step 5: Generate content
            const combinedContent = await this.generateCombinedContent(pageFiles);
            
            // Step 6: Build from template
            await this.buildFromTemplate(combinedContent, pageFiles.length);
            
            // Step 7: Update JavaScript
            await this.updateJavaScript(pageFiles.length);
            
            // Step 8: Validate result
            await this.validateResult(pageFiles.length);
            
            this.log('info', '✅ Build completed successfully!');
            this.log('info', `📊 Total pages: ${pageFiles.length}`);
            this.log('info', '🌐 Open index.html in your browser to view the result');
            
        } catch (error) {
            this.log('error', '❌ Build failed:', error.message);
            await this.handleBuildError(error);
            throw error;
        }
    }
    
    async validateEnvironment() {
        this.log('debug', '🔍 Validating environment...');
        
        // Check if template exists
        if (!fs.existsSync(this.templateFile)) {
            throw new Error(`Template file not found: ${this.templateFile}`);
        }
        
        // Check if template has required placeholders
        const templateContent = fs.readFileSync(this.templateFile, 'utf8');
        if (!templateContent.includes(this.contentPlaceholder)) {
            throw new Error(`Template missing content placeholder: ${this.contentPlaceholder}`);
        }
        if (!templateContent.includes(this.totalPagesPlaceholder)) {
            throw new Error(`Template missing total pages placeholder: ${this.totalPagesPlaceholder}`);
        }
        
        // Create content directory if it doesn't exist
        if (!fs.existsSync(this.contentDir)) {
            this.log('info', '📁 Creating content directory...');
            fs.mkdirSync(this.contentDir, { recursive: true });
        }
        
        this.log('debug', '✅ Environment validation passed');
    }
    
    async createBackup() {
        if (fs.existsSync(this.outputFile)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `./backups/index-${timestamp}.html`;
            
            // Create backups directory if it doesn't exist
            if (!fs.existsSync('./backups')) {
                fs.mkdirSync('./backups', { recursive: true });
            }
            
            fs.copyFileSync(this.outputFile, backupPath);
            fs.copyFileSync(this.outputFile, this.backupFile); // Also create standard backup
            this.log('info', `💾 Backup created: ${backupPath}`);
        }
    }
    
    async getPageFiles() {
        if (!fs.existsSync(this.contentDir)) {
            return [];
        }
        
        const files = fs.readdirSync(this.contentDir);
        const pageFiles = files
            .filter(file => file.match(/^page\d+\.html$/))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });
        
        this.log('debug', 'Page files found:', pageFiles);
        return pageFiles;
    }
    
    async validatePageFiles(pageFiles) {
        this.log('debug', '🔍 Validating page files...');
        
        const invalidFiles = [];
        
        for (const file of pageFiles) {
            const filePath = path.join(this.contentDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.trim().length === 0) {
                    invalidFiles.push(`${file}: Empty file`);
                }
            } catch (error) {
                invalidFiles.push(`${file}: ${error.message}`);
            }
        }
        
        if (invalidFiles.length > 0) {
            this.log('warn', '⚠️  Invalid page files found:');
            invalidFiles.forEach(issue => this.log('warn', `   - ${issue}`));
        }
        
        this.log('debug', '✅ Page file validation completed');
    }
    
    async generateCombinedContent(pageFiles) {
        this.log('debug', '🔄 Generating combined content...');
        
        let combinedContent = '';
        
        for (const [index, file] of pageFiles.entries()) {
            const pageNumber = index + 1;
            const filePath = path.join(this.contentDir, file);
            
            try {
                let pageContent = fs.readFileSync(filePath, 'utf8');
                
                // Clean up the content
                pageContent = this.cleanPageContent(pageContent);
                
                // Validate content is not empty after cleaning
                if (pageContent.trim().length === 0) {
                    this.log('warn', `⚠️  Page ${pageNumber} is empty after cleaning`);
                    pageContent = `<h2>Page ${pageNumber}</h2><p>This page is empty. Add content to ${file}</p>`;
                }
                
                combinedContent += `\n            <div class=\"page-section\" id=\"page-${pageNumber}\">\n                <div class=\"page-content\">\n                    ${pageContent}\n                </div>\n            </div>`;
                
                this.log('debug', `✅ Processed page ${pageNumber}: ${file}`);
                
            } catch (error) {
                this.log('error', `❌ Error processing ${file}:`, error.message);
                // Add placeholder content for failed pages
                combinedContent += `\n            <div class=\"page-section\" id=\"page-${pageNumber}\">\n                <div class=\"page-content\">\n                    <h2>Error Loading Page ${pageNumber}</h2>\n                    <p>Could not load content from ${file}</p>\n                    <p>Error: ${error.message}</p>\n                </div>\n            </div>`;
            }
        }
        
        this.log('debug', '✅ Combined content generated');
        return combinedContent;
    }
    
    cleanPageContent(content) {
        // Remove common HTML wrapper tags but preserve inner structure
        const originalLength = content.length;
        
        content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
        content = content.replace(/<\/?html[^>]*>/gi, '');
        content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
        content = content.replace(/<\/?body[^>]*>/gi, '');
        
        // Clean up excessive whitespace while preserving intended formatting
        content = content.replace(/^\s*\n/gm, ''); // Remove empty lines at start
        content = content.replace(/\n\s*$/gm, ''); // Remove trailing whitespace
        content = content.trim();
        
        this.log('debug', `Cleaned content: ${originalLength} → ${content.length} characters`);
        return content;
    }
    
    async buildFromTemplate(combinedContent, totalPages) {
        this.log('debug', '🏗️  Building from template...');
        
        // Read template (always use the clean template)
        let indexContent = fs.readFileSync(this.templateFile, 'utf8');
        
        // Replace placeholders
        indexContent = indexContent.replace(this.contentPlaceholder, combinedContent);
        indexContent = indexContent.replace(new RegExp(this.totalPagesPlaceholder, 'g'), totalPages);
        
        // Validate the replacement worked
        if (indexContent.includes(this.contentPlaceholder)) {
            throw new Error('Failed to replace content placeholder');
        }
        if (indexContent.includes(this.totalPagesPlaceholder)) {
            throw new Error('Failed to replace total pages placeholder');
        }
        
        // Write the final file
        fs.writeFileSync(this.outputFile, indexContent);
        
        this.log('debug', '✅ Built index.html from template');
    }
    
    async updateJavaScript(totalPages) {
        this.log('debug', '🔄 Updating JavaScript...');
        
        if (!fs.existsSync(this.jsFile)) {
            this.log('warn', '⚠️  JavaScript file not found, skipping JS update');
            return;
        }
        
        let jsContent = fs.readFileSync(this.jsFile, 'utf8');
        
        // Update the totalPages property
        const originalContent = jsContent;
        jsContent = jsContent.replace(
            /this\.totalPages\s*=\s*\d+\s*;/,
            `this.totalPages = ${totalPages};`
        );
        
        if (jsContent === originalContent) {
            this.log('warn', '⚠️  Could not find totalPages property in JavaScript');
        } else {
            fs.writeFileSync(this.jsFile, jsContent);
            this.log('debug', '✅ JavaScript updated with correct total pages');
        }
    }
    
    async validateResult(expectedPages) {
        this.log('debug', '🔍 Validating build result...');
        
        if (!fs.existsSync(this.outputFile)) {
            throw new Error('Output file was not created');
        }
        
        const content = fs.readFileSync(this.outputFile, 'utf8');
        
        // Count page sections
        const pageSections = content.match(/<div class="page-section" id="page-\d+"/g);
        const actualPages = pageSections ? pageSections.length : 0;
        
        if (actualPages !== expectedPages) {
            throw new Error(`Page count mismatch: expected ${expectedPages}, found ${actualPages}`);
        }
        
        // Check for duplicate IDs
        const pageIds = content.match(/id="page-\d+"/g);
        const uniqueIds = new Set(pageIds);
        if (pageIds.length !== uniqueIds.size) {
            throw new Error('Duplicate page IDs found in output');
        }
        
        // Validate structure
        const contentContainerCount = (content.match(/<div id="content-container">/g) || []).length;
        if (contentContainerCount !== 1) {
            throw new Error(`Invalid content container count: ${contentContainerCount}`);
        }
        
        this.log('debug', '✅ Build result validation passed');
        this.log('info', `📊 Validated ${actualPages} pages with unique IDs`);
    }
    
    async handleBuildError(error) {
        this.log('error', '🔧 Attempting error recovery...');
        
        // If backup exists, offer to restore
        if (fs.existsSync(this.backupFile)) {
            this.log('info', '💾 Backup file available for restoration');
            this.log('info', 'Run "node build.js restore" to restore from backup');
        }
        
        // Provide debugging information
        this.log('error', 'Build error details:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
    
    async clean() {
        this.log('info', '🧹 Cleaning and rebuilding from template...');
        
        if (fs.existsSync(this.outputFile)) {
            await this.createBackup();
        }
        
        // Copy template to index.html as starting point
        fs.copyFileSync(this.templateFile, this.outputFile);
        this.log('info', '✅ Reset to clean template');
        
        // Now build normally
        await this.build();
    }
    
    async validate() {
        this.log('info', '🔍 Validating current project state...');
        
        const issues = [];
        
        // Check template
        if (!fs.existsSync(this.templateFile)) {
            issues.push('❌ Template file missing');
        }
        
        // Check content directory
        if (!fs.existsSync(this.contentDir)) {
            issues.push('❌ Content directory missing');
        } else {
            const pageFiles = await this.getPageFiles();
            this.log('info', `📄 Found ${pageFiles.length} page files`);
        }
        
        // Check index.html
        if (!fs.existsSync(this.outputFile)) {
            issues.push('❌ Index.html missing');
        } else {
            const content = fs.readFileSync(this.outputFile, 'utf8');
            
            // Check for placeholders (should not exist in built file)
            if (content.includes(this.contentPlaceholder)) {
                issues.push('⚠️  Content placeholder still present in index.html');
            }
            if (content.includes(this.totalPagesPlaceholder)) {
                issues.push('⚠️  Total pages placeholder still present in index.html');
            }
            
            // Count pages
            const pageSections = content.match(/<div class="page-section" id="page-\d+"/g);
            const pageCount = pageSections ? pageSections.length : 0;
            this.log('info', `📊 Index.html contains ${pageCount} pages`);
            
            // Check for duplicates
            const pageIds = content.match(/id="page-\d+"/g);
            const uniqueIds = new Set(pageIds);
            if (pageIds && pageIds.length !== uniqueIds.size) {
                issues.push('❌ Duplicate page IDs found');
            }
        }
        
        if (issues.length === 0) {
            this.log('info', '✅ Project validation passed - everything looks good!');
        } else {
            this.log('warn', '⚠️  Validation issues found:');
            issues.forEach(issue => this.log('warn', `   ${issue}`));
            this.log('info', '💡 Run "node build.js clean" to fix issues');
        }
        
        return issues.length === 0;
    }
    
    async restore() {
        if (!fs.existsSync(this.backupFile)) {
            this.log('error', '❌ No backup file found');
            return;
        }
        
        fs.copyFileSync(this.backupFile, this.outputFile);
        this.log('info', '✅ Restored index.html from backup');
    }
    
    async createSamplePages() {
        this.log('info', '📝 Creating sample pages...');
        
        const samplePages = [
            {
                content: `<h1>Welcome to Project IO</h1>
<p>This is your first page of content!</p>
<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h2>🚀 Getting Started</h2>
    <p>Replace this content with your own by editing the files in the content/ folder.</p>
    <p>Each page can contain any HTML content you want:</p>
    <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
        <li>Text and headings</li>
        <li>Images and videos</li>
        <li>Interactive elements</li>
        <li>Custom styling</li>
    </ul>
</div>`
            },
            {
                content: `<h1>📱 Navigation Controls</h1>
<p>Try out these different ways to navigate:</p>

<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>🎮 Keyboard Controls</h3>
    <ul style="text-align: left;">
        <li><strong>↓ Arrow Down</strong> - Next page</li>
        <li><strong>↑ Arrow Up</strong> - Previous page</li>
        <li><strong>Spacebar</strong> - Next page</li>
        <li><strong>Home</strong> - First page</li>
        <li><strong>End</strong> - Last page</li>
    </ul>
</div>

<button onclick="alert('Interactive elements work perfectly!')" style="padding: 15px 30px; font-size: 1.1rem; background: #4ecdc4; color: white; border: none; border-radius: 25px; cursor: pointer;">
    Try This Button!
</button>`
            },
            {
                content: `<h1>🎨 Customization Options</h1>
<p>Your Project IO MVP is highly customizable!</p>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
        <h3>🎨 Styling</h3>
        <p>Edit <code>css/styles.css</code> to change colors, fonts, and animations.</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 15px;">
        <h3>⚡ Functionality</h3>
        <p>Modify <code>js/script.js</code> to add new features and behaviors.</p>
    </div>
</div>

<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>📝 Adding Your Content</h3>
    <ol style="text-align: left; max-width: 500px; margin: 0 auto;">
        <li>Put your HTML files in the <code>content/</code> folder</li>
        <li>Name them <code>page1.html</code>, <code>page2.html</code>, etc.</li>
        <li>Run <code>node build.js</code> to combine them</li>
        <li>Refresh your browser to see the changes!</li>
    </ol>
</div>

<p style="margin-top: 30px; font-size: 1.1rem; opacity: 0.8;">
    Ready to add your 300 pages? Check out the README.md for detailed instructions!
</p>`
            }
        ];
        
        samplePages.forEach((page, index) => {
            const pageNum = index + 1;
            const filePath = path.join(this.contentDir, `page${pageNum}.html`);
            fs.writeFileSync(filePath, page.content);
        });
        
        this.log('info', `✅ Created ${samplePages.length} sample pages`);
    }
}

// Export for use as module
module.exports = RobustProjectBuilder;

// Command line interface
if (require.main === module) {
    const builder = new RobustProjectBuilder();
    const command = process.argv[2] || 'build';
    
    async function main() {
        try {
            switch (command) {
                case 'build':
                    await builder.build();
                    break;
                case 'clean':
                    await builder.clean();
                    break;
                case 'validate':
                    await builder.validate();
                    break;
                case 'backup':
                    await builder.createBackup();
                    console.log('✅ Backup created');
                    break;
                case 'restore':
                    await builder.restore();
                    break;
                case 'debug':
                    builder.logLevel = 'debug';
                    await builder.build();
                    break;
                default:
                    console.log('📖 Usage:');
                    console.log('   node build.js                - Build project');
                    console.log('   node build.js clean          - Clean and rebuild');
                    console.log('   node build.js validate       - Validate project');
                    console.log('   node build.js backup         - Create backup');
                    console.log('   node build.js restore        - Restore from backup');
                    console.log('   node build.js debug          - Build with debug logging');
            }
        } catch (error) {
            console.error('❌ Command failed:', error.message);
            process.exit(1);
        }
    }
    
    main();
}