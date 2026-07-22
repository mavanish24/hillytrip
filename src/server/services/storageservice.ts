import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Reusable/cached administrative Supabase client instance
let supabaseAdminInstance: any = null;

/**
 * Initializes and retrieves the cached administrative Supabase Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS policies and manage system buckets.
 */
export function getSupabaseAdminClient() {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY || '';
  
  if (!supabaseServiceKey) {
    console.warn('[StorageService Warning] SUPABASE_SERVICE_ROLE_KEY is not configured in environment variables.');
  }
  
  if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-project-id')) {
    try {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return supabaseAdminInstance;
    } catch (e) {
      console.error('[StorageService] Failed to initialize admin client:', e);
    }
  }
  return null;
}

/**
 * Standardizes and maps legacy or requested bucket IDs to single dedicated production-grade buckets.
 */
export function mapBucketToBucketName(bucketId: string): string {
  const id = (bucketId || '').toLowerCase().trim();
  if (id === 'branding' || id === 'logos') return 'logos';
  if (id === 'hero') return 'hero';
  if (id === 'destination-images' || id === 'destinations') return 'destinations';
  if (id === 'attraction-images' || id === 'attractions') return 'attractions';
  if (id === 'homestay-images' || id === 'homestays') return 'homestays';
  if (id === 'review-photos') return 'review-photos';
  if (id === 'blogs') return 'blogs';
  if (id === 'avatars' || id === 'user-avatars' || id === 'driver-photos') return 'avatars';
  if (id === 'taxi-documents' || id === 'documents') return 'taxi-documents';
  if (id === 'chat-attachments') return 'chat-attachments';
  if (id === 'exports') return 'exports';
  return 'gallery'; // default fallback public bucket
}

/**
 * Determines whether a bucket is configured for private access.
 */
export function isPrivateBucket(bucketId: string): boolean {
  const clean = mapBucketToBucketName(bucketId);
  const privateBuckets = ['taxi-documents', 'documents', 'chat-attachments', 'exports'];
  return privateBuckets.includes(clean);
}

/**
 * Parses storage relative path from a public or signed Supabase Storage URL.
 */
export function getStoragePathFromUrl(url: string, bucketId: string): string | null {
  if (!url) return null;
  const markers = ['/storage/v1/object/public/', '/storage/v1/object/sign/'];
  for (const marker of markers) {
    if (url.includes(marker)) {
      const afterMarker = url.split(marker)[1];
      if (afterMarker) {
        const parts = afterMarker.split('/');
        parts.shift(); // remove bucket ID from path
        return parts.join('/').split('?')[0];
      }
    }
  }
  const bucketsToCheck = [bucketId, 'hillytrip', 'logos', 'hero', 'destinations', 'attractions', 'homestays', 'gallery', 'avatars', 'review-photos', 'blogs', 'taxi-documents', 'documents', 'chat-attachments', 'exports'];
  for (const b of bucketsToCheck) {
    if (!b) continue;
    const publicMarker = `/storage/v1/object/public/${b}/`;
    const signMarker = `/storage/v1/object/sign/${b}/`;
    
    let parts = url.split(publicMarker);
    if (parts.length > 1) return parts[1].split('?')[0];
    
    parts = url.split(signMarker);
    if (parts.length > 1) return parts[1].split('?')[0];
  }
  return null;
}

/**
 * Auto-provisions a storage bucket if it does not already exist.
 */
export async function createBucketIfMissing(bucketId: string, isPublic = true): Promise<void> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  const cleanName = bucketId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  const isPrivate = !isPublic;
  
  const { data: currentBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    throw new Error(`Failed to list existing buckets: ${listError.message}`);
  }
  
  const exists = currentBuckets?.some((b: any) => b.id.toLowerCase() === cleanName);
  if (!exists) {
    const fileSizeLimit = isPrivate ? 52428800 : 26214400; // 50MB private, 25MB public
    const allowedMimeTypes = isPrivate ? undefined : [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
      'video/mp4', 'video/webm'
    ];
    
    const { error: createError } = await supabaseAdmin.storage.createBucket(cleanName, {
      public: isPublic,
      fileSizeLimit,
      allowedMimeTypes
    });
    
    if (createError) {
      throw new Error(`Failed to create bucket "${cleanName}": ${createError.message}`);
    }
  }
}

/**
 * Enterprise image processing pipeline (auto-rotates, compresses, and generates WebP format).
 */
export async function processImage(
  buffer: Buffer,
  options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'png' | 'jpeg' } = {}
): Promise<Buffer> {
  let sharpModule;
  try {
    sharpModule = (await import('sharp')).default;
  } catch (e) {
    console.warn('[StorageService] sharp is not available. Skipping image optimization.');
    return buffer;
  }
  
  try {
    let pipeline = sharpModule(buffer).rotate();
    
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width,
        height: options.height,
        withoutEnlargement: true
      });
    }
    
    const format = options.format || 'webp';
    const quality = options.quality || 80;
    
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality });
    } else {
      pipeline = pipeline.jpeg({ quality });
    }
    
    return await pipeline.toBuffer();
  } catch (err: any) {
    throw new Error(`Sharp processing failed: ${err.message}`);
  }
}

/**
 * Direct file uploader supporting auto-provisioning recovery.
 */
export async function uploadDirect(bucketId: string, path: string, buffer: Buffer, mimeType: string): Promise<string> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  const cleanBucket = mapBucketToBucketName(bucketId);
  const isPrivate = isPrivateBucket(cleanBucket);
  
  const { data, error } = await supabaseAdmin.storage.from(cleanBucket).upload(path, buffer, {
    contentType: mimeType,
    upsert: true
  });
  
  if (error) {
    const errMsg = error.message?.toLowerCase() || '';
    if (errMsg.includes('not found') || errMsg.includes('does not exist') || errMsg.includes('not_found') || errMsg.includes('resource_not_found') || errMsg.includes('no bucket')) {
      await createBucketIfMissing(cleanBucket, !isPrivate);
      const retry = await supabaseAdmin.storage.from(cleanBucket).upload(path, buffer, {
        contentType: mimeType,
        upsert: true
      });
      if (retry.error) {
        throw new Error(`Upload failed: ${retry.error.message}`);
      }
      return getPublicUrl(cleanBucket, path);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  return getPublicUrl(cleanBucket, path);
}

/**
 * Generates custom SVG video placeholders/metadata posters.
 */
export async function processVideo(
  buffer: Buffer,
  filename: string,
  resolvedBucketId: string,
  resolvedFolderPath: string,
  uuid: string
): Promise<{ posterUrl: string; thumbnailUrl: string; width: number; height: number }> {
  let width = 1280;
  let height = 720;
  let posterUrl = '';
  let thumbnailUrl = '';
  
  let sharpModule;
  try {
    sharpModule = (await import('sharp')).default;
  } catch (e) {
    console.warn('[StorageService] sharp module not available for video poster generation.');
  }
  
  if (sharpModule) {
    try {
      const posterSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e1e38;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0b0f19;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
          <circle cx="${width/2}" cy="${height/2}" r="55" fill="#10b981" />
          <polygon points="${width/2 - 12},${height/2 - 20} ${width/2 + 25},${height/2} ${width/2 - 12},${height/2 + 20}" fill="#ffffff" />
          <text x="${width/2}" y="${height/2 + 100}" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="1">HILLYTRIP MEDIA STREAM</text>
          <text x="${width/2}" y="${height/2 + 130}" font-family="'JetBrains Mono', monospace" font-size="14" fill="#64748b" text-anchor="middle">${filename.toUpperCase()}</text>
        </svg>
      `;
      const posterBuffer = await sharpModule(Buffer.from(posterSvg)).png().toBuffer();
      const posterPath = resolvedFolderPath ? `${resolvedFolderPath}/_processed/posters/${uuid}_poster.png` : `_processed/posters/${uuid}_poster.png`;
      const posterThumbPath = resolvedFolderPath ? `${resolvedFolderPath}/_processed/thumbnails/${uuid}_poster_thumb.png` : `_processed/thumbnails/${uuid}_poster_thumb.png`;
      
      await uploadDirect(resolvedBucketId, posterPath, posterBuffer, 'image/png');
      
      const posterThumbBuffer = await sharpModule(posterBuffer).resize(300).toBuffer();
      await uploadDirect(resolvedBucketId, posterThumbPath, posterThumbBuffer, 'image/png');
      
      posterUrl = getPublicUrl(resolvedBucketId, posterPath);
      thumbnailUrl = getPublicUrl(resolvedBucketId, posterThumbPath);
    } catch (posterErr: any) {
      console.error('[StorageService] Sharp Video Poster Generation Error:', posterErr.message);
    }
  }
  
  return { posterUrl, thumbnailUrl, width, height };
}

export interface UploadResult {
  url: string;
  storagePath: string;
  fileSize: number;
  format: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  thumbnailUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  heroUrl?: string;
  posterUrl?: string;
}

/**
 * Unified enterprise gateway for uploading images, videos, and general binary documents.
 */
export async function upload(
  bucketId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string,
  folderPath = '',
  customFilename?: string
): Promise<UploadResult> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const resolvedFolderPath = folderPath ? folderPath.replace(/^\/|\/$/g, '') : '';
  
  const isVideo = mimeType.startsWith('video/');
  const isImage = mimeType.startsWith('image/');
  
  // Size limit validations
  const fileSize = buffer.length;
  const isPrivate = isPrivateBucket(resolvedBucketId);
  const sizeLimit = isVideo ? 100 * 1024 * 1024 : (isPrivate ? 52428800 : 26214400); // 100MB video, 50MB private, 25MB public
  
  if (fileSize > sizeLimit) {
    throw new Error(`File too large: File size of ${(fileSize / (1024 * 1024)).toFixed(1)}MB exceeds the maximum authorized limit of ${(sizeLimit / (1024 * 1024)).toFixed(1)}MB.`);
  }
  
  // Executable file blocking
  const blockedExtensions = ['.exe', '.bat', '.sh', '.bin', '.cmd', '.msi'];
  if (blockedExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
    throw new Error(`Unsupported format: Executables are blocked for security.`);
  }
  
  const uuid = crypto.randomUUID();
  const fileExt = filename.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'webp');
  
  // Sanitize original filename
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const baseFilename = customFilename ? customFilename.replace(/[^a-zA-Z0-9._-]/g, '_') : `${uuid}.${fileExt}`;
  const fileBase = customFilename ? baseFilename.replace(/\.[^/.]+$/, "") : uuid;
  const originalPath = resolvedFolderPath ? `${resolvedFolderPath}/${baseFilename}` : baseFilename;
  
  console.log(`[StorageService] Starting Upload operation. Bucket: "${resolvedBucketId}", Path: "${originalPath}"`);
  
  try {
    if (isVideo) {
      // 1. Upload original video
      const url = await uploadDirect(resolvedBucketId, originalPath, buffer, mimeType);
      
      // 2. Process video poster & metadata
      const { posterUrl, thumbnailUrl, width, height } = await processVideo(buffer, cleanFilename, resolvedBucketId, resolvedFolderPath, uuid);
      
      const duration = Date.now() - startTime;
      console.log(`[StorageService] Upload Success. Bucket: "${resolvedBucketId}", File: "${originalPath}", Duration: ${duration}ms`);
      
      return {
        url,
        thumbnailUrl,
        posterUrl,
        width,
        height,
        aspectRatio: 1.78,
        fileSize,
        format: fileExt,
        storagePath: originalPath
      };
    } else if (isImage) {
      let width = 1920;
      let height = 1080;
      let sharpModule;
      try {
        sharpModule = (await import('sharp')).default;
      } catch (e) {
        console.warn('[StorageService] sharp is missing. Skipping responsive generation.');
      }
      
      if (sharpModule) {
        try {
          const metadata = await sharpModule(buffer).metadata();
          width = metadata.width || 1920;
          height = metadata.height || 1080;
        } catch (metaErr) {
          console.warn('[StorageService] Metadata extraction failed:', metaErr);
        }
      }
      
      const aspectRatio = height > 0 ? (Math.round((width / height) * 100) / 100) : 1;
      
      // Process & compress original image if sharp is available
      let processedBuffer = buffer;
      if (sharpModule && mimeType !== 'image/gif') {
        try {
          processedBuffer = await processImage(buffer, { format: 'webp', quality: 85 });
        } catch (procErr: any) {
          console.error('[StorageService] Original image compression failed, uploading original:', procErr.message);
        }
      }
      
      const uploadMime = (sharpModule && mimeType !== 'image/gif') ? 'image/webp' : mimeType;
      const uploadExt = (sharpModule && mimeType !== 'image/gif') ? 'webp' : fileExt;
      const uploadPath = originalPath.endsWith(uploadExt) ? originalPath : `${originalPath.substring(0, originalPath.lastIndexOf('.'))}.${uploadExt}`;
      
      // 2. Upload main image
      const originalUrl = await uploadDirect(resolvedBucketId, uploadPath, processedBuffer, uploadMime);
      
      // 3. Generate responsive versions
      const sizes = [
        { name: 'thumbnail', width: 150, path: resolvedFolderPath ? `${resolvedFolderPath}/_processed/thumbnails/${fileBase}_thumb.webp` : `_processed/thumbnails/${fileBase}_thumb.webp` },
        { name: 'small', width: 300, path: resolvedFolderPath ? `${resolvedFolderPath}/_processed/small/${fileBase}_small.webp` : `_processed/small/${fileBase}_small.webp` },
        { name: 'medium', width: 600, path: resolvedFolderPath ? `${resolvedFolderPath}/_processed/medium/${fileBase}_medium.webp` : `_processed/medium/${fileBase}_medium.webp` },
        { name: 'large', width: 1200, path: resolvedFolderPath ? `${resolvedFolderPath}/_processed/large/${fileBase}_large.webp` : `_processed/large/${fileBase}_large.webp` },
        { name: 'hero', width: 1920, path: resolvedFolderPath ? `${resolvedFolderPath}/_processed/hero/${fileBase}_hero.webp` : `_processed/hero/${fileBase}_hero.webp` }
      ];
      
      const urls: Record<string, string> = {};
      
      if (sharpModule && mimeType !== 'image/gif') {
        for (const size of sizes) {
          try {
            const resizedBuffer = await processImage(buffer, { width: size.width, format: 'webp', quality: 80 });
            await uploadDirect(resolvedBucketId, size.path, resizedBuffer, 'image/webp');
            urls[`${size.name}Url`] = getPublicUrl(resolvedBucketId, size.path);
          } catch (sizeErr: any) {
            console.error(`[StorageService] Responsive resize error for ${size.name}:`, sizeErr.message);
            urls[`${size.name}Url`] = originalUrl;
          }
        }
      } else {
        sizes.forEach(size => {
          urls[`${size.name}Url`] = originalUrl;
        });
      }
      
      const duration = Date.now() - startTime;
      console.log(`[StorageService] Upload Success. Bucket: "${resolvedBucketId}", File: "${uploadPath}", Duration: ${duration}ms`);
      
      return {
        url: originalUrl,
        thumbnailUrl: urls.thumbnailUrl,
        smallUrl: urls.smallUrl,
        mediumUrl: urls.mediumUrl,
        largeUrl: urls.largeUrl,
        heroUrl: urls.heroUrl,
        width,
        height,
        aspectRatio,
        fileSize,
        format: uploadExt,
        storagePath: uploadPath
      };
    } else {
      // General non-image/video binary files (documents, chat-attachments, exports etc.)
      const originalUrl = await uploadDirect(resolvedBucketId, originalPath, buffer, mimeType);
      
      const duration = Date.now() - startTime;
      console.log(`[StorageService] Upload Success. Bucket: "${resolvedBucketId}", File: "${originalPath}", Duration: ${duration}ms`);
      
      return {
        url: originalUrl,
        storagePath: originalPath,
        fileSize,
        format: fileExt
      };
    }
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[StorageService] Upload Failed. Bucket: "${resolvedBucketId}", File: "${originalPath}", Duration: ${duration}ms, Error: ${err.message}`);
    throw err;
  }
}

/**
 * Deletes files from a storage bucket.
 */
export async function deleteFiles(bucketId: string, paths: string[]): Promise<any> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  console.log(`[StorageService] Starting Delete operation. Bucket: "${resolvedBucketId}", Paths: ${JSON.stringify(paths)}`);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucketId).remove(paths);
  
  const duration = Date.now() - startTime;
  if (error) {
    console.error(`[StorageService] Delete Failed. Bucket: "${resolvedBucketId}", Duration: ${duration}ms, Error: ${error.message}`);
    throw new Error(`Delete failed: ${error.message}`);
  }
  
  console.log(`[StorageService] Delete Success. Bucket: "${resolvedBucketId}", Duration: ${duration}ms`);
  return data;
}

/**
 * Moves/renames a file inside a storage bucket.
 */
export async function move(bucketId: string, fromPath: string, toPath: string): Promise<any> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  console.log(`[StorageService] Starting Move operation. Bucket: "${resolvedBucketId}", From: "${fromPath}", To: "${toPath}"`);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucketId).move(fromPath, toPath);
  
  const duration = Date.now() - startTime;
  if (error) {
    console.error(`[StorageService] Move Failed. Bucket: "${resolvedBucketId}", Duration: ${duration}ms, Error: ${error.message}`);
    throw new Error(`Move failed: ${error.message}`);
  }
  
  console.log(`[StorageService] Move Success. Bucket: "${resolvedBucketId}", Duration: ${duration}ms`);
  return data;
}

/**
 * Renames a file inside a storage bucket (alias of move).
 */
export async function rename(bucketId: string, fromPath: string, toPath: string): Promise<any> {
  return move(bucketId, fromPath, toPath);
}

/**
 * Copies a file inside or between storage buckets.
 */
export async function copy(bucketId: string, fromPath: string, toPath: string, destinationBucket?: string): Promise<any> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const destBucket = destinationBucket ? mapBucketToBucketName(destinationBucket) : resolvedBucketId;
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  console.log(`[StorageService] Starting Copy operation. From Bucket: "${resolvedBucketId}", From Path: "${fromPath}", To Bucket: "${destBucket}", To Path: "${toPath}"`);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucketId).copy(fromPath, toPath, {
    destinationBucket: destBucket
  } as any);
  
  const duration = Date.now() - startTime;
  if (error) {
    console.error(`[StorageService] Copy Failed. Duration: ${duration}ms, Error: ${error.message}`);
    throw new Error(`Copy failed: ${error.message}`);
  }
  
  console.log(`[StorageService] Copy Success. Duration: ${duration}ms`);
  return data;
}

/**
 * Lists contents under a specific path in a storage bucket.
 */
export async function list(bucketId: string, path = '', options: any = {}): Promise<any[]> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  console.log(`[StorageService] Starting List operation. Bucket: "${resolvedBucketId}", Path: "${path}"`);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucketId).list(path, {
    limit: options.limit || 100,
    offset: options.offset || 0,
    sortBy: options.sortBy || { column: 'name', order: 'asc' }
  });
  
  const duration = Date.now() - startTime;
  if (error) {
    console.error(`[StorageService] List Failed. Bucket: "${resolvedBucketId}", Duration: ${duration}ms, Error: ${error.message}`);
    throw new Error(`List failed: ${error.message}`);
  }
  
  console.log(`[StorageService] List Success. Bucket: "${resolvedBucketId}", Count: ${data?.length || 0}, Duration: ${duration}ms`);
  return data || [];
}

/**
 * Checks if a file exists under a path in a storage bucket.
 */
export async function exists(bucketId: string, path: string): Promise<boolean> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return false;
  
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  const filename = path.substring(path.lastIndexOf('/') + 1);
  
  try {
    const files = await list(resolvedBucketId, dirPath);
    const found = files.some(f => f.name === filename);
    const duration = Date.now() - startTime;
    console.log(`[StorageService] Exists Check. Bucket: "${resolvedBucketId}", Path: "${path}", Result: ${found}, Duration: ${duration}ms`);
    return found;
  } catch {
    return false;
  }
}

/**
 * Computes public URL for a file inside a public storage bucket.
 */
export function getPublicUrl(bucketId: string, path: string): string {
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    return `${supabaseUrl}/storage/v1/object/public/${resolvedBucketId}/${path}`;
  }
  return supabaseAdmin.storage.from(resolvedBucketId).getPublicUrl(path).data.publicUrl;
}

/**
 * Generates a temporary secure signed URL for private bucket objects.
 */
export async function generateSignedUrl(bucketId: string, path: string, durationInSeconds = 3600): Promise<string> {
  const startTime = Date.now();
  const resolvedBucketId = mapBucketToBucketName(bucketId);
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) throw new Error('Storage unavailable: Supabase client is not configured');
  
  console.log(`[StorageService] Starting Signed URL generation. Bucket: "${resolvedBucketId}", Path: "${path}", Duration: ${durationInSeconds}s`);
  const { data, error } = await supabaseAdmin.storage.from(resolvedBucketId).createSignedUrl(path, durationInSeconds);
  
  const duration = Date.now() - startTime;
  if (error) {
    console.error(`[StorageService] Signed URL Generation Failed. Bucket: "${resolvedBucketId}", Duration: ${duration}ms, Error: ${error.message}`);
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }
  
  console.log(`[StorageService] Signed URL Generation Success. Bucket: "${resolvedBucketId}", Duration: ${duration}ms`);
  return data.signedUrl;
}

/**
 * Auto-initializes the core public & private HillyTrip buckets with strict fileSize limits.
 */
export async function initSupabaseBuckets(): Promise<void> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    console.log('[StorageService] Supabase client offline. Skipping bucket auto-provisioning.');
    return;
  }
  console.log('[StorageService] Auto-initializing HillyTrip public/private storage vaults...');
  try {
    const publicBuckets = ['logos', 'hero', 'destinations', 'attractions', 'homestays', 'gallery', 'avatars', 'review-photos', 'blogs'];
    const privateBuckets = ['taxi-documents', 'documents', 'chat-attachments', 'exports'];
    
    for (const bucket of publicBuckets) {
      try {
        await createBucketIfMissing(bucket, true);
      } catch (err: any) {
        console.warn(`[StorageService] Auto-provisioning public bucket "${bucket}" skipped or deferred:`, err.message);
      }
    }
    for (const bucket of privateBuckets) {
      try {
        await createBucketIfMissing(bucket, false);
      } catch (err: any) {
        console.warn(`[StorageService] Auto-provisioning private bucket "${bucket}" skipped or deferred:`, err.message);
      }
    }
  } catch (err: any) {
    console.warn('[StorageService] Bucket auto-initialization deferred:', err.message);
  }
}
