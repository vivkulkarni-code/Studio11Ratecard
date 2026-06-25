import { Platform, PermissionsAndroid } from 'react-native';
import { Paths, Directory, File as FSFile } from 'expo-file-system';

const ANDROID_EXTERNAL_DOCUMENTS = 'file:///storage/emulated/0/Documents/';

export function getStudio11Dir(...segments: string[]): Directory {
  if (Platform.OS === 'android') {
    return new Directory(ANDROID_EXTERNAL_DOCUMENTS + 'Studio11/' + segments.join('/'));
  }
  return new Directory(Paths.document, 'Studio11', ...segments);
}

export function getStudio11File(dir: Directory, filename: string): FSFile {
  return new FSFile(dir, filename);
}

export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

export async function ensureStudio11Dir(...segments: string[]): Promise<Directory> {
  const dir = getStudio11Dir(...segments);
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}
