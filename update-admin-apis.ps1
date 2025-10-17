# Update admin API calls to use base URL

$files = @(
    "app\admin\hooks\useAppointments\apiUtils.ts",
    "app\admin\hooks\useChatLogs\apiUtils.ts",
    "app\admin\hooks\useAvailability\apiUtils.ts",
    "app\admin\hooks\useSettings\apiUtils.ts",
    "app\admin\hooks\useChatLogs\index.ts"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Add import at the top
    if ($content -notmatch "getAdminApiBaseUrl") {
        $content = "import { getAdminApiBaseUrl } from '../../utils/apiConfig';`n" + $content
    }
    
    # Replace fetch calls
    $content = $content -replace "fetch\(`/api/", "fetch(`\`${getAdminApiBaseUrl()}/api/"
    $content = $content -replace 'fetch\(`\\$\{', 'fetch(`${getAdminApiBaseUrl()}${'
    
    Set-Content $file $content
}

Write-Host "✅ Updated API calls in admin files!"