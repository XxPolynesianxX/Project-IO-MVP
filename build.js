/**
 * Build Script for Project IO MVP
 * This script helps you integrate your 300 pages into the main index.html file
 * 
 * Usage:
 * 1. Put your page files (page1.html, page2.html, etc.) in the 'content' folder
 * 2. Run: node build.js
 * 3. Your index.html will be updated with all pages
 */

const fs = require('fs');
const path = require('path');

class ProjectIOBuilder {
    constructor() {
        this.contentDir = './content';
        this.templateFile = './index.html';
        this.outputFile = './index.html';
        this.totalPages = 0;
    }
    
    async build() {
        console.log('🚀 Building Project IO MVP...');
        
        try {
            // Check if content directory exists
            if (!fs.existsSync(this.contentDir)) {
                console.log('📁 Creating content directory...');
                fs.mkdirSync(this.contentDir);
                this.createSamplePages();
                return; // Exit, user can run build again
            }
            
            // Get all page files
            const pageFiles = this.getPageFiles();
            console.log(`📄 Found ${pageFiles.length} page files`);
            
            if (pageFiles.length === 0) {
                console.log('⚠️  No page files found. Creating sample pages...');
                this.createSamplePages();
                return this.build(); // Rebuild after creating samples
            }
            
            // Generate combined content
            const combinedContent = this.generateCombinedContent(pageFiles);
            
            // Update index.html
            this.updateIndexFile(combinedContent, pageFiles.length);
            
            // Update JavaScript file with correct total pages
            this.updateJavaScript(pageFiles.length);
            
            console.log('✅ Build completed successfully!');
            console.log(`📊 Total pages: ${pageFiles.length}`);
            console.log('🌐 Open index.html in your browser to view the result');
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
        }
    }
    
    getPageFiles() {
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
    
    generateCombinedContent(pageFiles) {
        let combinedContent = '';
        
        pageFiles.forEach((file, index) => {
            const pageNumber = index + 1;
            const filePath = path.join(this.contentDir, file);
            
            try {
                let pageContent = fs.readFileSync(filePath, 'utf8');
                
                // Clean up the content (remove html, head, body tags if present)
                pageContent = this.cleanPageContent(pageContent);
                
                combinedContent += `
            <div class="page-section" id="page-${pageNumber}">
                <div class="page-content">
                    ${pageContent}
                </div>
            </div>`;
                
            } catch (error) {
                console.warn(`⚠️  Could not read ${file}:`, error.message);
            }
        });
        
        return combinedContent;
    }
    
    cleanPageContent(content) {
        // Remove common HTML wrapper tags
        content = content.replace(/<\/?html[^>]*>/gi, '');
        content = content.replace(/<\/?head[^>]*>[\s\S]*?<\/head>/gi, '');
        content = content.replace(/<\/?body[^>]*>/gi, '');
        content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
        
        // Clean up whitespace
        content = content.trim();
        
        return content;
    }
    
    updateIndexFile(combinedContent, totalPages) {
        let indexContent = fs.readFileSync(this.templateFile, 'utf8');
        
        // Replace the placeholder comment with actual content
        const placeholder = '<!-- CONTENT_PLACEHOLDER - Replace this comment with your 300 pages -->';
        
        if (indexContent.includes(placeholder)) {
            indexContent = indexContent.replace(placeholder, combinedContent);
        } else {
            // If placeholder not found, try to find existing content and replace
            const contentRegex = /<div id="content-container">[\s\S]*?<\/div>/;
            const replacement = `<div id="content-container">${combinedContent}
        </div>`;
            
            if (contentRegex.test(indexContent)) {
                indexContent = indexContent.replace(contentRegex, replacement);
            } else {
                console.warn('⚠️  Could not find content container to replace');
                return;
            }
        }
        
        // Update page counter in HTML
        indexContent = indexContent.replace(
            /(<span id="page-counter">)1 \/ \d+(<\/span>)/,
            `$1 1 / ${totalPages}$2`
        );
        
        fs.writeFileSync(this.outputFile, indexContent);
        console.log('✅ Updated index.html with page content');
    }
    
    updateJavaScript(totalPages) {
        const jsFile = './js/script.js';
        
        if (!fs.existsSync(jsFile)) {
            console.warn('⚠️  JavaScript file not found, skipping JS update');
            return;
        }
        
        let jsContent = fs.readFileSync(jsFile, 'utf8');
        
        // Update the totalPages property in the SimpleScroller constructor
        jsContent = jsContent.replace(
            /this\.totalPages = \d+;/,
            `this.totalPages = ${totalPages};`
        );
        
        fs.writeFileSync(jsFile, jsContent);
        console.log('✅ Updated JavaScript with correct total pages');
    }
    
    createSamplePages() {
        console.log('📝 Creating sample pages...');
        
        const samplePages = [
            {
                content: `
                    <h1>Welcome to Project IO</h1>
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
                    </div>
                `
            },
            {
                content: `
                    <h1>📱 Navigation Controls</h1>
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

                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📱 Touch Controls</h3>
                        <p>On mobile devices:</p>
                        <ul style="text-align: left;">
                            <li><strong>Swipe Up</strong> - Next page</li>
                            <li><strong>Swipe Down</strong> - Previous page</li>
                            <li><strong>Natural scrolling</strong> also works!</li>
                        </ul>
                    </div>

                    <button onclick="alert('Interactive elements work perfectly!')" style="padding: 15px 30px; font-size: 1.1rem; background: #4ecdc4; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        Try This Button!
                    </button>
                `
            },
            {
                content: `
                    <h1>🎨 Customization Options</h1>
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
                    </p>
                `
            }
        ];
        
        // Create sample pages for demonstration
        samplePages.forEach((page, index) => {
            const pageNum = index + 1;
            fs.writeFileSync(
                path.join(this.contentDir, `page${pageNum}.html`),
                page.content
            );
        });
        
        console.log(`✅ Created ${samplePages.length} sample pages in the content folder`);
        console.log('📝 Edit these files or add your own page1.html, page2.html, etc.');
    }
    
    // Method to add a new page
    addPage(pageNumber, content) {
        const fileName = `page${pageNumber}.html`;
        const filePath = path.join(this.contentDir, fileName);
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Added ${fileName}`);
    }
    
    // Method to remove a page
    removePage(pageNumber) {
        const fileName = `page${pageNumber}.html`;
        const filePath = path.join(this.contentDir, fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Removed ${fileName}`);
        } else {
            console.log(`⚠️  ${fileName} not found`);
        }
    }
    
    // Method to list all pages
    listPages() {
        const pageFiles = this.getPageFiles();
        console.log(`📋 Found ${pageFiles.length} pages:`);
        pageFiles.forEach(file => console.log(`   - ${file}`));
        return pageFiles;
    }
}

// Export for use as module
module.exports = ProjectIOBuilder;

// Run the builder if called directly
if (require.main === module) {
    const builder = new ProjectIOBuilder();
    
    // Check for command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Default: build the project
        builder.build();
    } else if (args[0] === 'list') {
        // List all pages
        builder.listPages();
    } else if (args[0] === 'add' && args[1] && args[2]) {
        // Add a new page: node build.js add 4 "<h1>New Page</h1>"
        const pageNum = parseInt(args[1]);
        const content = args[2];
        builder.addPage(pageNum, content);
        console.log('💡 Run "node build.js" to rebuild with new content');
    } else if (args[0] === 'remove' && args[1]) {
        // Remove a page: node build.js remove 4
        const pageNum = parseInt(args[1]);
        builder.removePage(pageNum);
        console.log('💡 Run "node build.js" to rebuild after removal');
    } else {
        console.log('📖 Usage:');
        console.log('   node build.js          - Build the project');
        console.log('   node build.js list     - List all pages');
        console.log('   node build.js add <num> "<content>" - Add a new page');
        console.log('   node build.js remove <num> - Remove a page');
    }
}