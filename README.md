# Học Tiếng Trung — MVP

MVP mobile-first cho dự án học tiếng Trung, dựng từ **Bài 1 — 你好 / Xin chào** của bộ video Giáo trình Hán ngữ.

## Có gì trong bản này

- Home với tiến độ học và streak/XP giả lập.
- Lộ trình Hán ngữ Quyển 1 (15 bài, chỉ Bài 1 đang mở trong MVP).
- Lesson Bài 1 gồm: Tổng quan, Video, Từ mới, Ngữ pháp, Luyện nói, Quiz.
- 22 mục từ/chữ từ dữ liệu Bài 1.
- 2 cấu trúc ngữ pháp: `吗` và `不`.
- Quiz 8 câu, chấm điểm ngay trong trình duyệt.
- Progress tạm lưu bằng `localStorage`.
- Mobile-first, không dùng UI framework để dễ đưa lên Cloudflare Pages.

## Chạy local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output ở `dist/` và có thể deploy static lên Cloudflare Pages.

## Video từ Cloudflare R2

Video đã được upload vào private bucket `hoctiengtrung` tại object key:

```text
video/volume-01/lesson-01/lecture-p01.mp4
```

Không đưa R2 Access Key/Secret vào frontend. Khi có Cloudflare Worker hoặc signed/proxy URL, đặt:

```bash
VITE_VIDEO_URL=https://.../video/volume-01/lesson-01/lecture-p01.mp4
```

Xem `.env.example`.

## Bước tiếp theo

1. Cloudflare Worker: đọc JSON/video private R2 qua API an toàn.
2. Supabase Free: Auth + user profile + lesson progress + quiz attempts + SRS.
3. Content API: tải `lesson.json` từ `content/volume-01/lesson-01/` thay vì hard-code.
4. Nhân schema Bài 1 sang toàn bộ giáo trình.
