# Spotify Embed Integration Guide

## Quick Setup ✅

Your Spotify embed is now working in `index.html` on page 2! 

## How to Convert Spotify URLs to Embed Format

### 1. Original Spotify URL Format:
```
https://open.spotify.com/track/0C6Sbwuo42ebcvGWeWCSEq?si=QQ81xZeBQlKRJ0TTA30gtQ&nd=1&dlsi=ee0c54a64a484f0f
```

### 2. Extract the Track ID:
The track ID is: `0C6Sbwuo42ebcvGWeWCSEq`

### 3. Create Embed URL:
```
https://open.spotify.com/embed/track/0C6Sbwuo42ebcvGWeWCSEq?utm_source=generator
```

## HTML Template for Spotify Embeds

```html
<iframe 
    class="spotify-embed"
    src="https://open.spotify.com/embed/track/[TRACK_ID]?utm_source=generator" 
    width="100%" 
    height="352" 
    frameBorder="0" 
    allowfullscreen="" 
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
    loading="lazy">
</iframe>
```

## Different Spotify Content Types

### Track Embed:
```
https://open.spotify.com/embed/track/[TRACK_ID]?utm_source=generator
```

### Album Embed:
```
https://open.spotify.com/embed/album/[ALBUM_ID]?utm_source=generator
```

### Playlist Embed:
```
https://open.spotify.com/embed/playlist/[PLAYLIST_ID]?utm_source=generator
```

### Artist Embed:
```
https://open.spotify.com/embed/artist/[ARTIST_ID]?utm_source=generator
```

## Responsive Sizes

The CSS automatically handles different screen sizes:
- **Desktop**: 352px height
- **Tablet**: 280px height  
- **Mobile**: 232px height

## Features Included

✅ **No Spotify Developer Account needed**
✅ **No API keys required**
✅ **No user authentication**
✅ **Works immediately**
✅ **Responsive design**
✅ **Hover effects**
✅ **Mobile optimized**

## Adding More Music to Your Site

1. Find any Spotify track, album, or playlist
2. Copy the URL
3. Extract the ID (the part after `/track/`, `/album/`, etc.)
4. Use the embed template above
5. Replace `[TRACK_ID]` with your ID

## Example Usage in Your 300 Pages

You can add different music to each page:
- Page 1: Welcome track
- Page 2: Currently included
- Page 3: Energetic music
- Page 4: Chill vibes
- And so on...

## Testing

Open `index.html` in your browser and navigate to page 2 to see the Spotify embed in action!
