# Học Tiếng Trung — MVP

MVP mobile-first cho dự án học tiếng Trung, dựng từ **Bài 1 — 你好 / Xin chào** của bộ video Giáo trình Hán ngữ.

## Kiến trúc hiện tại

```text
GitHub: bizhang90/hoctiengtrung
          ↓
        Vercel
   ┌──────┴──────┐
   │             │
React/Vite    /api/*
frontend      serverless API
                  ↓
          Cloudflare R2 private
          ├── content/...
          └── video/...

Supabase Free (giai đoạn user)
├── Auth
├── profiles
├── lesson_progress
├── quiz_attempts
└── vocabulary_progress
```

Cloudflare Worker không còn bắt buộc cho MVP. Thư mục `worker/` được giữ lại như phương án tham khảo cũ, nhưng luồng deploy chính là Vercel.

## MVP có gì

- Home với tiến độ học và streak/XP giả lập.
- Lộ trình Hán ngữ Quyển 1 (15 bài, Bài 1 đang mở).
- Lesson Bài 1: Tổng quan, Video, Từ mới, Ngữ pháp, Luyện nói, Quiz.
- 22 mục từ/chữ từ dữ liệu Bài 1.
- Vercel API đọc `lesson.json` từ private R2.
- Vercel API tạo signed URL tạm thời để trình duyệt phát video trực tiếp từ R2.
- Video không proxy xuyên qua Vercel nên không tốn bandwidth video của Vercel.
- Progress MVP tạm lưu bằng `localStorage` cho đến khi nối Supabase.

## API Vercel

```text
GET /api/health
GET /api/lesson?volume=01&lesson=01
GET /api/video-url?volume=01&lesson=01
GET /api/video-url?volume=01&lesson=01&json=1
```

`/api/video-url` mặc định trả HTTP 302 sang signed URL R2 có hạn 1 giờ. Thêm `json=1` nếu muốn xem URL trong JSON.

## Environment Variables trên Vercel

Trong **Project Settings → Environment Variables**, thêm:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET=hoctiengtrung
```

Không bao giờ đưa `R2_SECRET_ACCESS_KEY` vào code frontend hoặc GitHub.

Frontend production đã cấu hình sẵn:

```text
VITE_VIDEO_URL=/api/video-url?volume=01&lesson=01
```

## Deploy lên Vercel

1. Vercel → **Add New → Project**.
2. Import repo `bizhang90/hoctiengtrung`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Thêm 4 Environment Variables R2 ở trên cho Production, Preview và Development nếu cần.
7. Bấm **Deploy**.

Sau khi deploy, kiểm tra:

```text
https://<domain-vercel>/api/health
https://<domain-vercel>/api/lesson?volume=01&lesson=01
https://<domain-vercel>/api/video-url?volume=01&lesson=01&json=1
```

Nếu ba URL trên hoạt động, mở trang chính và vào tab Video của Bài 1.

## Chạy local

Frontend thuần:

```bash
npm install
npm run dev
```

Để chạy cả Vercel API local, nên dùng Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Tạo `.env.local` theo `.env.example` với credential R2 của riêng máy local. Không commit `.env.local`.

## Supabase

Supabase chỉ lưu user và quá trình học, không chứa video/content.

Migration đã chuẩn bị tại:

```text
supabase/migrations/202609070001_init_learning_progress.sql
```

Schema có RLS để mỗi user chỉ đọc/ghi dữ liệu của chính mình.

## Trạng thái dữ liệu

- 157/157 video đã verify trên R2.
- Bài 1 video nằm tại `video/volume-01/lesson-01/lecture-p01.mp4`.
- API lesson đọc `content/volume-01/lesson-01/lesson.json` nếu file này đã được upload lên R2.
- Frontend phát Bài 1 qua signed URL R2 cùng domain Vercel.

## Bước tiếp theo

1. Deploy repo lên Vercel và test 3 API.
2. Tạo Supabase Free project riêng cho app.
3. Apply migration.
4. Nối Google/email login và chuyển progress từ `localStorage` sang Supabase.
5. Nhân schema Bài 1 sang toàn bộ giáo trình.
