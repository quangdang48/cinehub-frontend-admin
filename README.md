# Cinehub Admin Dashboard

Dự án Dashboard quản trị cho hệ thống Cinehub, được xây dựng bằng Next.js (App Router), TypeScript, Shadcn UI và Tailwind CSS.

## Yêu cầu hệ thống

Đảm bảo máy của bạn đã cài đặt:

- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
- Trình quản lý gói: `pnpm` (khuyến khích), `npm` hoặc `yarn`.

## Cài đặt

1.  **Clone dự án:**

    ```bash
    git clone https://github.com/quangdang48/cinehub-frontend-admin
    cd cinehub-frontend-admin
    ```

2.  **Cài đặt các thư viện phụ thuộc:**

    ```bash
    # Sử dụng pnpm
    pnpm install

    # Hoặc npm
    npm install

    # Hoặc yarn
    yarn install
    ```

## Cấu hình môi trường

Dự án cần các biến môi trường để kết nối với Backend và cấu hình xác thực.

1.  Sao chép file mẫu `.env.example` thành `.env`:

    ```bash
    cp .env.example .env
    ```

2.  Cập nhật các giá trị trong file `.env`:

    - `NEXTAUTH_URL`: Đường dẫn chạy dự án Admin hiện tại (mặc định local: `http://localhost:3000`).
    - `NEXTAUTH_SECRET`: Khóa bí mật dùng để mã hóa session (có thể dùng chuỗi ngẫu nhiên dài bất kỳ).
    - `BACKEND_CLIENT_API`: Đường dẫn API của Client (nếu cần tham chiếu) (mặc định: `http://localhost:8080/api/v1`).
    - `BACKEND_ADMIN_API`: Đường dẫn API Service dành cho Admin (mặc định: `http://localhost:3322/api/v1`).
    - `ACCESS_TOKEN_EXPIRES_IN`: Thời gian hết hạn của token (tính bằng milli-seconds hoặc seconds tùy cấu hình backend, mặc định ví dụ: `840000`).

## Chạy dự án

1.  **Development Mode:**

    ```bash
    npm run dev
    # hoặc pnpm dev / yarn dev
    ```

    Truy cập: `http://localhost:3000`

2.  **Production Build:**

    ```bash
    npm run build
    npm run start
    ```

## Các Scripts khác

- `npm run lint`: Kiểm tra lỗi và format code.
