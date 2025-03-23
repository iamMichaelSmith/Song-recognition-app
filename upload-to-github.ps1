# GitHub credentials and repository information
# Replace these variables with your own information
$githubUsername = "YOUR_GITHUB_USERNAME"
$repoName = "song-recognition-app"
$description = "A web application that uses the AudD Music Recognition API to identify songs from audio recordings."

# Files to include
$filesToInclude = @(
    "index.html",
    "app.js",
    "styles.css",
    "README.md",
    "vercel.json",
    ".gitignore"
)

Write-Host "This script will help you create a GitHub repository and upload your files."
Write-Host "Please follow these steps:"
Write-Host ""
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Enter '$repoName' as the Repository name"
Write-Host "3. Enter '$description' as the Description"
Write-Host "4. Choose 'Public' visibility"
Write-Host "5. Click 'Create repository'"
Write-Host "6. After creating the repository, follow the instructions for 'push an existing repository from the command line'"
Write-Host ""
Write-Host "Here's a sample command sequence you can use:"
Write-Host "git remote add origin https://github.com/$githubUsername/$repoName.git"
Write-Host "git branch -M main"
Write-Host "git push -u origin main"
Write-Host ""
Write-Host "For manual file upload:"
Write-Host "1. Go to https://github.com/$githubUsername/$repoName"
Write-Host "2. Click 'Add file' > 'Upload files'"
Write-Host "3. Drag and drop these files from your local folder:"
foreach ($file in $filesToInclude) {
    Write-Host "   - $file"
}
Write-Host "4. Click 'Commit changes'"
Write-Host ""
Write-Host "Alternatively, you can download the ZIP file from your workspace and upload the extracted files." 