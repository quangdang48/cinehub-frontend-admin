# Cinehub Admin - Refactoring Documentation

## Tổng quan
Đã refactor toàn bộ admin panel để sử dụng shadcn/ui components và thêm chức năng upload video/poster.

## Các thay đổi chính

### 1. Upload Components (Client-side)

#### ImageUpload Component
**Location:** `src/components/upload/image-upload.tsx`

**Features:**
- Upload multiple images (hoặc single)
- Drag & drop support
- Preview thumbnails
- Validation (file type, size)
- Progress feedback
- Client-side processing (không block server)

**Usage:**
```tsx
<ImageUpload
  value={posters}
  onChange={setPosters}
  multiple
  label="Upload posters"
  description="Hỗ trợ JPG, PNG, WebP (tối đa 5MB)"
  maxSize={5}
/>
```

#### VideoUpload Component
**Location:** `src/components/upload/video-upload.tsx`

**Features:**
- Upload large video files
- Chunked upload simulation với progress bar
- Video preview with controls
- File info display (size, duration)
- Client-side processing
- Error handling

**Usage:**
```tsx
<VideoUpload
  value={videoUrl}
  onChange={setVideoUrl}
  label="Upload video"
  maxSize={500}
  onUploadProgress={(progress) => console.log(progress)}
/>
```

### 2. Movie Form Refactoring

**Location:** `src/modules/movies/components/movie-form.tsx`

**Improvements:**
- ✅ Sử dụng Tabs để chia form thành sections:
  - **Basic Info:** Thông tin cơ bản phim
  - **Media:** Upload video và posters
  - **People:** Genres, Directors, Cast
  - **Advanced:** Các tính năng nâng cao (placeholder)
  
- ✅ Replace custom components với shadcn:
  - `Button`, `Input`, `Textarea`, `Label`
  - `Card`, `CardHeader`, `CardTitle`, `CardContent`
  - `Select`, `Tabs`, `Badge`, `Separator`
  
- ✅ Sử dụng `toast` từ `sonner` thay vì custom toast
- ✅ Sticky header và footer với action buttons
- ✅ Better UX với visual feedback

### 3. Movie Filters Refactoring

**Location:** `src/modules/movies/components/movie-filters.tsx`

**Improvements:**
- ✅ Wrapped trong Card component
- ✅ Better layout với responsive design
- ✅ Active filters display với badges
- ✅ Quick remove filter buttons
- ✅ Filter icon indicator

### 4. Movie Table Refactoring

**Location:** `src/modules/movies/components/movie-table.tsx`

**Improvements:**
- ✅ Wrapped trong Card component
- ✅ Sử dụng `toast` từ `sonner`
- ✅ Better loading states
- ✅ Pagination trong card footer
- ✅ Cleaner delete dialog

### 5. Dashboard Page

**Location:** `src/app/(admin)/dashboard/page.tsx`

**Features:**
- ✅ Stats cards với icons
- ✅ Trend indicators
- ✅ Responsive grid layout
- ✅ Skeleton loading states
- ✅ Mock data (ready for API integration)

### 6. Users Page

**Location:** `src/app/(admin)/users/page.tsx`

**Features:**
- ✅ Search interface
- ✅ Action buttons
- ✅ Placeholder for table
- ✅ Ready for implementation

### 7. Plans Page

**Location:** `src/app/(admin)/plans/page.tsx`

**Features:**
- ✅ Pricing cards với features list
- ✅ Status badges
- ✅ Action buttons
- ✅ Mock data structure

## Components được sử dụng

### Shadcn UI Components
- ✅ `Button` - Actions và navigation
- ✅ `Card` - Container cho sections
- ✅ `Input` - Form inputs
- ✅ `Textarea` - Long text inputs
- ✅ `Label` - Form labels
- ✅ `Select` - Dropdowns
- ✅ `Badge` - Status indicators, tags
- ✅ `Tabs` - Organize form sections
- ✅ `Separator` - Visual dividers
- ✅ `AlertDialog` - Confirmations
- ✅ `DropdownMenu` - Action menus
- ✅ `Spinner` - Loading states
- ✅ `Skeleton` - Loading placeholders
- ✅ `Progress` - Upload progress
- ✅ `Pagination` - Table pagination
- ✅ `toast (sonner)` - Notifications

### Custom Components
- ✅ `ImageUpload` - Multiple image upload
- ✅ `VideoUpload` - Video file upload with progress

## Best Practices Implemented

1. **Client Components cho Upload:**
   - Tất cả upload logic ở client để xử lý files nặng
   - Không block server rendering
   - Better UX với immediate feedback

2. **Consistent Styling:**
   - Sử dụng shadcn design tokens
   - Responsive design
   - Dark mode ready

3. **Form Organization:**
   - Tabs để chia nhỏ form phức tạp
   - Logical grouping
   - Better navigation

4. **Error Handling:**
   - File validation
   - User-friendly error messages
   - Toast notifications

5. **Loading States:**
   - Skeleton loaders
   - Spinners
   - Progress indicators

## TODO: Backend Integration

```typescript
// Example API integration for uploads
async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await fetch('/api/upload/video', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url;
}

// Update trong VideoUpload component
const uploadFile = async (file: File): Promise<string> => {
  return await uploadVideo(file); // Replace mock upload
};
```

## Notes

- Tất cả upload components đều là **client components** (`"use client"`)
- Mock data có thể thay bằng real API calls
- Progress bars có thể integrate với chunked upload APIs
- Form validation đã setup với zod schemas
