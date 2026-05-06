import { useState, useEffect } from 'react';
import { getEncrypted, saveEncrypted } from '../encryptionUtils';

export const useAsyncStorage = (key, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getEncrypted(key, initialValue).then(val => {
      setData(val);
      setIsLoaded(true);
    });
  }, [key]);

  const setValue = (value) => {
    setData(value);
    saveEncrypted(key, value);
  };

  return [data, setValue, isLoaded];
};