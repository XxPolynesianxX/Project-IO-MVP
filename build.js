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
            }
            
            // Get all page files
            const pageFiles = this.getPageFiles();
            console.log(`📄 Found ${pageFiles.length} page files`);
            
            if (pageFiles.length === 0) {
                console.log('⚠️  No page files found. Creating sample pages...');
                this.createSamplePages();
                return;
            }
            
            // Generate combined content
            const combinedContent = this.generateCombinedContent(pageFiles);
            
            // Update index.html
            this.updateIndexFile(combinedContent, pageFiles.length);
            
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
        indexContent = indexContent.replace(placeholder, combinedContent);
        
        // Update the total pages in JavaScript
        indexContent = indexContent.replace(
            'this.totalPages = 3;',
            `this.totalPages = ${totalPages};`
        );
        
        // Update page counter in HTML
        indexContent = indexContent.replace(
            '<span id="page-counter">1 / 3</span>',
            `<span id="page-counter">1 / ${totalPages}</span>`
        );
        
        fs.writeFileSync(this.outputFile, indexContent);
    }
    
    createSamplePages() {
        console.log('📝 Creating sample pages...');
        
        // Create sample pages for demonstration
        for (let i = 1; i <= 5; i++) {
            const sampleContent = `
                <h1>Page ${i}</h1>
                <p>This is sample content for page ${i}.</p>
                <div class="sample-content">
                    <h2>Sample Section</h2>
                    <p>Replace this with your actual content.</p>
                    <p>You can include:</p>
                    <ul>
                        <li>Text and headings</li>
                        <li>Images and videos</li>
                        <li>Interactive elements</li>
                        <li>Any HTML content</li>
                    </ul>
                </div>
            `;
            
            fs.writeFileSync(
                path.join(this.contentDir, `page${i}.html`),
                sampleContent
            );
        }
        
        console.log('✅ Created 5 sample pages in the content folder');
        console.log('📝 Edit these files or add your own page1.html, page2.html, etc.');
    }
}

// Run the builder
if (require.main === module) {
    const builder = new ProjectIOBuilder();
    builder.build();
}

module.exports = ProjectIOBuilder;