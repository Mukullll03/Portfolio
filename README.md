# YouTube Downloader - iOS Style with 4K Support

A beautiful, responsive YouTube video downloader with iOS-inspired design supporting up to 4K quality downloads.

## Features

- 🎬 **4K Ultra HD Support** - Download videos in stunning 4K resolution
- 📱 **iOS-Inspired Design** - Clean, modern interface with iOS aesthetics
- ⚡ **Lightning Fast** - Powered by yt-dlp for maximum performance
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- 🔒 **Secure & Private** - No data stored, completely private downloads
- 🎵 **Audio Downloads** - Extract audio in high-quality MP3 format

## Supported Qualities

- 4K (2160p) - Ultra HD
- 1440p - Quad HD
- 1080p - Full HD
- 720p - HD
- 480p - Standard
- 360p - Mobile
- Audio Only - MP3

## Installation

### Prerequisites

1. **Node.js** (v14 or higher)
2. **Python** (for yt-dlp)
3. **yt-dlp** (will be installed automatically)

### Quick Start

1. **Clone or download this project**

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run setup script:**
   \`\`\`bash
   node scripts/setup.js
   \`\`\`

4. **Start the server:**
   \`\`\`bash
   npm start
   \`\`\`

5. **Open your browser:**
   \`\`\`
   http://localhost:3000
   \`\`\`

### Manual yt-dlp Installation

If automatic installation fails, install yt-dlp manually:

**Using pip:**
\`\`\`bash
pip install yt-dlp
\`\`\`

**Using Homebrew (macOS):**
\`\`\`bash
brew install yt-dlp
\`\`\`

**Using conda:**
\`\`\`bash
conda install -c conda-forge yt-dlp
\`\`\`

## Usage

1. Paste a YouTube video URL
2. Click "Analyze Video"
3. Select your preferred quality
4. Click "Download" and wait for completion
5. Download the file from the provided link

## API Endpoints

### POST /api/video-info
Get video information and available qualities.

**Request:**
\`\`\`json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "VIDEO_ID",
  "title": "Video Title",
  "duration": "3:45",
  "thumbnail": "thumbnail_url",
  "uploader": "Channel Name",
  "view_count": 1000000,
  "availableQualities": ["4K", "1080p", "720p", "480p", "360p", "audio"]
}
\`\`\`

### POST /api/download
Download video in specified quality.

**Request:**
\`\`\`json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "quality": "1080p"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "downloadUrl": "/downloads/filename.mp4",
  "filename": "Video Title_timestamp.mp4",
  "fileSize": "25.6 MB"
}
\`\`\`

## File Structure

\`\`\`
youtube-downloader/
├── server.js              # Main server file
├── package.json           # Dependencies
├── public/
│   └── index.html         # Frontend interface
├── downloads/             # Downloaded files
├── scripts/
│   └── setup.js          # Setup script
└── README.md             # This file
\`\`\`

## Development

**Start in development mode:**
\`\`\`bash
npm run dev
\`\`\`

This uses nodemon for automatic server restarts.

## Troubleshooting

### yt-dlp not found
- Make sure Python is installed
- Install yt-dlp manually: `pip install yt-dlp`
- Check PATH environment variable

### Download fails
- Verify the YouTube URL is valid
- Some videos may be restricted or private
- Check internet connection
- Try a different quality

### Large file downloads
- 4K videos can be very large (1GB+)
- Ensure sufficient disk space
- Downloads may take several minutes

## Legal Notice

This tool is for personal use only. Please respect:
- YouTube's Terms of Service
- Copyright laws in your jurisdiction
- Content creators' rights

Only download videos you have permission to download.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Verify yt-dlp is properly installed
3. Check server logs for error details
