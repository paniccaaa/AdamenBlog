#!/bin/bash
PORT=5173
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Запуск блога на http://localhost:$PORT"
echo "Нажми Ctrl+C чтобы остановить."

(sleep 1 && open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) &

if command -v python3 &>/dev/null; then
  cd "$DIR" && python3 -m http.server $PORT
elif command -v python &>/dev/null; then
  cd "$DIR" && python -m SimpleHTTPServer $PORT
elif command -v npx &>/dev/null; then
  npx serve "$DIR" -p $PORT
else
  echo "Ошибка: нужен Python 3, Python 2 или Node.js"
  exit 1
fi
