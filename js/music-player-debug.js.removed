/**
 * IMPROVED MUSIC PLAYER SETUP - Debug Version
 * This version includes enhanced debugging and error handling
 */

function setupMusicPlayerImproved() {
    const musicTrigger = document.getElementById('music-trigger');
    const spotifyNav = document.getElementById('spotify-nav');
    const closeSpotify = document.getElementById('close-spotify');
    
    // Debug function
    function debugLog(message, data = null) {
        console.log(`🎵 Music Player: ${message}`, data || '');
    }
    
    // Check if all elements exist
    if (!musicTrigger) {
        console.error('❌ Music trigger element not found!');
        return;
    }
    if (!spotifyNav) {
        console.error('❌ Spotify nav element not found!');
        return;
    }
    if (!closeSpotify) {
        console.error('❌ Close spotify button not found!');
        return;
    }
    
    debugLog('All elements found successfully');
    
    // Enhanced toggle function with debugging
    const toggleMusicPlayer = (source = 'unknown') => {
        debugLog(`Toggle called from: ${source}`);
        
        const isCurrentlyVisible = spotifyNav.classList.contains('spotify-nav-visible');
        debugLog(`Current state: ${isCurrentlyVisible ? 'visible' : 'hidden'}`);
        
        if (isCurrentlyVisible) {
            // Hide the player
            spotifyNav.classList.remove('spotify-nav-visible');
            spotifyNav.classList.add('spotify-nav-hidden');
            debugLog('Player hidden');
        } else {
            // Show the player
            spotifyNav.classList.remove('spotify-nav-hidden');
            spotifyNav.classList.add('spotify-nav-visible');
            debugLog('Player shown');
        }
        
        // Debug current classes
        debugLog('Current classes:', spotifyNav.className);
        
        // Force a reflow to ensure CSS changes are applied
        spotifyNav.offsetHeight;
    };
    
    // Event listeners with improved debugging
    musicTrigger.addEventListener('click', (e) => {
        debugLog('Music trigger clicked');
        e.preventDefault();
        e.stopPropagation();
        toggleMusicPlayer('music-trigger');
    });
    
    closeSpotify.addEventListener('click', (e) => {
        debugLog('Close button clicked');
        e.preventDefault();
        e.stopPropagation();
        toggleMusicPlayer('close-button');
    });
    
    // Click outside to close (optional) - with debugging
    document.addEventListener('click', (e) => {
        const isVisible = spotifyNav.classList.contains('spotify-nav-visible');
        const clickedInsidePlayer = spotifyNav.contains(e.target);
        const clickedTrigger = musicTrigger.contains(e.target);
        
        if (isVisible && !clickedInsidePlayer && !clickedTrigger) {
            debugLog('Clicked outside player, closing');
            toggleMusicPlayer('outside-click');
        }
    });
    
    // Prevent scrolling when music player is visible
    spotifyNav.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        debugLog('Touch start on player');
    });
    
    spotifyNav.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    });
    
    spotifyNav.addEventListener('touchend', (e) => {
        e.stopPropagation();
    });
    
    // Test function for console
    window.testMusicPlayer = () => {
        debugLog('Testing music player manually');
        toggleMusicPlayer('manual-test');
    };
    
    debugLog('Music player setup complete!');
    debugLog('Use testMusicPlayer() in console to test manually');
    
    // Return the toggle function for external use
    return toggleMusicPlayer;
}

// Call this function after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const toggleFunction = setupMusicPlayerImproved();
    
    // Make it globally available
    window.ProjectIO = window.ProjectIO || {};
    window.ProjectIO.toggleMusicPlayer = toggleFunction;
});