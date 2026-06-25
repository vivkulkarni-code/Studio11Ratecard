---
name: expo-file-system v56 API + Android external storage
description: Breaking API change in v56 (class-based), and how to target user-accessible Documents on Android
---

In expo-file-system v56, the API changed to class-based:
```ts
import { Paths, Directory, File as FSFile } from 'expo-file-system';
```

**Android user-accessible storage (critical for kiosk/staff workflows):**
`Paths.document` is app-private storage (`/data/user/0/<pkg>/files`). Staff CANNOT drop files there via a file manager. For user-accessible external storage, use:
```ts
// External public Documents on Android — accessible from any file manager
new Directory('file:///storage/emulated/0/Documents/', 'Studio11', 'SubFolder')
```

**iOS:** use `Paths.document` (app documents, accessible via Files app if configured).

See `src/utils/storage.ts` in studio11-tablet for the cross-platform helper.

**Why:** Code review rejected the initial implementation because app-scoped storage breaks the "staff drops files in a folder" workflow. The `/storage/emulated/0/Documents/` URI works with Directory class and is visible in Android file managers.

**How to apply:**
- Always use `getStudio11Dir()` helper (in storage.ts) instead of `new Directory(Paths.document, ...)` for any folder that staff/users must be able to access via file manager.
- Add `READ_EXTERNAL_STORAGE` + `WRITE_EXTERNAL_STORAGE` to `app.json` android.permissions.
- Call `requestStoragePermission()` before any external storage read/write.
- Never use legacy `FileSystem.documentDirectory`, `FileSystem.makeDirectoryAsync`, etc.
