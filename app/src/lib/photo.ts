import { Platform } from 'react-native';

const MAX_SIDE = 720; // px; enough for a phone screen, keeps files ~50-100 KB
const QUALITY = 0.7;

// Opens the phone's photo picker / camera and returns a compressed JPEG as a
// data URL. Returns null if the user cancels, or throws if the photo can't be read.
export function pickPhoto(): Promise<string | null> {
  if (Platform.OS !== 'web') return Promise.resolve(null); // phone app: later
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      compress(file).then(resolve, reject);
    };
    input.click();
  });
}

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable image'));
    };
    img.src = url;
  });
}
