/**
 * Image compression and WebP conversion utility
 */
export function compressAndConvertToWebP(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.50
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 6. Security: Limit upload size in client before processing
    const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // Increase to 10MB to be friendly with large raw phone camera images
    if (file.size > MAX_UPLOAD_SIZE) {
      reject(new Error(`File size is too large. Maximum raw size allowed is 10MB.`));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate responsive dimensions keeping aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to capture 2D context of drawing board.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const prevKB = (file.size / 1024).toFixed(1);
              const nextKB = (blob.size / 1024).toFixed(1);
              const pct = (((file.size - blob.size) / file.size) * 100).toFixed(0);
              console.log(`Image Optimized: ${prevKB}KB -> ${nextKB}KB (Reduced by ${pct}%). Dimensions: ${width}x${height}`);
              resolve(blob);
            } else {
              reject(new Error('Failed to encode canvas as WebP. Your browser might not support direct WebP conversion.'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to parse uploaded image. Invalid image file format.'));
    };
    reader.onerror = () => reject(new Error('Failed to read selected image source file.'));
  });
}
