# HillyTrip Enterprise Storage Architecture

This document details the standardized storage subsystem of the HillyTrip backend application. 

By architectural mandate, **no module should directly call Supabase Storage**. All storage operations must route through the central, unified enterprise storage service: `src/server/services/StorageService.ts`.

---

## 1. Storage Architecture Diagram

```
                              ┌────────────────────────────────────────┐
                              │           Client Application           │
                              │   (Admin Dashboard, Messaging, etc.)   │
                              └───────────────────┬────────────────────┘
                                                  │ (HTTPS / Multipart / Base64)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │         HillyTrip Express Server       │
                              │              (server.ts)               │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │             StorageService             │
                              │   (src/server/services/StorageService) │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │         Supabase Admin Client          │
                              │        (getSupabaseAdminClient)        │
                              └───────────────────┬────────────────────┘
                                                  │ (Service Role Credentials Key)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │            Supabase Storage            │
                              │           (Cloud Buckets)              │
                              └────────────────────────────────────────┘
```

---

## 2. Standardized Upload Flow Diagram

```
[ Incoming Request ] ────► [ API Endpoint ] ────► [ StorageService.uploadDirect ]
                                                             │
                                                    (Checks Bucket Status)
                                                             │
                                                             ├──► [ Bucket Missing ] ──► [ Provision Bucket ]
                                                             │
                                                    (Uploads File Payload)
                                                             │
                                                             ▼
                                                    [ Generates Public URL ] ──► [ Return to API ]
```

---

## 3. Bucket Responsibility Matrix

To guarantee strict organizational boundaries, the platform operates a multi-bucket architecture where each bucket is designated for an isolated, specific resource class.

| Bucket Name | Target Directory Structure | Access Policy | Responsibility |
| :--- | :--- | :--- | :--- |
| **`avatars`** | `{userId}/avatar_{timestamp}.{ext}` | Public Read, Admin Write | Stores user profiles and avatar photos. Replaces all legacy dual-path storage pipelines. |
| **`branding`** | `logos/{filename}` | Public Read, Admin Write | Houses core brand identity elements (e.g., system desktop, mobile, and footer logos). |
| **`hero`** | `hero/{filename}` | Public Read, Admin Write | Stores high-impact media streams and large banners. |
| **`hillytrip`** | `gallery/`, `review-photos/`, `taxi-documents/` | Public Read, Admin Write | Core media storage pool for messages, customer reviews, destinations, attractions, and onboarding documentation. |

---

## 4. `StorageService` API Documentation

The `StorageService` exposes a highly-engineered, production-ready API interface.

### Static Methods Reference

#### `initSupabaseBuckets()`
*   **Description**: Ensures all standard enterprise buckets are provisioned and configured with public accessibility. Called automatically at startup.
*   **Signature**: `static async initSupabaseBuckets(): Promise<void>`

#### `upload(bucketId, folderPath, fileBuffer, fileName, mimeType)`
*   **Description**: Uploads a binary asset to Supabase Storage and returns its generated, accessible, public CDN location.
*   **Signature**: `static async upload(bucketId: string, folderPath: string, fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>`

#### `uploadDirect(bucketId, storagePath, fileBuffer, mimeType)`
*   **Description**: Directly uploads files to a targeted location path, bypassing processing pipelines.
*   **Signature**: `static async uploadDirect(bucketId: string, storagePath: string, fileBuffer: Buffer, mimeType: string): Promise<string>`

#### `deleteFiles(bucketId, paths)`
*   **Description**: Purges one or more files from a specified bucket pool.
*   **Signature**: `static async deleteFiles(bucketId: string, paths: string[]): Promise<void>`

#### `move(bucketId, fromPath, toPath)`
*   **Description**: Moves or renames an existing storage resource from its old location to a target path destination.
*   **Signature**: `static async move(bucketId: string, fromPath: string, toPath: string): Promise<void>`

#### `copy(bucketId, fromPath, toPath)`
*   **Description**: Duplicates a storage object.
*   **Signature**: `static async copy(bucketId: string, fromPath: string, toPath: string): Promise<void>`

#### `list(bucketId, folderPath)`
*   **Description**: Retrieves a clean array of files/folders nested in the designated directory path.
*   **Signature**: `static async list(bucketId: string, folderPath?: string): Promise<any[]>`

#### `exists(bucketId, storagePath)`
*   **Description**: Checks if a resource already exists in the given path of the storage bucket.
*   **Signature**: `static async exists(bucketId: string, storagePath: string): Promise<boolean>`

#### `generateSignedUrl(bucketId, storagePath, expiresIn)`
*   **Description**: Generates a secure, temporary, tokenized download and view link for private or sensitive assets.
*   **Signature**: `static async generateSignedUrl(bucketId: string, storagePath: string, expiresIn?: number): Promise<string>`

#### `getPublicUrl(bucketId, storagePath)`
*   **Description**: Instantly resolves a standard public access location string.
*   **Signature**: `static async getPublicUrl(bucketId: string, storagePath: string): Promise<string>`
