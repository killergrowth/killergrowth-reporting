$saJson = Get-Content "C:\Users\KillerGrowth\.openclaw\credentials\google-service-account.json" -Raw
$env:GOOGLE_SERVICE_ACCOUNT_JSON = $saJson

$credBytes = [System.IO.File]::ReadAllBytes("C:\Users\KillerGrowth\.openclaw\workspace\References\credentials.md")
$credText = [System.Text.Encoding]::UTF8.GetString($credBytes)
$m = [regex]::Match($credText, 'GOOGLE_ADS_DEVELOPER_TOKEN=([A-Za-z0-9\-_]+)')
$env:GOOGLE_ADS_DEVELOPER_TOKEN = $m.Groups[1].Value

$env:GOOGLE_ADS_LOGIN_CUSTOMER_ID = "9760213886"
$env:KG_CLIENT_DIRECTORY_SHEET_ID = "1VQD431iyaoigW4PuvCoy064YI0Dc5rYLIgfdysSPIqA"

node scripts/build-report.js sunflower
node build.js
npx wrangler pages deploy dist --project-name killergrowth-reporting --commit-dirty=true
