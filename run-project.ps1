param(
    [switch]$SkipAdmin
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendAi = Join-Path $Root "backend-ai"
$BackendApi = Join-Path $Root "backend-api"
$Frontend = Join-Path $Root "frontend"
$Admin = Join-Path $Root "admin"

function Assert-PathExists {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path $Path)) {
        throw "$Name not found at $Path"
    }
}

function Find-Python {
    function Test-PythonCommand {
        param([string]$CommandPath)

        try {
            & $CommandPath --version *> $null
            return $LASTEXITCODE -eq 0
        } catch {
            return $false
        }
    }

    $ProjectPython = Join-Path $BackendAi "venv311\Scripts\python.exe"
    if ((Test-Path $ProjectPython) -and (Test-PythonCommand $ProjectPython)) {
        return $ProjectPython
    }

    $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($PythonCommand -and (Test-PythonCommand $PythonCommand.Source)) {
        return $PythonCommand.Source
    }

    $PyCommand = Get-Command py -ErrorAction SilentlyContinue
    if ($PyCommand -and (Test-PythonCommand $PyCommand.Source)) {
        return $PyCommand.Source
    }

    throw "Python was not found. Install Python 3.11 or create backend-ai\venv311."
}

function Start-ProjectWindow {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $Script = @"
Set-Location -LiteralPath '$($WorkingDirectory.Replace("'", "''"))'
`$host.UI.RawUI.WindowTitle = '$($Title.Replace("'", "''"))'
$Command
"@
    $EncodedScript = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Script))
    $Args = "-NoExit -ExecutionPolicy Bypass -EncodedCommand $EncodedScript"

    Start-Process powershell -ArgumentList $Args
}

Assert-PathExists $BackendAi "backend-ai"
Assert-PathExists $BackendApi "backend-api"
Assert-PathExists $Frontend "frontend"

$Python = Find-Python

if (-not (Test-Path (Join-Path $BackendApi "node_modules"))) {
    throw "backend-api dependencies are missing. Run: cd backend-api; npm install"
}

if ((-not $SkipAdmin) -and (Test-Path $Admin) -and (-not (Test-Path (Join-Path $Admin "node_modules")))) {
    throw "admin dependencies are missing. Run: cd admin; npm install"
}

$MysqlOpen = Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $MysqlOpen) {
    Write-Warning "MySQL does not appear to be listening on 127.0.0.1:3307. Start MySQL before logging in or using database features."
}

Start-ProjectWindow `
    -Title "diabetes backend-ai :8000" `
    -WorkingDirectory $BackendAi `
    -Command "& '$Python' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-ProjectWindow `
    -Title "diabetes backend-api :5000" `
    -WorkingDirectory $BackendApi `
    -Command "npm start"

Start-ProjectWindow `
    -Title "diabetes frontend :5500" `
    -WorkingDirectory $Frontend `
    -Command "& '$Python' -m http.server 5500 --bind 127.0.0.1"

if ((-not $SkipAdmin) -and (Test-Path $Admin)) {
    Start-ProjectWindow `
        -Title "diabetes admin :5173" `
        -WorkingDirectory $Admin `
        -Command "npm run dev -- --host 127.0.0.1 --port 5173"
}

Write-Host ""
Write-Host "Project windows are starting."
Write-Host "Patient frontend: http://127.0.0.1:5500/login.html"
Write-Host "FastAPI docs:      http://127.0.0.1:8000/docs"
Write-Host "Admin API health:  http://127.0.0.1:5000/api/health"
if (-not $SkipAdmin) {
    Write-Host "Admin frontend:    http://127.0.0.1:5173"
}
Write-Host ""
Write-Host "Close the opened PowerShell windows to stop each service."
