# Registration And Invite Checklist

## Product Model

- [ ] Chốt mô hình chính thức:
  - user đăng ký mới sẽ được tạo `workspace` riêng
  - user đó là `OWNER` của workspace đó
  - user đó có đầy đủ chức năng trong phạm vi workspace như user hiện tại
  - member được invite sẽ thuộc workspace của owner đó
  - member được invite không tự tạo workspace riêng khi nhận lời mời

- [ ] Chốt mô hình quyền:
  - owner có quyền quản lý pages, spaces, groups, members, shares, workspace settings
  - owner không có quyền bootstrap hệ thống, env config, domain config toàn hệ thống, hay các chức năng vận hành instance

## Phase 1: Registration And Workspace Ownership

### Goal

- [ ] User mới đăng ký sẽ có workspace riêng
- [ ] User mới trở thành `OWNER`
- [ ] User mới được login ngay và dùng đầy đủ chức năng trong workspace của mình
- [ ] Flow invite member hiện tại vẫn hoạt động

### Backend

- [ ] Tạo DTO mới `apps/server/src/core/auth/dto/register-user.dto.ts`
- [ ] DTO cần có:
  - `name`
  - `email`
  - `password`
  - `workspaceName`
  - `hostname?`

- [ ] Refactor `apps/server/src/core/auth/services/signup.service.ts`
- [ ] Tách rõ 2 flow:
  - `registerOwnerWithWorkspace(...)`
  - `signupToWorkspace(...)` hoặc giữ `signup(...)` cho invite/member

- [ ] Trong `registerOwnerWithWorkspace(...)`:
  - tạo user mới
  - set role `OWNER`
  - tạo workspace
  - gán `workspaceId` cho user
  - tạo default group
  - tạo default space
  - add owner vào default group
  - add owner vào default space
  - return `{ user, workspace }`

- [ ] Thêm check email global ở `apps/server/src/database/repos/user/user.repo.ts`
- [ ] Tạo method kiểu `findByEmailGlobal(email)`
- [ ] Dùng check này để chặn 1 email đăng ký nhiều workspace nếu muốn giữ mô hình `1 user = 1 workspace`

- [ ] Sửa `apps/server/src/core/auth/services/auth.service.ts`
- [ ] Thêm method `registerOwner(...)`
- [ ] Sau khi đăng ký thành công:
  - generate auth token
  - return auth token + workspace

- [ ] Sửa `apps/server/src/core/auth/auth.controller.ts`
- [ ] Thêm endpoint `POST /auth/register`
- [ ] Endpoint này phải:
  - public
  - không dùng `SetupGuard`
  - set auth cookie
  - return workspace hoặc payload tương ứng

### Frontend

- [ ] Sửa `apps/client/src/features/auth/types/auth.types.ts`
- [ ] Thêm type cho register

- [ ] Sửa `apps/client/src/features/auth/services/auth-service.ts`
- [ ] Thêm hàm `register()`

- [ ] Sửa `apps/client/src/features/auth/hooks/use-auth.ts`
- [ ] Thêm handler `signUp()`
- [ ] Sau khi signup thành công:
  - redirect `/home`
  - user vào workspace mới tạo của chính họ

- [ ] Tạo `apps/client/src/features/auth/components/sign-up-form.tsx`
- [ ] Form gồm:
  - name
  - email
  - password
  - workspace name
  - hostname nếu cần

- [ ] Tạo `apps/client/src/pages/auth/signup.tsx`
- [ ] Mount route `/signup` trong `apps/client/src/App.tsx`
- [ ] Dùng route constant có sẵn trong `apps/client/src/lib/app-route.ts`

- [ ] Cập nhật `apps/client/src/features/auth/components/login-form.tsx`
- [ ] Thêm CTA:
  - `Sign up`
  - mô tả rõ là sẽ tạo workspace riêng

### Invite Member

- [ ] Giữ lại flow invite member hiện có
- [ ] Xác nhận lại nghiệp vụ:
  - owner của workspace có thể invite member vào workspace của mình
  - member được invite là user phụ thuộc workspace đó
  - member không có workspace riêng nếu vào bằng invite

- [ ] Rà `apps/server/src/core/workspace/services/workspace-invitation.service.ts`
- [ ] Đảm bảo flow invite vẫn đúng sau refactor signup:
  - không tạo workspace mới
  - tạo user trong workspace hiện tại
  - gán role theo invitation
  - add default group
  - add groupIds được chỉ định trong invitation

- [ ] Tách rõ naming để tránh lẫn:
  - register owner = tạo workspace riêng
  - accept invite = tạo member trong workspace owner

- [ ] Rà UI member management
- [ ] Xác nhận owner vẫn có đầy đủ chức năng:
  - create invite
  - resend invite
  - revoke invite
  - activate/deactivate member
  - change member role

### Acceptance Criteria

- [ ] Một user mới có thể đăng ký
- [ ] User đó có workspace riêng
- [ ] User đó là `OWNER`
- [ ] User đó đăng nhập ngay sau khi đăng ký
- [ ] Owner vẫn invite member bình thường
- [ ] Member được invite không tạo workspace riêng

## Phase 2: Super User

### Goal

- [ ] User đầu tiên đăng ký trong hệ thống sẽ là `Super User`
- [ ] `Super User` vẫn có workspace riêng và vẫn là `OWNER` của workspace đó
- [ ] `Super User` có thêm quyền quản lý user toàn hệ thống

### Backend

- [ ] Chốt cách lưu quyền `Super User`
- [ ] Chọn 1 hướng:
  - field như `isSuperUser`
  - hoặc system role riêng

- [ ] Thêm cách xác định user đầu tiên trong hệ thống
- [ ] Có thể cần:
  - method đếm tổng user toàn hệ thống
  - hoặc query kiểm tra đã có `Super User` chưa

- [ ] Cập nhật `registerOwnerWithWorkspace(...)`
- [ ] Nếu là user đầu tiên:
  - gắn quyền `Super User`

- [ ] Rà quyền backend
- [ ] Xác nhận:
  - owner thường không có quyền hệ thống
  - `Super User` có quyền hệ thống cần thiết cho quản lý user

### Frontend

- [ ] Mở rộng current user payload nếu cần để biết user có phải `Super User` không
- [ ] Đảm bảo UI có thể conditionally render các phần dành riêng cho `Super User`

### Acceptance Criteria

- [ ] User đầu tiên là `Super User`
- [ ] User thứ hai không tự động là `Super User`
- [ ] Owner thường và `Super User` được phân biệt rõ

## Phase 3: System User Management

### Goal

- [ ] Thêm menu `User Management` trong settings
- [ ] Chỉ `Super User` mới nhìn thấy menu này
- [ ] `Super User` có thể liệt kê user đã đăng ký, deactivate, activate, delete

### Backend

- [ ] Thêm API quản lý user toàn hệ thống
- [ ] Chức năng tối thiểu:
  - liệt kê các user đã đăng ký
  - deactivate user
  - activate user
  - delete user

- [ ] Gợi ý endpoint:
  - `POST /system/users`
  - `POST /system/users/deactivate`
  - `POST /system/users/activate`
  - `POST /system/users/delete`

- [ ] Các API này phải:
  - chỉ cho `Super User`
  - chặn owner thường
  - có audit log

- [ ] Dữ liệu list user nên có:
  - user id
  - name
  - email
  - workspace id
  - workspace name
  - workspace role
  - `isSuperUser`
  - trạng thái active/deactivated
  - `createdAt`
  - `lastLoginAt`

- [ ] Rule an toàn:
  - không cho deactivate `Super User` cuối cùng
  - không cho delete `Super User` cuối cùng
  - không cho tự xóa chính mình nếu đó là admin hệ thống duy nhất

### Frontend

- [ ] Thêm menu mới trong settings:
  - `User Management`
  - menu này chỉ hiển thị cho `Super User`

- [ ] Tạo trang quản lý user hệ thống
- [ ] Chức năng của trang:
  - liệt kê các user đã đăng ký
  - tìm kiếm theo tên hoặc email
  - deactivate user
  - activate user
  - delete user

- [ ] UI list nên hiển thị:
  - name
  - email
  - workspace
  - role
  - trạng thái
  - ngày tạo
  - lần đăng nhập cuối
  - badge `Super User`

- [ ] Cập nhật route trong `apps/client/src/App.tsx`
- [ ] Cập nhật settings sidebar để hiện menu `User Management` khi user là `Super User`

- [ ] Thêm confirm modal cho action nguy hiểm:
  - deactivate
  - delete

### Acceptance Criteria

- [ ] `Super User` thấy menu `User Management`
- [ ] `Super User` xem được danh sách user
- [ ] `Super User` deactivate/activate/delete được user theo rule đã chốt
- [ ] Owner thường không thấy menu này
- [ ] Owner thường bị chặn nếu gọi API hệ thống

## Cross-Cutting Review

### Permissions Review

- [ ] Rà các route/settings để xác nhận owner có đầy đủ chức năng workspace-level
- [ ] Rà các route/settings để xác nhận owner không chạm vào system-level settings

- [ ] Kiểm tra tối thiểu các khu vực sau:
  - workspace settings
  - members
  - groups
  - spaces
  - sharing
  - account profile
  - password
  - auth/session

- [ ] Kiểm tra các thứ ngoài phạm vi owner:
  - setup/bootstrap
  - domain/app env toàn hệ thống
  - system instance configuration

- [ ] Rà quyền `Super User` riêng:
  - thấy menu `User Management`
  - gọi được API list, activate, deactivate, delete user
  - owner thường không thấy menu này
  - owner thường bị chặn ở backend nếu gọi API hệ thống

### Naming Cleanup

- [ ] Đổi tên `initialSetup()` trong `apps/server/src/core/auth/services/signup.service.ts`
- [ ] Không dùng tên mang nghĩa bootstrap cho flow product registration nữa

- [ ] Hạn chế reuse `CreateAdminUserDto` cho signup flow mới
- [ ] Nếu cần, tạo DTO riêng cho register để code dễ đọc hơn

- [ ] Ghi chú trong code:
  - `setup` là legacy bootstrap
  - `register` là onboarding chính thức
  - `invite` là tạo member trong workspace có sẵn

### Validation And Safety

- [ ] Chặn duplicate email theo rule đã chốt
- [ ] Chặn duplicate hostname
- [ ] Validate reserved hostname
- [ ] Chuẩn hóa email lowercase
- [ ] Rate limit endpoint register
- [ ] Hiển thị lỗi rõ ràng khi signup fail

- [ ] Nếu cần phase sau:
  - email verification
  - anti-spam
  - captcha

## Tests

### Phase 1

- [ ] test register thành công tạo user
- [ ] test register thành công tạo workspace
- [ ] test register set owner role
- [ ] test register tạo default group
- [ ] test register tạo default space
- [ ] test register set auth cookie
- [ ] test duplicate email bị chặn
- [ ] test duplicate hostname bị chặn
- [ ] test invite member vẫn tạo user trong workspace hiện tại
- [ ] test invite member không tạo workspace mới
- [ ] test signup page render đúng
- [ ] test signup validation đúng
- [ ] test signup thành công redirect `/home`
- [ ] test login có link tới signup
- [ ] test invite signup vẫn hoạt động

### Phase 2

- [ ] test user đầu tiên trở thành `Super User`
- [ ] test user thứ hai không phải `Super User`

### Phase 3

- [ ] test list user hệ thống chỉ cho `Super User`
- [ ] test deactivate user hệ thống hoạt động
- [ ] test activate user hệ thống hoạt động
- [ ] test delete user hệ thống hoạt động
- [ ] test không thể deactivate `Super User` cuối cùng
- [ ] test không thể delete `Super User` cuối cùng
- [ ] test chỉ `Super User` thấy menu `User Management`
- [ ] test trang `User Management` render danh sách user
- [ ] test action deactivate, activate, delete gọi đúng API

### Verification

- [ ] `client` build pass
- [ ] `server` build pass
- [ ] login vẫn hoạt động
- [ ] forgot-password vẫn hoạt động
- [ ] invite member vẫn hoạt động

## Recommended Execution Order

- [ ] Bước 1: hoàn thành Phase 1
- [ ] Bước 2: hoàn thành Phase 2
- [ ] Bước 3: hoàn thành Phase 3
- [ ] Bước 4: review permissions và naming cleanup
- [ ] Bước 5: hoàn thiện test và verification
