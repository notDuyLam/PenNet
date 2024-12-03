# Social Media Project - Penet

## Cấu trúc thư mục

```plaintext
project/
├── apps/
│   ├── users
│   └── admins
├── public/
│   ├── css
│   ├── images
│   |...
├── views/
│   ├── login.hbs
│   ├── home.hbs
│   |...
├── app.js
├── index.routes.js
├── .env
├── .env.example
└── README.md
```

### Chi tiết các thư mục

#### `public/`

Thư mục này chứa các tài nguyên tĩnh như CSS, hình ảnh, và các tệp JavaScript công khai.

#### `views/`

Thư mục này chứa các tệp giao diện người dùng được viết bằng Handlebars (hbs).

#### `modules/`

Thư mục này chứa mã nguồn chính của ứng dụng, bao gồm các module và các thành phần chính.

#### `app.js`

Tệp này là điểm vào chính của ứng dụng, nơi cấu hình và khởi tạo server.

#### `index.routes.js`

Tệp này định nghĩa các routes chính của ứng dụng, kết nối các yêu cầu HTTP với các hàm xử lý tương ứng. Với mỗi đối tượng người dùng trong apps sẽ có nhiều

#### `.env.example`

Tệp này cung cấp một ví dụ về các biến môi trường cần thiết cho ứng dụng. Người dùng có thể sao chép và đổi tên thành `.env`.

#### `.env`

File này chứa các biến môi trường quan trọng như thông tin kết nối cơ sở dữ liệu, API keys, và các thông tin nhạy cảm khác. **Lưu ý:** Không chia sẻ file này khi công khai dự án.
