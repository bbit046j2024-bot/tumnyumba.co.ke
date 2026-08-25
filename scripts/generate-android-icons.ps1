Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public\logo.png"
$resDir = "android\app\src\main\res"

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; ForeSize = 108 },
    @{ Name = "mipmap-hdpi"; Size = 72; ForeSize = 162 },
    @{ Name = "mipmap-xhdpi"; Size = 96; ForeSize = 216 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; ForeSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; ForeSize = 432 }
)

function Create-ResizedImage {
    param(
        [System.Drawing.Image]$source,
        [int]$targetWidth,
        [int]$targetHeight,
        [float]$scaleFactor,
        [string]$outputPath,
        [bool]$isRound = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetWidth, $targetHeight)
        $g.SetClip($path)
    }

    # Calculate scaled dimensions maintaining aspect ratio
    $srcRatio = $source.Width / $source.Height
    $scaledW = $targetWidth * $scaleFactor
    $scaledH = $scaledW / $srcRatio
    if ($scaledH -gt ($targetHeight * $scaleFactor)) {
        $scaledH = $targetHeight * $scaleFactor
        $scaledW = $scaledH * $srcRatio
    }

    $destX = ($targetWidth - $scaledW) / 2
    $destY = ($targetHeight - $scaledH) / 2

    $g.DrawImage($source, [float]$destX, [float]$destY, [float]$scaledW, [float]$scaledH)
    $g.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)

foreach ($d in $densities) {
    $folder = Join-Path $resDir $d.Name
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    # 1. ic_launcher.png (standard icon)
    $launcherPath = Join-Path $folder "ic_launcher.png"
    Create-ResizedImage -source $srcImage -targetWidth $d.Size -targetHeight $d.Size -scaleFactor 0.90 -outputPath $launcherPath

    # 2. ic_launcher_round.png (round icon)
    $roundPath = Join-Path $folder "ic_launcher_round.png"
    Create-ResizedImage -source $srcImage -targetWidth $d.Size -targetHeight $d.Size -scaleFactor 0.85 -outputPath $roundPath -isRound $true

    # 3. ic_launcher_foreground.png (adaptive foreground)
    $forePath = Join-Path $folder "ic_launcher_foreground.png"
    Create-ResizedImage -source $srcImage -targetWidth $d.ForeSize -targetHeight $d.ForeSize -scaleFactor 0.65 -outputPath $forePath

    Write-Host "Generated icons for $($d.Name)"
}

$srcImage.Dispose()
Write-Host "All Android icons generated successfully!"
