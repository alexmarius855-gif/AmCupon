@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   AmCupon.ro — Setup API Keys automat   ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo  Introdu valorile (Enter = pastreaza cea existenta):
echo.

set /p ADMIN_PASSWORD="  ADMIN_PASSWORD (parola /admin): "
set /p GITHUB_TOKEN="  ADMIN_GITHUB_TOKEN (ghp_ sau github_pat_): "
set /p ANTHROPIC_KEY="  ANTHROPIC_API_KEY (sk-ant-): "
set /p BREVO_KEY="  BREVO_API_KEY (xkeysib-): "

echo.
echo  [*] Setez pe Vercel (proiect: am-cupon-a8dz)...
echo.

if not "%ADMIN_PASSWORD%"=="" (
    echo %ADMIN_PASSWORD% | vercel env rm ADMIN_PASSWORD production --yes >nul 2>&1
    echo %ADMIN_PASSWORD% | vercel env add ADMIN_PASSWORD production --yes >nul 2>&1
    echo  [OK] ADMIN_PASSWORD setat
)

if not "%GITHUB_TOKEN%"=="" (
    echo %GITHUB_TOKEN% | vercel env rm ADMIN_GITHUB_TOKEN production --yes >nul 2>&1
    echo %GITHUB_TOKEN% | vercel env add ADMIN_GITHUB_TOKEN production --yes >nul 2>&1
    echo  [OK] ADMIN_GITHUB_TOKEN setat
)

if not "%ANTHROPIC_KEY%"=="" (
    echo %ANTHROPIC_KEY% | vercel env rm ANTHROPIC_API_KEY production --yes >nul 2>&1
    echo %ANTHROPIC_KEY% | vercel env add ANTHROPIC_API_KEY production --yes >nul 2>&1
    echo  [OK] ANTHROPIC_API_KEY setat
)

if not "%BREVO_KEY%"=="" (
    echo %BREVO_KEY% | vercel env rm BREVO_API_KEY production --yes >nul 2>&1
    echo %BREVO_KEY% | vercel env add BREVO_API_KEY production --yes >nul 2>&1
    echo  [OK] BREVO_API_KEY setat
)

:: GITHUB_REPO e mereu fix
echo alexmarius855-gif/AmCupon | vercel env rm GITHUB_REPO production --yes >nul 2>&1
echo alexmarius855-gif/AmCupon | vercel env add GITHUB_REPO production --yes >nul 2>&1
echo  [OK] GITHUB_REPO setat (alexmarius855-gif/AmCupon)

echo.
echo  [*] Redeploy pe Vercel...
vercel --prod --yes >nul 2>&1
echo  [OK] Redeploy pornit!

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   GATA! Mergi la: amcupon.ro/admin      ║
echo  ╚══════════════════════════════════════════╝
echo.
pause
