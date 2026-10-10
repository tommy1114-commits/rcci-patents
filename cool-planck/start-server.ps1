# RCCI 智財與技術成果專區 - 本機 HTTP 伺服器啟動腳本
# Research Center for Critical Issues | Academia Sinica

$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " RCCI 智財與技術成果專區 本機伺服器已成功啟動！" -ForegroundColor Green
    Write-Host " 請在瀏覽器中開啟: $prefix" -ForegroundColor Yellow
    Write-Host " 按 Ctrl+C 可停止伺服器" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    # 自動開啟預設瀏覽器
    Start-Process $prefix

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawPath) -or $rawPath -eq "") {
            $rawPath = "index.html"
        }

        $filePath = Join-Path $root ($rawPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".json" { "application/json; charset=utf-8" }
                ".csv"  { "text/csv; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                Default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mimeType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            # 加入 CORS 標頭便於本機測試
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }

        $response.Close()
    }
}
catch {
    Write-Host "伺服器發生錯誤: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    $listener.Close()
}
