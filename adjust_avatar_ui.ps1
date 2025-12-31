$filePath = "c:\Users\mgala\Desktop\CU-Talking\components\Home.tsx"

# Read the file
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# 1. Enlarge Video (w-20 h-20 -> w-32 h-32)
$content = $content.Replace(
    '<div className="w-20 h-20 rounded-full relative shadow-2xl overflow-hidden">',
    '<div className="w-32 h-32 rounded-full relative shadow-2xl overflow-hidden">'
)

# 2. Reduce Name Size (text-lg -> text-sm)
# We use specific context to avoid changing other text-lg instances
$content = $content.Replace(
    '<span className="block font-bold text-lg text-slate-900 dark:text-white capitalize mb-1">{av}</span>',
    '<span className="block font-bold text-sm text-slate-900 dark:text-white capitalize mb-1">{av}</span>'
)

# 3. Reduce Speaker Icon Size (size={20} -> size={16})
# We target the Volume2 icon specifically
$content = $content.Replace(
    '<Icons.Volume2 size={20} className={playing === av ? ''animate-pulse'' : ''''} />',
    '<Icons.Volume2 size={16} className={playing === av ? ''animate-pulse'' : ''''} />'
)

# Write back
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ UI adjustments completed successfully!" -ForegroundColor Green
