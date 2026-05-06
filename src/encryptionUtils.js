import CryptoJS from 'crypto-js';

const SECRET_KEY = "TrackerApp2026SecureVault!@#$%^&*()_+-=[]{}|;:',.<>?/`~";
const DB_NAME = 'TrackerAppDB';
const STORE_NAME = 'encrypted_store';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveEncrypted = async (key, data) => {
  try {
    const db = await initDB();
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(encrypted, key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    return false;
  }
};

export const getEncrypted = async (key, fallback = null) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        const encrypted = request.result;
        if (!encrypted) return resolve(fallback);
        const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const utf8String = decrypted.toString(CryptoJS.enc.Utf8);
        if (!utf8String || utf8String.trim() === '') return resolve(fallback);
        resolve(JSON.parse(utf8String));
      };
      request.onerror = () => resolve(fallback);
    });
  } catch (error) {
    return fallback;
  }
};

export const removeEncrypted = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    return false;
  }
};

export const encryptString = (str) => {
  return CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
};

export const decryptString = (encryptedStr) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedStr, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};