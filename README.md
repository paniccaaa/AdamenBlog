# AdamenBlog

Личный блог-портфолио. Статический сайт на Vite + React + TypeScript — учебные работы по семестрам со ссылками на Google Drive и локальным оффлайн-fallback.

**Деплой:** https://adamen-blog.vercel.app

## Стек

React · TypeScript · Vite · React Router · SCSS · MUI

## Быстрый старт

```bash
git clone https://github.com/paniccaaa/AdamenBlog.git
cd AdamenBlog
npm install
npm run dev
```

Открыть http://localhost:5173

## Деплой на Vercel

1. Импортировать репозиторий в Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

`vercel.json` уже настроен для SPA-роутинга.

## Локальные файлы (оффлайн-режим)

Папка `public/works/` содержит ~600 МБ исходных файлов работ и **не включена в репозиторий** (`.gitignore`).

Без неё сайт работает полностью — ссылки ведут на Google Drive. Папка нужна только для оффлайн-доступа: если сервер запущен локально без интернета, `FileLink` автоматически открывает файл из `public/works/`.

**Чтобы получить архив `works/`** — свяжитесь:

- Telegram: [@paniccaaa](https://t.me/paniccaaa)
- Email: semaadamenko1@gmail.com

Скину zip-архив или ссылку на Google Drive для скачивания.

После получения — распаковать в `public/works/`.

## Добавление контента

### Структура

```
src/content/
  posts/        # Посты по семестрам (2.md = 1 сем, 3.md = 2 сем, ...)
  structure.json  # Навигация: курсы → семестры → postId
```

### Формат ссылок в постах

Каждая ссылка хранит **Drive URL** и **локальный fallback** в одной строке:

```markdown
[Метка](https://drive.google.com/file/d/FILE_ID/view "/works/N%20курс/Nсем/папка/файл.ext")
```

- Онлайн → открывается Drive
- Оффлайн + localhost → открывается локальный файл

URL-кодирование: пробелы → `%20`, `(` → `%28`, `)` → `%29`.

### Добавить новый семестр

1. Создать `src/content/posts/N.md`:

```markdown
---
id: N
title: "N Семестр"
---

## Название дисциплины

- [ЛР №1](https://drive.google.com/file/d/FILE_ID/view "/works/путь/к/файлу.pdf")
```

2. Добавить запись в `src/content/structure.json`:

```json
{
  "id": "d-new",
  "title": "N Семестр",
  "postId": N,
  "order": 1
}
```
