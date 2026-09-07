# Cloudflare Worker API

Worker này đứng giữa frontend và private R2 bucket `hoctiengtrung`.

## API

- `GET /api/health`
- `GET /api/lesson/volume-01/lesson-01`
- `GET /api/content/volume-01/lesson-01/lesson.json`
- `GET /api/video/volume-01/lesson-01/lecture-p01.mp4`

Video endpoint hỗ trợ `Range`, nên trình duyệt có thể tua video mà không tải lại toàn bộ file.

## Deploy trên Windows

Trong thư mục `worker`, chạy:

```bat
DEPLOY_WINDOWS.bat
```

Script sẽ:

1. `npm install`
2. kiểm tra đăng nhập Wrangler
3. mở Cloudflare login nếu cần
4. `wrangler deploy`

R2 binding đã khai báo sẵn trong `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "CONTENT"
bucket_name = "hoctiengtrung"
```

Sau deploy, Wrangler sẽ trả URL dạng:

```text
https://hoctiengtrung-api.<your-subdomain>.workers.dev
```

Đặt URL đó vào frontend:

```env
VITE_API_BASE_URL=https://hoctiengtrung-api.<your-subdomain>.workers.dev
```

## Bảo mật

Không có S3 Access Key/Secret nào nằm trong repo hoặc frontend. Worker đọc R2 qua binding nội bộ Cloudflare.

Bản MVP hiện chưa yêu cầu Supabase JWT trên Worker. Khi Auth được bật, nên giới hạn API video/content theo user đăng nhập trước khi đưa app ra công khai rộng rãi.
