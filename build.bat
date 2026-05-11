@echo off
chcp 65001 >nul
title PomodoroClock 构建脚本

echo ============================================
echo    🍅 PomodoroClock 一键构建脚本
echo ============================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/zh-cn/download/
    echo 推荐版本：Node.js 18 LTS 或更高版本
    pause
    exit /b 1
)

:: 显示 Node.js 版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [信息] Node.js 版本：%NODE_VER%
echo [信息] npm 版本：%NPM_VER%
echo.

:: 进入脚本所在目录
cd /d "%~dp0"

:: 安装依赖
echo [1/3] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败，请检查网络连接或 npm 配置
    pause
    exit /b 1
)
echo [完成] 依赖安装成功
echo.

:: 构建项目
echo [2/3] 构建项目（Vite + TypeScript + electron-builder）...
echo       这一步可能需要几分钟，请耐心等待...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 构建失败，请检查上方错误信息
    pause
    exit /b 1
)
echo [完成] 项目构建成功
echo.

:: 显示输出文件
echo [3/3] 构建完成！
echo.
echo ============================================
echo    📦 输出文件位于 release\ 目录：
echo ============================================
echo.

echo    📦 安装包文件：
for %%f in ("release\PomodoroClock Setup *.exe") do echo       %%f
echo.
echo    📦 绿色版文件：
for %%f in ("release\win-unpacked\PomodoroClock.exe") do echo       %%f
echo.
if exist "release\win-unpacked\PomodoroClock.exe" (
    echo    ✅ 绿色版：release\win-unpacked\PomodoroClock.exe
)
echo.
echo ============================================
echo    🎉 全部完成！双击安装包即可安装使用
echo ============================================
echo.

:: 可选：打开 release 目录
choice /c yn /n /m "是否打开 release 目录？[Y/N] "
if %errorlevel% equ 2 goto :end
start "" "%~dp0release"
:end

pause