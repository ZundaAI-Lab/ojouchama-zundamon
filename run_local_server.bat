@echo off
REM 責務: ローカル起動用HTTPサーバを起動する補助コマンドを提供する。
REM 更新ルール: コマンド変更時は README の起動手順と同時に更新し、@echo off は先頭に保つ。
cd /d %~dp0
py -m http.server 8000
