$filePath = "c:\Users\mgala\Desktop\CU-Talking\components\Home.tsx"

# Read the file
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Add scale-125 to the video class to zoom in
# We target the specific class string we know exists from the previous step
$content = $content.Replace(
    'className="absolute inset-0 w-full h-full object-cover"',
    'className="absolute inset-0 w-full h-full object-cover scale-125"'
)

# Write back
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ Video zoom applied successfully!" -ForegroundColor Green
