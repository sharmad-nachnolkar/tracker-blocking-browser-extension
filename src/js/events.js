import "regenerator-runtime/runtime";
import { REQUEST_TYPES, STORAGE_NAMES } from "./constants";
import getTrackerInstance from "./models/trackers";
import { getFromStorage, saveToStorage } from "./utils/storageUtils";

const trackerInstance = getTrackerInstance();
const browser = require("webextension-polyfill");

// event handlers
async function handleOnBeforeRequest(requestDetails) {
  const isCancel = await trackerInstance.checkTrackerBlocking(requestDetails);
  return {
    cancel: isCancel,
  };
}

function handleTabClosed(tabId) {
  trackerInstance.clearTabLogs(tabId);
}

async function handleOnInstall() {
  // Setting up initial values of variables
  trackerInstance.updateTrackerList();
  const currentWhitelistedDomains = await getFromStorage([
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS,
  ]);
  if (!currentWhitelistedDomains) {
    saveToStorage({
      [STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS]: [],
    });
  }
  // Update current version to storage
  saveToStorage({
    [STORAGE_NAMES.VERSION]: browser.runtime.getManifest().version,
  });
}

// events
browser.runtime.onInstalled.addListener(handleOnInstall);

browser.webRequest.onBeforeRequest.addListener(
  handleOnBeforeRequest,
  {
    urls: ["<all_urls>"],
    // TODO: Need to add Beacon request types dynamically based on browser
    types: REQUEST_TYPES,
  },
  ["blocking"]
);

browser.tabs.onRemoved.addListener(handleTabClosed);
