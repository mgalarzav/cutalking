$filePath = "c:\Users\mgala\Desktop\CU-Talking\components\Home.tsx"

# Read the file
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# 1. Change container color from blue to red
$content = $content.Replace(
    '<motion.div layoutId="avatar-check" className="absolute top-3 right-3 text-blue-500">',
    '<motion.div layoutId="avatar-check" className="absolute top-3 right-3 text-red-500">'
)

# 2. Change icon fill color from white to red
$content = $content.Replace(
    '<Icons.CheckCircle2 size={24} fill="currentColor" className="text-white" />',
    '<Icons.CheckCircle2 size={24} fill="currentColor" className="text-red-600" />'
)

# Write back
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ Red dot applied successfully!" -ForegroundColor Green
