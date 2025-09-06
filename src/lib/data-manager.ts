
"use client";
import { seedInitialData } from './seed-data';

const isServer = typeof window === 'undefined';

/**
 * Mengambil data dari localStorage. Jika tidak ada, inisialisasi dengan data default.
 * @param {string} key Kunci data di localStorage.
 * @param {any} defaultValue Nilai default jika tidak ada data.
 * @returns {any} Data yang telah di-parse.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  try {
    let localData = localStorage.getItem(key);
    if (localData === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      localData = JSON.stringify(defaultValue);
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Gagal mengambil/parse data untuk kunci "${key}" dari localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Menyimpan data ke localStorage dan memicu event untuk pembaruan UI.
 * @param {string} key Kunci data di localStorage.
 * @param {any} data Data yang akan disimpan.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    return;
  }
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(key, dataString);
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, value: data } }));
  } catch (error) {
    console.error(`Gagal menyimpan data ke localStorage untuk kunci "${key}".`, error);
  }
};


const initializeData = () => {
  if (isServer) return;
  if (!localStorage.getItem('app_initialized')) {
    seedInitialData();
    localStorage.setItem('app_initialized', 'true');
    console.log("Data awal telah diinisialisasi ke localStorage.");
  }
};

initializeData();
