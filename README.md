## Giới thiệu

**PenNet** là một mạng xã hội cho phép người dùng đăng bài và nhắn tin. Với PenNet, bạn có thể dễ dàng kết nối với bạn bè, chia sẻ những khoảnh khắc đáng nhớ và trò chuyện với mọi người.

### Triển khai dự án

Để triển khai dự án này, bạn cần thực hiện các bước sau:

1. **Clone repository:**

   ```sh
   git clone https://github.com/notDuyLam/PenNet
   cd penet
   ```

2. **Cài đặt các phụ thuộc:**

   ```sh
   npm install
   ```

3. **Cấu hình biến môi trường:**

   - Tạo file `.env` từ file mẫu `.env.example`:
     ```sh
     cp .env.example .env
     ```
   - Mở file `.env` và cập nhật các giá trị biến môi trường phù hợp.

4. **Chạy ứng dụng:**

   ```sh
   npm start
   ```

5. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập `http://localhost:3000` để xem ứng dụng.

### Ghi chú

- Đảm bảo rằng bạn đã cài đặt Node.js và npm trên máy tính của mình.
- Kiểm tra các biến môi trường trong file `.env` để đảm bảo chúng đúng với cấu hình của bạn.
- Nếu gặp lỗi, kiểm tra log của ứng dụng để tìm hiểu nguyên nhân và cách khắc phục.
