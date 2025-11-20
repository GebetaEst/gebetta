# Create necessary directories
$directories = @(
    "restaurant-admin-standalone\app\(auth)",
    "restaurant-admin-standalone\app\(app)\(restaurant)",
    "restaurant-admin-standalone\components",
    "restaurant-admin-standalone\constants",
    "restaurant-admin-standalone\hooks",
    "restaurant-admin-standalone\lib",
    "restaurant-admin-standalone\store",
    "restaurant-admin-standalone\types",
    "restaurant-admin-standalone\assets\fonts",
    "restaurant-admin-standalone\contexts"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    } else {
        Write-Host "Directory already exists: $dir"
    }
}

# Copy files from the original project
$sourceBase = "frontend"
$destBase = "restaurant-admin-standalone"

# Copy app files
Copy-Item -Path "$sourceBase\app\(restaurant)\*" -Destination "$destBase\app\(app)\(restaurant)" -Recurse -Force

# Copy components
if (Test-Path "$sourceBase\components") {
    Copy-Item -Path "$sourceBase\components\*" -Destination "$destBase\components" -Recurse -Force
}

# Copy constants
if (Test-Path "$sourceBase\constants") {
    Copy-Item -Path "$sourceBase\constants\*" -Destination "$destBase\constants" -Recurse -Force
}

# Copy hooks
if (Test-Path "$sourceBase\hooks") {
    Copy-Item -Path "$sourceBase\hooks\*" -Destination "$destBase\hooks" -Recurse -Force
}

# Copy lib
if (Test-Path "$sourceBase\lib") {
    Copy-Item -Path "$sourceBase\lib\*" -Destination "$destBase\lib" -Recurse -Force
}

# Copy store
if (Test-Path "$sourceBase\store") {
    Copy-Item -Path "$sourceBase\store\*" -Destination "$destBase\store" -Recurse -Force
}

# Copy types
if (Test-Path "$sourceBase\types") {
    Copy-Item -Path "$sourceBase\types\*" -Destination "$destBase\types" -Recurse -Force
}

# Copy assets
if (Test-Path "$sourceBase\assets") {
    Copy-Item -Path "$sourceBase\assets\*" -Destination "$destBase\assets" -Recurse -Force
}

# Create package.json with required dependencies
$packageJson = @{
    "name" = "restaurant-admin-standalone"
    "version" = "1.0.0"
    "main" = "node_modules/expo/AppEntry.js"
    "scripts" = @{
        "start" = "expo start"
        "android" = "expo start --android"
        "ios" = "expo start --ios"
        "web" = "expo start --web"
        "lint" = "eslint ."
    }
    "dependencies" = @{
        "expo" = "~50.0.0"
        "expo-router" = "~3.0.0"
        "react" = "18.2.0"
        "react-native" = "0.73.0"
        "zustand" = "^4.0.0"
        "lucide-react-native" = "^0.300.0"
        "axios" = "^1.6.0"
        "expo-image-picker" = "~14.7.0"
        "expo-secure-store" = "~12.7.0"
        "react-native-reanimated" = "~3.5.0"
        "react-native-safe-area-context" = "4.8.0"
        "react-native-screens" = "~3.29.0"
        "expo-constants" = "~15.0.0"
        "expo-font" = "~11.0.0"
        "expo-status-bar" = "~1.11.0"
        "react-native-svg" = "13.9.0"
    }
    "devDependencies" = @{
        "@babel/core" = "^7.20.0"
        "@types/react" = "~18.2.0"
        "typescript" = "^5.1.0"
    }
    "private" = $true
}

# Save package.json
$packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "$destBase\package.json" -Encoding utf8

# Create tsconfig.json
$tsconfig = @{
    "extends" = "expo/tsconfig.base"
    "compilerOptions" = @{
        "strict" = $true
        "baseUrl" = "."
        "paths" = @{
            "@/*" = @("./*")
        }
    }
    "include" = @(
        "**/*.ts",
        "**/*.tsx"
    )
}

$tsconfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "$destBase\tsconfig.json" -Encoding utf8

# Create app.json
$appJson = @{
    "expo" = @{
        "name" = "Restaurant Admin"
        "slug" = "restaurant-admin"
        "version" = "1.0.0"
        "orientation" = "portrait"
        "icon" = "./assets/icon.png"
        "splash" = @{
            "image" = "./assets/splash.png"
            "resizeMode" = "contain"
            "backgroundColor" = "#ffffff"
        }
        "updates" = @{
            "fallbackToCacheTimeout" = 0
        }
        "assetBundlePatterns" = @(
            "**/*"
        )
        "ios" = @{
            "supportsTablet" = $true
        }
        "android" = @{
            "adaptiveIcon" = @{
                "foregroundImage" = "./assets/adaptive-icon.png"
                "backgroundColor" = "#FFFFFF"
            }
        }
        "web" = @{
            "favicon" = "./assets/favicon.png"
        }
    }
}

$appJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "$destBase\app.json" -Encoding utf8

# Create .env file
"EXPO_PUBLIC_API_URL=https://your-api-url.com" | Out-File -FilePath "$destBase\.env" -Encoding utf8

Write-Host "Project setup complete! Navigate to the project directory and run 'npm install'"
