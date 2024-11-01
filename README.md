# Social Media Project

Đây là dự án social media đơn giản, phục vụ mục đích học tập và thực hành. Dự án bao gồm cả phần frontend và backend, được tổ chức theo cấu trúc thư mục như sau:

## Cấu trúc thư mục

```plaintext
project/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── backend/   (nếu có phần backend)
│   ├── routes/
│   └── controllers/
├── .env
└── README.md
```


### Chi tiết các thư mục

#### `public/`

Chứa các file tĩnh và file HTML gốc để render ứng dụng web:

- **index.html**: Trang HTML chính, là điểm khởi đầu của ứng dụng.
- **favicon.ico**: Icon của trang web, hiển thị trên tab trình duyệt.

#### `src/`

Chứa mã nguồn chính của ứng dụng, bao gồm các thành phần UI, các trang, dịch vụ và hàm hỗ trợ:

- **components/**: Chứa các thành phần giao diện nhỏ, có thể tái sử dụng trong nhiều trang, như `Navbar.js`, `Post.js`, `ProfileCard.js`.
- **pages/**: Chứa các trang chính của ứng dụng, như `HomePage.js`, `ProfilePage.js`. Mỗi trang đại diện cho một tính năng chính, như trang chủ, trang cá nhân, trang tin nhắn, v.v.
- **services/**: Chứa file gọi API hoặc các hàm xử lý giao tiếp với backend, ví dụ `api.js` hoặc `services.js`.
- **styles/**: Chứa các file CSS hoặc SCSS cho ứng dụng. Có thể chia nhỏ theo trang hoặc thành phần UI để dễ quản lý.
- **utils/**: Chứa các hàm hỗ trợ dùng chung trong ứng dụng, như `formatDate.js` để định dạng ngày tháng hoặc `validation.js` cho các quy tắc kiểm tra dữ liệu.

#### `backend/` (nếu có phần backend)

- **routes/**: Định nghĩa các route API cho từng chức năng của backend, ví dụ `userRoutes.js`, `postRoutes.js`.
- **controllers/**: Chứa các controller xử lý logic cho từng route, như `userController.js`, `postController.js`. Các controller này sẽ quản lý luồng dữ liệu và thao tác với cơ sở dữ liệu (nếu có).

#### `.env`

File này chứa các biến môi trường quan trọng như thông tin kết nối cơ sở dữ liệu, API keys, và các thông tin nhạy cảm khác. **Lưu ý:** Không chia sẻ file này khi công khai dự án.
