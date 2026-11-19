param(
  [string]$Action = 'list',
  [string]$LocalDir = (Join-Path $PSScriptRoot 'dist'),
  [string]$RemoteDir = '/public_html'
)

$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$FtpHost = if ($env:HOSTOO_FTP_HOST) { $env:HOSTOO_FTP_HOST } else { '108.181.92.72' }
$FtpUser = if ($env:HOSTOO_FTP_USER) { $env:HOSTOO_FTP_USER } else { 'izs8scpd' }
$FtpPass = $env:HOSTOO_FTP_PASS
if (-not $FtpPass) { throw 'Set HOSTOO_FTP_PASS environment variable before deploying.' }
$BaseUri = "ftp://$FtpHost$RemoteDir/"

function New-FtpRequest([string]$Uri, [string]$Method) {
  $req = [System.Net.FtpWebRequest]::Create($Uri)
  $req.Credentials = [System.Net.NetworkCredential]::new($FtpUser, $FtpPass)
  $req.Method = $Method
  $req.UseBinary = $true
  $req.KeepAlive = $true
  $req.UsePassive = $true
  $req.Timeout = 60000
  $req.ReadWriteTimeout = 60000
  return $req
}

function Get-Listing([string]$Uri) {
  $req = New-FtpRequest $Uri ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails)
  $res = $req.GetResponse()
  $reader = [System.IO.StreamReader]::new($res.GetResponseStream())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose(); $res.Dispose() }
}

function Ensure-Directory([string]$Uri) {
  try {
    $req = New-FtpRequest $Uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
    $res = $req.GetResponse()
    $res.Dispose()
  } catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($null -eq $resp) { throw }
    $code = [int]$resp.StatusCode
    if ($code -ne 550) { throw }
  }
}

function Upload-Directory([string]$Local, [string]$RemoteUri) {
  foreach ($dir in Get-ChildItem -LiteralPath $Local -Directory) {
    $childUri = $RemoteUri.TrimEnd('/') + '/' + $dir.Name
    Ensure-Directory $childUri
    Upload-Directory $dir.FullName $childUri
  }
  foreach ($file in Get-ChildItem -LiteralPath $Local -File) {
    $target = $RemoteUri.TrimEnd('/') + '/' + $file.Name
    $req = New-FtpRequest $target ([System.Net.WebRequestMethods+Ftp]::UploadFile)
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
    $res = $req.GetResponse()
    $res.Dispose()
    Write-Output "uploaded $($file.Name) ($($bytes.Length) bytes)"
  }
}

switch ($Action) {
  'list' { Get-Listing $BaseUri }
  'backup-htaccess' {
    $target = Join-Path $PSScriptRoot 'backup-htaccess-original.txt'
    $req = New-FtpRequest ($BaseUri + '.htaccess') ([System.Net.WebRequestMethods+Ftp]::DownloadFile)
    $res = $req.GetResponse()
    $reader = [System.IO.StreamReader]::new($res.GetResponseStream())
    try { [System.IO.File]::WriteAllText($target, $reader.ReadToEnd()) } finally { $reader.Dispose(); $res.Dispose() }
    Write-Output "saved $target"
  }
  'deploy' {
    Write-Output "Deploying $LocalDir to $BaseUri"
    Upload-Directory $LocalDir $BaseUri
    Write-Output '--- root listing ---'
    Get-Listing $BaseUri
  }
  default { throw "Unknown action: $Action" }
}
