const fs = require('fs');
const path = require('path');

// Simulate the build process manually
console.log('🚀 Testing manual build process...');

// Read content files
const contentDir = './content';
const files = fs.readdirSync(contentDir);
const pageFiles = files
    .filter(file => file.match(/^page\d+\.html$/))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
    });

console.log(`📄 Found ${pageFiles.length} page files:`, pageFiles);

// Generate combined content
let combinedContent = '';
pageFiles.forEach((file, index) => {
    const pageNumber = index + 1;
    const filePath = path.join(contentDir, file);
    
    let pageContent = fs.readFileSync(filePath, 'utf8');
    
    // Clean up the content
    pageContent = pageContent.replace(/<\/?html[^>]*>/gi, '');
    pageContent = pageContent.replace(/<\/?head[^>]*>[\s\S]*?<\/head>/gi, '');
    pageContent = pageContent.replace(/<\/?body[^>]*>/gi, '');
    pageContent = pageContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    pageContent = pageContent.trim();
    
    combinedContent += `
            <div class="page-section" id="page-${pageNumber}">
                <div class="page-content">
                    ${pageContent}
                </div>
            </div>`;
});

console.log('✅ Generated combined content successfully');
console.log(`📏 Content length: ${combinedContent.length} characters`);

// Show first 300 characters as preview
console.log('🔍 Content preview:');
console.log(combinedContent.substring(0, 300) + '...');