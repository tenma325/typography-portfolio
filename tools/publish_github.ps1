# One-shot publisher: git init (one commit per file), create the GitHub repo,
# push, and let the Actions workflow deploy to GitHub Pages.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools\publish_github.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

git --version | Out-Null
gh auth status

if (-not (Test-Path .git)) {
    git init -b main
}

$trailer = "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"

# one commit per file (personal git discipline)
$untracked = git ls-files --others --exclude-standard
foreach ($f in $untracked) {
    git add -- "$f"
    git commit -m "add $f" -m $trailer | Out-Null
    Write-Host "committed: $f"
}
$modified = git diff --name-only
foreach ($f in $modified) {
    git add -- "$f"
    git commit -m "update $f" -m $trailer | Out-Null
    Write-Host "committed: $f"
}

$hasOrigin = (git remote) -contains 'origin'
if (-not $hasOrigin) {
    gh repo create typography-portfolio --public --source=. --remote=origin --push
} else {
    git push -u origin main
}

$owner = gh api user -q .login
Write-Host ""
Write-Host "Pushed. GitHub Actions is now building & deploying to Pages."
Write-Host "Watch:  https://github.com/$owner/typography-portfolio/actions"
Write-Host "Site :  https://$owner.github.io/typography-portfolio/  (live after the first deploy finishes)"
