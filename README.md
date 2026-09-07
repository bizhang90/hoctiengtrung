# Học Tiếng Trung — MVP

MVP mobile-first cho dự án học tiếng Trung, dựng từ **Bài 1 — 你好 / Xin chào** của bộ video Giáo trình Hán ngữ.

## Kiến trúc hiện tại

```text
React/Vite frontend
      ↓
Cloudflare Worker API
      ↓
Private R2 bucket: hoctiengtrung
      ├── content/...
      └── video/...

Supabase Free (giai đoạn user)
      ├── Auth
      ├── profiles
      ├── lesson_progress
      ├── quiz_attempts
      └── vocabulary_progress
```

## MVP có gì

- Home với tiến độ học và streak/XP giả lập.
- Lộ trình Hán ngữ Quyển 1 (15 bài, Bài 1 đang mở).
- Lesson Bài 1: Tổng quan, Video, Từ mới, Ngữ pháp, Luyện nói, Quiz.
- 22 mục từ/chữ từ dữ liệu Bài 1.
- Worker đọc `lesson.json` trực tiếp từ private R2.
- Video stream qua Worker có hỗ trợ HTTP Range để tua.
- Fallback local: nếu Worker chưa deploy, app vẫn hiển thị dữ liệu Bài 1 nhúng sẵn.
- Progress MVP tạm lưu bằng `localStorage` cho đến khi nối Supabase.

## Chạy frontend local

```bash
npm install
npm run dev
```

Tạo `.env`:

```env
VITE_API_BASE_URL=https://hoctiengtrung-api.<your-subdomain>.workers.dev
```

Không đưa R2 S3 credentials vào frontend.

## Deploy Cloudflare Worker

Worker nằm trong `worker/`.

Trên Windows:

```text
worker\DEPLOY_WINDOWS.bat
```

Hoặc thủ công:

```bash
cd worker
npm install
npx wrangler login
npm run deploy
```

R2 binding đã trỏ sẵn tới bucket:

```text
hoctiengtrung
```

API chính:

```text
GET /api/health
GET /api/lesson/volume-01/lesson-01
GET /api/content/volume-01/lesson-01/lesson.json
GET /api/video/volume-01/lesson-01/lecture-p01.mp4
```

## Supabase

Supabase chỉ lưu user và quá trình học, không chứa video/content.

Migration đã chuẩn bị tại:

```text
supabase/migrations/202609070001_init_learning_progress.sql
```

Schema gồm RLS để mỗi user chỉ đọc/ghi dữ liệu của chính mình.

## Trạng thái dữ liệu

- 157/157 video đã verify trên R2.
- Bài 1 đã có JSON content tại `content/volume-01/lesson-01/`.
- Frontend đã sẵn sàng đọc Bài 1 từ Worker khi `VITE_API_BASE_URL` được cấu hình.

## Bước tiếp theo

1. Deploy Worker và kiểm tra `/api/health` + phát video.
2. Deploy frontend lên Cloudflare Pages.
3. Tạo Supabase Free project riêng cho app, apply migration.
4. Nối Google/email login và chuyển progress từ `localStorage` sang Supabase.
5. Nhân schema Bài 1 sang toàn bộ giáo trình.
