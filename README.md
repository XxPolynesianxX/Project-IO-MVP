# Project IO MVP

A simple, Instagram-like scrolling experience for your 300 pages of content.

## 🚀 Quick Start

1. **Test the demo:**
   - Open `index.html` in your browser
   - Use arrow keys, spacebar, or scroll to navigate
   - Try the navigation buttons in the bottom-right

2. **Add your content:**
   - Put your page files in the `content/` folder as `page1.html`, `page2.html`, etc.
   - Run the build script: `node build.js`
   - Refresh your browser

## 📁 File Structure

```
Project IO MVP/
├── index.html          # Main app file
├── build.js            # Build script to integrate your pages
├── css/
│   └── styles.css      # All styling
├── js/
│   └── script.js       # Navigation logic
├── content/            # Put your page files here
│   ├── page1.html
│   ├── page2.html
│   └── ...
└── assets/             # Images, videos, etc.
```

## 🎮 Navigation

- **Scroll**: Natural scrolling up/down
- **Arrow Keys**: ↑ Previous page, ↓ Next page
- **Spacebar**: Next page
- **Home/End**: Jump to first/last page
- **Touch**: Swipe up/down on mobile
- **Buttons**: Use the navigation controls

## 🔧 Adding Your 300 Pages

### Method 1: Use the Build Script (Recommended)

1. Put your page files in the `content/` folder:
   ```
   content/
   ├── page1.html
   ├── page2.html
   ├── page3.html
   └── ... (up to page300.html)
   ```

2. Run the build script:
   ```bash
   node build.js
   ```

3. The script will:
   - Combine all your pages into `index.html`
   - Update the page counter
   - Clean up any extra HTML tags

### Method 2: Manual Integration

1. Open `index.html`
2. Find the comment: `<!-- CONTENT_PLACEHOLDER -->`
3. Replace it with your page sections:
   ```html
   <div class="page-section" id="page-4">
       <div class="page-content">
           <!-- Your page 4 content -->
       </div>
   </div>
   ```

4. Update the JavaScript:
   - Change `this.totalPages = 3;` to `this.totalPages = 300;`
   - Update the page counter in HTML

## 📄 Page Content Format

Each page file should contain just the content (no full HTML structure):

```html
<!-- page1.html -->
<h1>My Page Title</h1>
<p>Some content here...</p>
<img src="assets/image.jpg" alt="Description">
<div class="custom-section">
    <h2>More content</h2>
    <p>Additional text...</p>
</div>
```

## 🎨 Customization

### Colors and Styling
Edit `css/styles.css` to change:
- Background gradients
- Colors and fonts
- Navigation button styles
- Progress bar appearance

### Page Transitions
Modify `js/script.js` to adjust:
- Scroll behavior
- Animation timing
- Navigation sensitivity

### Adding Features
You can easily add:
- Auto-scroll timer
- Bookmark system
- Search functionality
- Social sharing
- Analytics tracking

## 📱 Mobile Experience

The app is optimized for mobile doom-scrolling:
- Touch gestures (swipe up/down)
- Responsive design
- Smooth momentum scrolling
- Hidden scrollbars for clean look

## 🐛 Troubleshooting

**Build script not working?**
- Make sure you have Node.js installed
- Check that your page files are named correctly (`page1.html`, `page2.html`, etc.)

**Navigation not smooth?**
- Check browser compatibility (modern browsers work best)
- Disable browser extensions that might interfere

**Content not loading?**
- Verify file paths in your HTML
- Check browser console for errors

## 🚀 Performance Tips

For 300 pages:
- Keep images optimized (use WebP format)
- Lazy load heavy content
- Consider breaking into smaller chunks if performance issues arise

## 📈 Next Steps

Once your MVP is working, you could add:
- Server-side rendering for better SEO
- Dynamic content loading for larger datasets
- User accounts and bookmarking
- Analytics and engagement tracking
- Social features

---

**Need help?** Open an issue or check the console for debug messages!

## 🎯 Features Included

✅ **Smooth Scrolling** - Instagram-like experience  
✅ **Keyboard Navigation** - Arrow keys, spacebar support  
✅ **Touch Gestures** - Mobile swipe navigation  
✅ **Progress Tracking** - Visual progress bar and counter  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Build Script** - Easy integration of your 300 pages  
✅ **No Dependencies** - Pure HTML, CSS, JavaScript  
✅ **Fast Loading** - All content loads at once for instant navigation  

## 🎨 Example Page Content

Here's what your page files might look like:

```html
<!-- page1.html -->
<h1>Welcome to My Story</h1>
<p>This is the beginning of an amazing journey...</p>
<img src="assets/hero-image.jpg" alt="Hero Image" style="max-width: 100%; border-radius: 10px;">

<!-- page2.html -->
<div style="text-align: center;">
    <h1>Chapter 1: The Discovery</h1>
    <p>It was a dark and stormy night when everything changed...</p>
    <video controls style="max-width: 100%; border-radius: 10px;">
        <source src="assets/intro-video.mp4" type="video/mp4">
    </video>
</div>

<!-- page3.html -->
<h1>Interactive Elements</h1>
<p>You can add any HTML content:</p>
<button onclick="alert('Hello from page 3!')" style="padding: 10px 20px; font-size: 1rem;">Click Me!</button>
<br><br>
<input type="text" placeholder="Enter your thoughts..." style="padding: 10px; width: 300px; max-width: 100%;">
```

## 🔄 Auto-Build Workflow

For continuous development, you can set up a watch script:

```javascript
// watch.js - Auto-rebuild when content changes
const fs = require('fs');
const { exec } = require('child_process');

fs.watch('./content', (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
        console.log(`📝 ${filename} changed, rebuilding...`);
        exec('node build.js', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Build error:', error);
            } else {
                console.log('✅ Auto-rebuild completed!');
            }
        });
    }
});

console.log('👀 Watching for changes in content/ folder...');
```

Run with: `node watch.js`