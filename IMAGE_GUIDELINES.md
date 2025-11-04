# 📸 Hướng dẫn kích thước ảnh tối ưu cho Website

## 🎯 Tổng quan

Website sử dụng `object-fit: cover` với `object-position: center`, có nghĩa là:
- ✅ Ảnh sẽ fill toàn bộ container
- ⚠️ Phần thừa sẽ bị cắt (crop) ở 2 bên để giữ aspect ratio
- 📍 Phần giữa ảnh sẽ được ưu tiên hiển thị

## 📐 Kích thước ảnh đề xuất

### 1️⃣ **Featured Article (Homepage - Card lớn bên trái)**

**Kích thước tối ưu:**
```
Width: 750px - 900px
Height: 500px - 600px
Aspect Ratio: 3:2 (horizontal)
File Size: 100-150KB (sau khi optimize)
Format: JPEG (quality 85%) hoặc WebP
```

**Container CSS:** `250px height` x `~500px width`

**Lưu ý:**
- Nội dung quan trọng nên ở giữa ảnh
- Tránh text/logo ở 4 góc (có thể bị crop)

---

### 2️⃣ **Regular Articles (Cards nhỏ)**

**Kích thước tối ưu:**
```
Width: 400px - 600px
Height: 267px - 400px
Aspect Ratio: 3:2
File Size: 50-80KB (sau khi optimize)
Format: JPEG (quality 80-85%) hoặc WebP
```

**Container CSS:** `200px height` x `~300px width`

**Lưu ý:**
- Dùng cho cards nhỏ ở homepage, category pages
- Ưu tiên dung lượng nhẹ để load nhanh

---

### 3️⃣ **Category Page Articles (Full width)**

**Kích thước tối ưu:**
```
Width: 800px - 1200px
Height: 533px - 800px
Aspect Ratio: 3:2 hoặc 16:9
File Size: 150-250KB (sau khi optimize)
Format: JPEG hoặc WebP
```

**Container CSS:** `fit-content` (tự động điều chỉnh)

---

### 4️⃣ **Carousel/Slider (Homepage banner)**

**Kích thước tối ưu:**
```
Width: 1500px - 2000px
Height: 500px - 667px
Aspect Ratio: 3:1 hoặc 16:9
File Size: 200-350KB
Format: JPEG hoặc WebP
```

**Container CSS:** `500px height` (desktop), `300px` (tablet), `250px` (mobile)

---

## 🔍 SEO Best Practices

### 1. **File Naming**
```
❌ BAD: IMG_1234.jpg, DSC_0001.jpg
✅ GOOD: review-iphone-15-pro-max.jpg
```

### 2. **Alt Text**
```
❌ BAD: alt="image" hoặc alt=""
✅ GOOD: alt="Review iPhone 15 Pro Max - Camera chất lượng cao"
```

### 3. **Image Optimization**
- Dùng tools: TinyPNG, ImageOptim, Squoosh
- Format: WebP > JPEG > PNG
- Compression: 75-85% quality
- Lazy loading: Tự động trong React (đã có)

---

## ⚡ Performance Tips

### 1. **Responsive Images**
Dùng `srcset` cho multiple sizes (tùy chọn nâng cao):
```html
<img 
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 768px) 400px, 800px"
  alt="..."
/>
```

### 2. **Image CDN**
- Cloudinary
- Imgix
- Cloudflare Images

### 3. **Format Modern**
- WebP: 25-35% nhẹ hơn JPEG
- AVIF: 50% nhẹ hơn JPEG (browser support còn hạn chế)

---

## 🎨 UX/UI Guidelines

### 1. **Composition (Bố cục)**
- Đặt subject chính ở **giữa ảnh**
- Rule of thirds: Điểm nhấn ở 1/3 khung hình
- Tránh đặt text quan trọng ở 4 góc

### 2. **Aspect Ratio Consistency**
Nên dùng **3:2** cho tất cả articles:
```
Featured: 900x600px (3:2)
Regular: 600x400px (3:2)
Category: 1200x800px (3:2)
```

### 3. **Color & Contrast**
- Ảnh sáng, tương phản cao → dễ nhìn
- Tránh ảnh quá tối hoặc quá sáng
- Background color `#f8f9fa` khi loading

---

## 🛠️ Tools đề xuất

### **Image Optimization:**
1. [TinyPNG](https://tinypng.com/) - Free, web-based
2. [Squoosh](https://squoosh.app/) - Google's tool
3. [ImageOptim](https://imageoptim.com/) - Mac app

### **Image Editing:**
1. Photoshop / GIMP
2. Canva - Quick resize
3. Figma - Design tool

### **Batch Processing:**
1. [XnConvert](https://www.xnview.com/en/xnconvert/) - Free
2. [ImageMagick](https://imagemagick.org/) - Command line

---

## 📊 Quick Reference Table

| Location | Width | Height | Ratio | Max Size | Format |
|----------|-------|--------|-------|----------|--------|
| Featured Article | 900px | 600px | 3:2 | 150KB | JPEG/WebP |
| Regular Article | 600px | 400px | 3:2 | 80KB | JPEG/WebP |
| Category Page | 1200px | 800px | 3:2 | 250KB | JPEG/WebP |
| Carousel | 1500px | 500px | 3:1 | 350KB | JPEG/WebP |
| Thumbnail | 400px | 267px | 3:2 | 50KB | JPEG/WebP |

---

## ✅ Checklist trước khi upload

- [ ] Kích thước đúng theo guidelines
- [ ] File size < mức tối đa
- [ ] Đã optimize/compress
- [ ] Tên file có keyword SEO
- [ ] Alt text mô tả rõ ràng
- [ ] Subject chính ở giữa ảnh
- [ ] Format: JPEG hoặc WebP
- [ ] Quality: 80-85%

---

## 🚨 Lưu ý quan trọng

### **Về việc cắt xén (Cropping):**

Với `object-fit: cover`, ảnh SẼ BỊ CẮT nếu aspect ratio không khớp:

**Ví dụ:**
```
Ảnh gốc: 1000x1000 (1:1 - vuông)
Container: 600x400 (3:2 - ngang)
→ Bị cắt mất ~25% phần trên + dưới
```

**Giải pháp:**
1. Crop ảnh trước khi upload (theo tỷ lệ 3:2)
2. Đặt subject quan trọng ở giữa
3. Test trên nhiều màn hình

---

## 📞 Support

Nếu có thắc mắc về image sizing, vui lòng tham khảo:
- `/client/src/App.css` - CSS definitions
- `/client/src/components/ArticleCard.js` - Component implementation



