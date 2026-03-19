param(
  [string]$RemoteName = "origin",
  [string]$SourceBranch = "main"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $currentBranch) {
  throw "无法识别当前分支。"
}

if ($currentBranch -eq $SourceBranch) {
  throw "当前就在 $SourceBranch 分支，请切换到主题分支后再执行同步。"
}

git diff --quiet
if ($LASTEXITCODE -ne 0) {
  throw "工作区存在未提交修改，请先提交或暂存后再同步内容。"
}

git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  throw "暂存区存在未提交修改，请先提交后再同步内容。"
}

$sourceRef = "$RemoteName/$SourceBranch"
$syncPaths = @(
  "src/posts",
  "src/pages"
)

Write-Host "正在获取 $sourceRef 最新内容..." -ForegroundColor Cyan
git fetch $RemoteName $SourceBranch
if ($LASTEXITCODE -ne 0) {
  throw "获取 $sourceRef 失败。"
}

foreach ($path in $syncPaths) {
  Write-Host "同步 $path" -ForegroundColor Cyan
  git checkout $sourceRef -- $path
  if ($LASTEXITCODE -ne 0) {
    throw "同步路径 $path 失败。"
  }
}

$changedFiles = git status --short
if (-not $changedFiles) {
  Write-Host "内容已是最新，无需同步。" -ForegroundColor Green
  exit 0
}

Write-Host ""
Write-Host "已从 $sourceRef 同步内容文件，当前主题分支未被覆盖：" -ForegroundColor Green
Write-Host $changedFiles
Write-Host ""
Write-Host "建议下一步：" -ForegroundColor Yellow
Write-Host 'git add src/posts src/pages'
Write-Host 'git commit -m "chore(content): 同步 main 分支文章内容"'
Write-Host "git push origin $currentBranch"
