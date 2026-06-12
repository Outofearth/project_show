@echo off
chcp 65001 >nul
title AI设计作品集展示平台 - 本地服务器
echo ========================================
echo   AI设计作品集展示平台 - 启动脚本
echo ========================================
echo.

cd /d "%~dp0"

:: ========================================
:: 场景1：启动开发服务器（默认端口 5175）
:: ========================================
:: echo [场景1] 启动开发服务器...
:: npm run dev
:: goto :end

:: ========================================
:: 场景2：启动开发服务器并指定端口（如 3000）
:: ========================================
:: echo [场景2] 启动开发服务器（端口 3000）...
:: npm run dev -- --port 3000
:: goto :end

:: ========================================
:: 场景3：启动开发服务器并自动打开浏览器
:: ========================================
:: echo [场景3] 启动开发服务器（自动打开浏览器）...
:: npm run dev -- --open
:: goto :end

:: ========================================
:: 场景4：生成静态数据并构建 GitHub Pages 版本
:: ========================================
:: echo [场景4] 生成静态数据并构建...
:: npx tsx scripts/generate-static-data.ts
:: npm run build
:: echo.
:: echo 构建完成！运行 npm run preview 预览
:: goto :end

:: ========================================
:: 场景5：预览生产版本
:: ========================================
:: echo [场景5] 预览生产版本...
:: npm run preview
:: goto :end

:: ========================================
:: 默认：显示菜单让用户选择
:: ========================================
:menu
echo 请选择要执行的操作：
echo.
echo   [1] 启动开发服务器（默认端口 5175）
echo   [2] 启动开发服务器（端口 3000）
echo   [3] 启动开发服务器（自动打开浏览器）
echo   [4] 生成静态数据并构建
echo   [5] 预览生产版本
echo   [0] 退出
echo.
set /p choice=请输入选项编号 (0-5):

if "%choice%"=="1" (
    echo.
    echo 正在启动开发服务器...
    npm run dev
) else if "%choice%"=="2" (
    echo.
    echo 正在启动开发服务器（端口 3000）...
    npm run dev -- --port 3000
) else if "%choice%"=="3" (
    echo.
    echo 正在启动开发服务器（自动打开浏览器）...
    npm run dev -- --open
) else if "%choice%"=="4" (
    echo.
    echo 正在生成静态数据并构建...
    npx tsx scripts/generate-static-data.ts
    npm run build
    echo.
    echo 构建完成！
    pause
) else if "%choice%"=="5" (
    echo.
    echo 正在预览生产版本...
    npm run preview
) else if "%choice%"=="0" (
    exit
) else (
    echo 无效选项！
    pause
    goto menu
)

:end
pause
