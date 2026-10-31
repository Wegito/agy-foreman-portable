# Finds Node.js 20+ (or downloads a private copy into .runtime\node, checked against the official
# checksum) and runs the portable launcher. Nothing is installed system-wide.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$NodeVersion = "22.12.0"
$Runtime = Join-Path $Root ".runtime\node"
if (-not $env:AGY_CALLER_CWD) { $env:AGY_CALLER_CWD = (Get-Location).Path }

function Test-Node($exe) {
  try { return ([int](& $exe -p "process.versions.node.split('.')[0]")) -ge 20 } catch { return $false }
}

$node = $null
$private = Join-Path $Runtime "node.exe"
if ((Test-Path $private) -and (Test-Node $private)) { $node = $private }
elseif ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Node "node")) { $node = (Get-Command node).Source }

if (-not $node) {
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
  $name = "node-v$NodeVersion-win-$arch"
  $base = "https://nodejs.org/dist/v$NodeVersion"
  Write-Host "Node.js 20+ not found. Downloading a private copy ($name)..."
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("agy-foreman-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $zip = Join-Path $tmp "node.zip"
    Invoke-WebRequest "$base/$name.zip" -OutFile $zip -UseBasicParsing
    $sums = (Invoke-WebRequest "$base/SHASUMS256.txt" -UseBasicParsing).Content -split "`n"
    $expected = ($sums | Where-Object { $_ -match " $name\.zip\s*$" } | Select-Object -First 1) -split "\s+" | Select-Object -First 1
    $actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
    if (-not $expected -or $expected -ne $actual) { throw "Checksum mismatch; refusing to use the download." }
    Expand-Archive $zip -DestinationPath $tmp -Force
    New-Item -ItemType Directory -Path $Runtime -Force | Out-Null
    Copy-Item (Join-Path $tmp "$name\*") $Runtime -Recurse -Force
    $node = $private
  } catch {
    Write-Host "Could not get Node.js: $_"
    Write-Host "Install Node.js 20+ from https://nodejs.org and try again."
    exit 1
  } finally {
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

$env:PATH = (Split-Path $node) + ";" + $env:PATH
Set-Location $Root
& $node (Join-Path $Root "scripts\portable.mjs") @args
exit $LASTEXITCODE
