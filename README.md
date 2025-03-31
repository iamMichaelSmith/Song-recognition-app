# Studio Song Recognition

A web application for recognizing songs from audio files, with support for both single file and folder batch processing.

## Features

- Single file song recognition
- Folder batch processing for multiple MP3 files
- Drag and drop support
- Progress tracking for batch operations
- Links to streaming services (Apple Music, Spotify, Deezer)
- Local storage for settings and recent results
- Dark mode interface

## Setup

1. Download all files to a local directory:
   - `index.html`
   - `app.js`
   - `styles.css`

2. Run a local server:
   ```bash
   # Using Python (recommended)
   python -m http.server 8000
   ```

3. Open in your browser:
   - Go to: http://localhost:8000

## Usage

### Single File Upload
1. Click "Choose File" or drag and drop an audio file
2. Wait for recognition process
3. View song details and streaming links

### Folder Scan
1. Click "Scan Folder"
2. Select a folder containing MP3 files
3. Wait for batch processing to complete
4. View results for all processed files

### File Requirements
- Maximum file size: 10MB
- Supported formats: MP3 and other audio formats
- For folder scan: MP3 files only

## Local Storage

The application saves:
- Last used folder location
- Recent recognition results (last 10)
- Application settings

## API Usage

This application uses the AudD API for song recognition. The API token is included in the code.

## Project Structure
```
song-recognition/
├── index.html      # Main HTML file
├── styles.css      # Styling
├── app.js         # Application logic
└── README.md      # Documentation
```

## How to Use
1. Open `index.html` in your web browser
2. Either:
   - Drag and drop an audio file onto the upload area
   - Click "Choose File" to select an audio file
3. Wait for the app to process your file
4. View the identified song details or error message

## Technical Details
- Built with vanilla JavaScript, HTML, and CSS
- Uses the [AudD Music Recognition API](https://audd.io/) for song identification
- Responsive design that works on both desktop and mobile devices

## Customized Features
- Studio-inspired color scheme
- Drag and drop functionality
- Formatted release dates (MM/DD/YYYY)
- User-friendly success messages

## License
MIT 