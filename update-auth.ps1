# Update login API
$file = "app\admin\hooks\useAuth.ts"
$content = Get-Content $file -Raw

# Add import if not present
if ($content -notmatch "getAdminApiBaseUrl") {
    $content = "import { getAdminApiBaseUrl } from '../utils/apiConfig';`n" + $content
}

# Replace the login fetch call specifically
$content = $content -replace "fetch\('/api/admin/login'", "fetch(`\`${getAdminApiBaseUrl()}/api/admin/login\`"

Set-Content $file $content
Write-Host "✅ Updated login API in useAuth.ts!"