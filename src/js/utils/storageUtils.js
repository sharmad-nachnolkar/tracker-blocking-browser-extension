import "regenerator-runtime/runtime";

const browser = require("webextension-polyfill");

export const saveToStorage = (obj) => browser.storage.local.set(obj);

export const getFromStorage = async (key) => {
  const storageResponse = await browser.storage.local.get(key);
  return storageResponse?.[key];
};
