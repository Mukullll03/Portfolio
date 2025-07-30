const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs-extra")
const { exec, spawn } = require("child_process")
const { promisify } = require("util")

const app = express()
const PORT = process.env.PORT || 3000
const execAsync = promisify(exec)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))
app.use("/downloads", express.static("downloads"))

// Ensure downloads directory exists
fs.ensureDirSync("downloads")

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Check if yt-dlp is installed
async function checkYtDlp() {
  try {
    await execAsync("yt-dlp --version")
    console.log("✅ yt-dlp is installed and ready")
    return true
  } catch (error) {
    console.log("❌ yt-dlp not found. Please install it:")
    console.log("pip install yt-dlp")
    console.log("or")
    console.log("brew install yt-dlp")
    return false
  }
}

// Get video information
app.post("/api/video-info", async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: "URL is required" })
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" })
    }

    console.log("Fetching video info for:", url)

    // Get video information using yt-dlp
    const command = `yt-dlp --dump-json --no-download "${url}"`
    const { stdout } = await execAsync(command)

    const videoInfo = JSON.parse(stdout)

    // Extract available formats and organize by quality
    const formats = videoInfo.formats || []
    const availableQualities = new Set()

    // Process formats to get unique qualities
    formats.forEach((format) => {
      if (format.height) {
        if (format.height >= 2160) availableQualities.add("4K")
        else if (format.height >= 1440) availableQualities.add("1440p")
        else if (format.height >= 1080) availableQualities.add("1080p")
        else if (format.height >= 720) availableQualities.add("720p")
        else if (format.height >= 480) availableQualities.add("480p")
        else if (format.height >= 360) availableQualities.add("360p")
      }
    })

    // Always add audio option
    availableQualities.add("audio")

    const response = {
      id: videoInfo.id,
      title: videoInfo.title,
      duration: formatDuration(videoInfo.duration),
      thumbnail: videoInfo.thumbnail,
      uploader: videoInfo.uploader,
      view_count: videoInfo.view_count,
      upload_date: videoInfo.upload_date,
      availableQualities: Array.from(availableQualities).sort((a, b) => {
        const order = ["4K", "1440p", "1080p", "720p", "480p", "360p", "audio"]
        return order.indexOf(a) - order.indexOf(b)
      }),
    }

    res.json(response)
  } catch (error) {
    console.error("Error fetching video info:", error)
    res.status(500).json({
      error: "Failed to fetch video information",
      details: error.message,
    })
  }
})

// Download video
app.post("/api/download", async (req, res) => {
  try {
    const { url, quality } = req.body

    if (!url || !quality) {
      return res.status(400).json({ error: "URL and quality are required" })
    }

    console.log(`Starting download: ${quality} quality for ${url}`)

    // Generate unique filename
    const timestamp = Date.now()
    const outputTemplate = `downloads/%(title)s_${timestamp}.%(ext)s`

    let command

    if (quality === "audio") {
      // Audio only download
      command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${url}"`
    } else {
      // Video download with specific quality
      let formatSelector
      switch (quality) {
        case "4K":
          formatSelector = "bestvideo[height<=2160]+bestaudio/best[height<=2160]"
          break
        case "1440p":
          formatSelector = "bestvideo[height<=1440]+bestaudio/best[height<=1440]"
          break
        case "1080p":
          formatSelector = "bestvideo[height<=1080]+bestaudio/best[height<=1080]"
          break
        case "720p":
          formatSelector = "bestvideo[height<=720]+bestaudio/best[height<=720]"
          break
        case "480p":
          formatSelector = "bestvideo[height<=480]+bestaudio/best[height<=480]"
          break
        case "360p":
          formatSelector = "bestvideo[height<=360]+bestaudio/best[height<=360]"
          break
        default:
          formatSelector = "best"
      }

      command = `yt-dlp -f "${formatSelector}" -o "${outputTemplate}" "${url}"`
    }

    // Execute download command
    const { stdout, stderr } = await execAsync(command)

    // Find the downloaded file
    const downloadDir = path.join(__dirname, "downloads")
    const files = await fs.readdir(downloadDir)
    const downloadedFile = files.find((file) => file.includes(timestamp.toString()))

    if (!downloadedFile) {
      throw new Error("Downloaded file not found")
    }

    const filePath = `/downloads/${downloadedFile}`
    const fileSize = (await fs.stat(path.join(downloadDir, downloadedFile))).size

    res.json({
      success: true,
      message: "Download completed successfully",
      downloadUrl: filePath,
      filename: downloadedFile,
      fileSize: formatFileSize(fileSize),
    })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({
      error: "Download failed",
      details: error.message,
    })
  }
})

// Get download progress (for future implementation)
app.get("/api/download-progress/:id", (req, res) => {
  // This would be implemented with WebSockets or Server-Sent Events
  // for real-time progress updates
  res.json({ progress: 0, status: "pending" })
})

// Utility functions
function formatDuration(seconds) {
  if (!seconds) return "Unknown"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)

  // Check if yt-dlp is available
  const ytDlpAvailable = await checkYtDlp()
  if (!ytDlpAvailable) {
    console.log("⚠️  Server started but yt-dlp is not available. Downloads will not work.")
  }
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...")
  process.exit(0)
})
