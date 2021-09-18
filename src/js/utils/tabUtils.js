import "regenerator-runtime/runtime";

const browser = require("webextension-polyfill");

export const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [currentTab] = await browser.tabs.query(queryOptions);
  return currentTab;
};

// If tabId is passed relaods that tab else reloads current active tab
export const reloadTab = async (tabId, bypassCache = false) => {
  let reloadTabId = tabId;
  if (!reloadTabId) {
    const reloadTabObj = await getCurrentTab();
    reloadTabId = reloadTabObj.id;
  }
  return browser.tabs.reload(reloadTabId, { bypassCache });
};
