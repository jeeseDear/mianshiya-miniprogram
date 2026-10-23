@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 前端面试鸭 · 后端服务

if not exist ".venv\Scripts\python.exe" (
  echo [错误] 没找到虚拟环境 .venv
  echo.
  echo 先执行下面两条命令：
  echo   python -m venv .venv
  echo   .venv\Scripts\python.exe -m pip install -r requirements.txt
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [提示] 没有 .env，从 .env.example 复制一份
  copy ".env.example" ".env" >nul
)

echo ============================================
echo  前端面试鸭 后端服务
echo  接口地址：http://127.0.0.1:8100
echo  文档地址：http://127.0.0.1:8100/docs
echo  关闭窗口即停止服务
echo ============================================
echo.

.venv\Scripts\python.exe run.py
pause
