$filePath = "c:\Users\mgala\Desktop\CU-Talking\components\Home.tsx"

# Read the file
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Define the old code
$oldCode = @'
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center relative shadow-2xl ${
                                av === 'max' 
                                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600' 
                                    : 'bg-gradient-to-br from-fuchsia-400 to-purple-600'
                            }`}>
                                {/* 3D Shine */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/30" />
                                <span className="text-3xl font-bold text-white drop-shadow-md">{av === 'max' ? 'M' : 'L'}</span>
                            </div>
'@

# Define the new code
$newCode = @'
                            <div className="w-20 h-20 rounded-full relative shadow-2xl overflow-hidden">
                                {/* Video Background */}
                                <video 
                                    src={av === 'max' ? '/max.mp4' : '/linda.mp4'}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* 3D Shine Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 pointer-events-none" />
                            </div>
'@

# Replace
$content = $content.Replace($oldCode, $newCode)

# Write back
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ Replacement completed successfully!" -ForegroundColor Green
