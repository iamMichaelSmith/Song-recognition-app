// AudD API token
const API_TOKEN = 'e460f49f21abb45069803db0a41a4693';
const API_URL = 'https://api.audd.io/';

// DOM Elements
const statusElement = document.getElementById('status');
const resultsContainer = document.getElementById('resultsContainer');
const resultCard = document.getElementById('resultCard');
const errorMessage = document.getElementById('errorMessage');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumName = document.getElementById('albumName');
const releaseDate = document.getElementById('releaseDate');
const albumArt = document.getElementById('albumArt');
const songLinks = document.getElementById('songLinks');

// File Upload Elements
const audioFileInput = document.getElementById('audioFileInput');
const fileName = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

// File upload variables
let selectedFile = null;

// Initialize the app
function init() {
    // File upload event listener
    audioFileInput.addEventListener('change', handleFileSelection);
}

// Handle file selection
function handleFileSelection(event) {
    selectedFile = event.target.files[0];
    
    if (selectedFile) {
        fileName.textContent = selectedFile.name;
        
        // Check file size
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            statusElement.textContent = 'Error: File too large. Maximum allowed is 10MB.';
            statusElement.style.color = '#ff6b6b';
            return;
        } else {
            statusElement.textContent = '';
            statusElement.style.color = '';
        }
        
        // Automatically start identification process
        handleFileUpload();
    } else {
        fileName.textContent = 'No file selected';
        statusElement.textContent = '';
    }
}

// Handle file upload and recognition
async function handleFileUpload() {
    if (!selectedFile) {
        return;
    }
    
    // Reset UI
    resetUI();
    
    // Show progress bar
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '10%';
    
    // Update status
    statusElement.textContent = 'Preparing file...';
    
    // Simulate progress for file preparation (0-20%)
    await simulateProgress(10, 20, 500);
    
    try {
        // Create FormData for API request
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('api_token', API_TOKEN);
        formData.append('return', 'apple_music,spotify,deezer');
        
        // Update status and progress (20-40%)
        statusElement.textContent = 'Uploading file...';
        await simulateProgress(20, 40, 800);
        
        // Make API request
        statusElement.textContent = 'Identifying song...';
        progressBar.style.width = '60%';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        // Simulate processing (60-80%)
        await simulateProgress(60, 80, 700);
        
        const data = await response.json();
        
        // Finalize progress
        progressBar.style.width = '100%';
        
        // Small delay before showing results
        setTimeout(() => {
            // Process API response
            processResponse(data);
            
            // Hide progress bar after showing results
            setTimeout(() => {
                progressContainer.classList.add('hidden');
            }, 300);
        }, 500);
        
    } catch (error) {
        console.error('Error processing file:', error);
        statusElement.textContent = 'Error: Failed to identify song';
        progressContainer.classList.add('hidden');
        showError();
    }
}

// Simulate progress for better UX
async function simulateProgress(start, end, duration) {
    const startTime = performance.now();
    const updateInterval = 30; // Update every 30ms
    
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = start + (end - start) * progress;
            
            progressBar.style.width = `${currentValue}%`;
            
            if (progress >= 1) {
                clearInterval(interval);
                resolve();
            }
        }, updateInterval);
    });
}

// Process the API response
function processResponse(data) {
    console.log('API Response:', data);
    if (data.status === 'success' && data.result) {
        // Display song information
        displaySongInfo(data.result);
        statusElement.textContent = 'Song identified!';
    } else {
        // Show error message
        console.log('No song identified or error:', data);
        statusElement.textContent = 'No song identified';
        showError();
    }
}

// Display the song information
function displaySongInfo(result) {
    // Set basic song info
    songTitle.textContent = result.title || 'Unknown Title';
    artistName.textContent = result.artist || 'Unknown Artist';
    albumName.textContent = result.album || 'Unknown Album';
    releaseDate.textContent = result.release_date || '';
    
    // Set album art if available
    if (result.apple_music && result.apple_music.artwork_url) {
        albumArt.style.backgroundImage = `url(${result.apple_music.artwork_url})`;
    } else if (result.spotify && result.spotify.album && result.spotify.album.images && result.spotify.album.images.length > 0) {
        albumArt.style.backgroundImage = `url(${result.spotify.album.images[0].url})`;
    } else if (result.deezer && result.deezer.album && result.deezer.album.cover) {
        albumArt.style.backgroundImage = `url(${result.deezer.album.cover})`;
    } else {
        albumArt.style.backgroundImage = 'url(https://via.placeholder.com/120?text=No+Image)';
    }
    
    // Clear previous links
    songLinks.innerHTML = '';
    
    // Add streaming service links
    addServiceLinks(result);
    
    // Show result card
    showResults();
}

// Add streaming service links
function addServiceLinks(result) {
    // Add Apple Music link
    if (result.apple_music && result.apple_music.url) {
        addLink('Apple Music', result.apple_music.url);
    }
    
    // Add Spotify link
    if (result.spotify && result.spotify.external_urls && result.spotify.external_urls.spotify) {
        addLink('Spotify', result.spotify.external_urls.spotify);
    }
    
    // Add Deezer link
    if (result.deezer && result.deezer.link) {
        addLink('Deezer', result.deezer.link);
    }
}

// Add a link to the links section
function addLink(name, url) {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = name;
    link.target = '_blank';
    songLinks.appendChild(link);
}

// Show results
function showResults() {
    document.querySelector('.results-placeholder').classList.add('hidden');
    resultCard.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// Show error message
function showError() {
    document.querySelector('.results-placeholder').classList.add('hidden');
    resultCard.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}

// Reset UI
function resetUI() {
    document.querySelector('.results-placeholder').classList.remove('hidden');
    resultCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    statusElement.textContent = '';
}

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', init); 