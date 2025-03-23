# Song Recognition App

A web application that allows you to identify songs by uploading audio files using the AudD Music Recognition API.

![Song Recognition App](https://i.imgur.com/YourScreenshot.png)

## Features

- **Audio File Upload**: Upload audio files to identify songs
- **Song Information Display**: View detailed information about the identified song, including:
  - Title and artist
  - Album name
  - Release date
  - Album artwork
- **Streaming Service Links**: Direct links to the identified song on popular streaming platforms:
  - Apple Music
  - Spotify
  - Deezer

## How to Use

1. Click the "Choose File" button to select an audio file from your device
   - Supported formats: MP3, WAV, M4A, and others
   - Maximum file size: 10MB
2. Once a file is selected, click the "Identify Song" button
3. Wait for the app to process your file and receive results
4. View the identified song details or error message if no match is found

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses the [AudD Music Recognition API](https://audd.io/) for song identification
- Responsive design that works on both desktop and mobile devices

## Development

To set up the project locally:

1. Clone this repository:
   ```
   git clone https://github.com/your-username/song-recognition-app.git
   ```

2. Open the project directory:
   ```
   cd song-recognition-app
   ```

3. Run the application using one of these methods:

   - **Option 1: Open directly in browser**
     - Simply open `index.html` in your preferred web browser by double-clicking the file

   - **Option 2: Use a local development server**
     - Using Python (if installed):
       ```
       # Python 3
       python -m http.server
       # Python 2
       python -m SimpleHTTPServer
       ```
     - Using Node.js (if installed):
       ```
       # Install serve globally (if not already installed)
       npm install -g serve
       # Start the server
       serve
       ```
     - Using Visual Studio Code:
       - Install the "Live Server" extension
       - Right-click on `index.html` and select "Open with Live Server"

4. Access the application:
   - If using the direct method, the file will open in your browser
   - If using a server, access the application at `http://localhost:8000` (or the port indicated in your terminal)

## License

MIT

## Credits

- [AudD](https://audd.io/) for the music recognition API
- Icons from [Remix Icon](https://remixicon.com/)
- Fonts from Google Fonts 