@echo off
chcp 65001 >nul
title AI设计作品集展示平台 - 推送到 GitHub
echo ========================================
echo   AI设计作品集展示平台 - Git 推送脚本
echo ========================================
echo.

cd /d "%~dp0"

:: ========================================
:: 场景1：提交所有变更（带默认消息）
:: ========================================
:: echo [场景1] 提交所有变更...
:: git add -A
:: git commit -m "更新项目文件"
:: git push
:: goto :end

:: ========================================
:: 场景2：提交所有变更（自定义消息）
:: ========================================
:: echo [场景2] 提交所有变更...
:: set /p msg=请输入提交消息：
:: if "%msg%"=="" set msg=更新项目文件
:: git add -A
:: git commit -m "%msg%"
:: git push
:: goto :end

:: ========================================
:: 场景3：仅提交特定文件（如 src/ 和 public/）
:: ========================================
:: echo [场景3] 提交特定文件...
:: git add src/ public/
:: git commit -m "更新源代码和静态资源"
:: git push
:: goto :end

:: ========================================
:: 场景4：添加并提交特定文件
:: ========================================
:: echo [场景4] 添加并提交特定文件...
:: set /p files=请输入要提交的文件路径（空格分隔）：
:: git add %files%
:: set /p msg=请输入提交消息：
:: if "%msg%"=="" set msg=更新文件
:: git commit -m "%msg%"
:: git push
:: goto :end

:: ========================================
:: 场景5：强制推送（谨慎使用！）
:: ========================================
:: echo [警告] 强制推送会覆盖远程历史记录！
:: set /p confirm=确定要继续吗？(y/n):
:: if /i not "%confirm%"=="y" (
::     echo 已取消操作。
::     goto :end
:: )
:: git add -A
:: git commit --amend --no-edit
:: git push --force
:: goto :end

:: ========================================
:: 默认：显示菜单让用户选择
:: ========================================
:menu
echo 请选择要执行的操作：
echo.
echo   [1] 提交所有变更（默认消息："更新项目文件"）
echo   [2] 提交所有变更（自定义消息）
echo   [3] 仅提交源代码和静态资源 (src/ + public/)
echo   [4] 自定义选择文件和提交消息
echo   [5] 强制推送（⚠️ 谨慎使用）
echo   [6] 查看当前状态（git status）
echo   [7] 查看最近提交记录（git log）
echo   [0] 退出
echo.
set /p choice=请输入选项编号 (0-7):

if "%choice%"=="1" (
    echo.
    echo 正在提交所有变更...
    git add -A
    git commit -m "更新项目文件"
    git push
) else if "%choice%"=="2" (
    echo.
    set /p "msg=请输入提交消息："
    if "%msg%"=="" set msg=更新项目文件
    echo 正在提交...
    git add -A
    git commit -m "%msg%"
    git push
) else if "%choice%"=="3" (
    echo.
    echo 正在提交源代码和静态资源...
    git add src/ public/
    git commit -m "更新源代码和静态资源"
    git push
) else if "%choice%"=="4" (
    echo.
    set /p "files=请输入要提交的文件路径（空格分隔）："
    set /p "msg=请输入提交消息："
    if "%msg%"=="" set msg=更新文件
    echo 正在提交 %files% ...
    git add %files%
    git commit -m "%msg%"
    git push
) else if "%choice%"=="5" (
    echo.
    echo ⚠️  警告：强制推送会覆盖远程历史记录！
    set /p "confirm=确定要继续吗？(y/n)："
    if /i not "%confirm%"=="y" (
        echo 已取消操作。
        pause
        goto menu
    )
    echo 正在强制推送...
    git add -A
    git commit --amend --no-edit
    git push --force
) else if "%choice%"=="6" (
    echo.
    echo 当前状态：
    echo.
    git status
    pause
    goto menu
) else if "%choice%"=="7" (
    echo.
    echo 最近提交记录：
    echo.
    git log --oneline -10
    pause
    goto menu
) else if "%choice%"=="0" (
    exit
) else (
    echo 无效选项！
    pause
    goto menu
)

:end
echo.
echo 操作完成！
pause
