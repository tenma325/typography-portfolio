@echo off
rem Zen & Chaos portfolio — remaining build steps in one click.
rem 1) Generate the shattered-typography GLB with Blender (headless)
rem 2) Install deps (three) and start the dev server on 127.0.0.1:5173

"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --python "%~dp0build_chaos_asset.py"
if errorlevel 1 (
  echo [ERROR] Blender asset build failed. See output above.
  pause
  exit /b 1
)

cd /d "%~dp0.."
call npm install
call npm run dev -- --host 127.0.0.1 --port 5173
