const runtimeConfig = window.APP_CONFIG || {};
const API_TOKEN = runtimeConfig.AUDD_API_TOKEN || '';
const API_URL = runtimeConfig.AUDD_API_URL || 'https://api.audd.io/';

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
const folderInput = document.getElementById('folderInput');
const scanFolderBtn = document.getElementById('scanFolderBtn');
const fileName = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const fileUploadContainer = document.querySelector('.file-upload-container');

// Local Storage Keys
const STORAGE_KEYS = {
    LAST_FOLDER: 'lastFolder',
    RECENT_RESULTS: 'recentResults',
    SETTINGS: 'appSettings'
};

// App Settings with defaults
let appSettings = {
    maxRecentResults: 10,
    autoStartRecognition: true,
    lastFolder: null
};

// File upload variables
let selectedFile = null;
let processingQueue = [];

// Initialize the app
function init() {
    // Load settings from local storage
    loadSettings();
    
    // File upload event listeners
    audioFileInput.addEventListener('change', handleFileSelection);
    folderInput.addEventListener('change', handleFolderSelection);
    scanFolderBtn.addEventListener('click', () => folderInput.click());
    
    // Drag and drop event listeners
    fileUploadContainer.addEventListener('dragover', handleDragOver);
    fileUploadContainer.addEventListener('dragleave', handleDragLeave);
    fileUploadContainer.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// Load settings from local storage
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
            appSettings = { ...appSettings, ...JSON.parse(savedSettings) };
        }
        
        // Restore last folder if it exists
        if (appSettings.lastFolder) {
            folderInput.value = appSettings.lastFolder;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings to local storage
function saveSettings() {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Save result to recent results
function saveToRecents(result) {
    try {
        let recentResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_RESULTS) || '[]');
        recentResults.unshift({
            timestamp: new Date().toISOString(),
            result
        });
        
        // Keep only the latest results based on settings
        recentResults = recentResults.slice(0, appSettings.maxRecentResults);
        localStorage.setItem(STORAGE_KEYS.RECENT_RESULTS, JSON.stringify(recentResults));
    } catch (error) {
        console.error('Error saving to recents:', error);
    }
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle drag over
function handleDragOver(e) {
    fileUploadContainer.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    fileUploadContainer.classList.remove('drag-over');
}

// Handle drop
function handleDrop(e) {
    fileUploadContainer.classList.remove('drag-over');
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        audioFileInput.files = files;
        handleFileSelection({ target: audioFileInput });
    }
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

// Handle folder selection
async function handleFolderSelection(event) {
    const files = Array.from(event.target.files).filter(file => 
        file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
    );
    
    if (files.length === 0) {
        statusElement.textContent = 'No MP3 files found in selected folder';
        return;
    }

    if (!hasApiToken()) {
        showMissingTokenError();
        return;
    }

    // Save the last used folder path
    appSettings.lastFolder = event.target.value;
    saveSettings();

    // Clear previous results
    resultsContainer.innerHTML = '';
    const batchContainer = document.createElement('div');
    batchContainer.className = 'batch-results';
    resultsContainer.appendChild(batchContainer);

    statusElement.textContent = `Found ${files.length} MP3 files. Starting processing...`;
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    
    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        statusElement.textContent = `Processing file ${i + 1} of ${files.length}: ${file.name}`;
        
        try {
            const result = await processFile(file);
            const resultElement = createResultElement(result, file.name);
            batchContainer.appendChild(resultElement);
            
            // Save successful results
            if (result.status === 'success' && result.result) {
                saveToRecents(result.result);
            }
        } catch (error) {
            console.error('Error processing file:', file.name, error);
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item';
            errorElement.textContent = `Failed to process ${file.name}: ${error.message}`;
            batchContainer.appendChild(errorElement);
        }
        
        // Update progress
        progressBar.style.width = `${((i + 1) / files.length) * 100}%`;
    }
    
    statusElement.textContent = 'Finished processing all files';
}

function hasApiToken() {
    return Boolean(API_TOKEN && API_TOKEN.trim());
}

function showMissingTokenError() {
    statusElement.textContent = 'Missing AudD API token. Add it to config.js before recognizing songs.';
    statusElement.style.color = '#ff6b6b';
}

// Process a single file
async function processFile(file) {
    if (!hasApiToken()) {
        throw new Error('Missing AudD API token. Add it to config.js before recognizing songs.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_token', API_TOKEN);
    formData.append('return', 'apple_music,spotify,deezer');
    
    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    return data;
}

// Create result element for batch processing
function createResultElement(data, fileName) {
    const element = document.createElement('div');
    element.className = 'batch-result-item';
    
    if (data.status === 'success' && data.result) {
        const result = data.result;
        element.innerHTML = `
            <div class="result-header">
                <h3>${result.title || 'Unknown Title'}</h3>
                <p>${result.artist || 'Unknown Artist'}</p>
            </div>
            <div class="result-details">
                <p>File: ${fileName}</p>
                <p>Album: ${result.album || 'Unknown Album'}</p>
                ${result.release_date ? `<p>Released: ${formatDate(result.release_date)}</p>` : ''}
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="result-header error">
                <h3>Recognition Failed</h3>
                <p>File: ${fileName}</p>
            </div>
        `;
    }
    
    return element;
}

// Handle file upload and recognition
async function handleFileUpload() {
    if (!selectedFile) {
        return;
    }

    if (!hasApiToken()) {
        resetUI();
        showMissingTokenError();
        showError();
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
        statusElement.textContent = 'Found it! 👍';
    } else {
        // Show error message
        console.log('No song identified or error:', data);
        statusElement.textContent = 'No song identified';
        showError();
    }
}

// Format date to MM/DD/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return `Release Date: ${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Display the song information
function displaySongInfo(result) {
    // Set basic song info
    songTitle.textContent = result.title || 'Unknown Title';
    artistName.textContent = result.artist || 'Unknown Artist';
    albumName.textContent = result.album || 'Unknown Album';
    releaseDate.textContent = formatDate(result.release_date);
    
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