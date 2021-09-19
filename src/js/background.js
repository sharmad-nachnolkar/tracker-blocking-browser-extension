// import "core-js/stable";
import "regenerator-runtime/runtime";
// import { getDomainName } from "./utils/genericUtils";
import { REQUEST_TYPES, STORAGE_NAMES } from "./constants";
import getTrackerInstance from "./models/trackers";
import { getFromStorage, saveToStorage } from "./utils/storageUtils";

const browser = require("webextension-polyfill");

const trackerInstance = getTrackerInstance();

// handlers
async function handleOnBeforeRequest(requestDetails) {
  const isCancel = await trackerInstance.checkTrackerBlocking(requestDetails);
  return {
    cancel: isCancel,
  };
}

function handleTabClosed(tabId, removed) {
  console.log("CLOSED - ", tabId, removed);
  trackerInstance.clearTabLogs(tabId);
}

// function handleTabUpdated(tabId, changeInfo, tab) {
//   console.log(changeInfo, tab)
//   trackerInstance.clearTabLogs(tabId);
// }

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
}

async function handleClearClosedTabLogs() {
  const allOpenTabs = await browser.tabs.query({});
  const allOpenTabIds = allOpenTabs?.map((tab) => tab.id);
  const allBlockedTrackers = await trackerInstance.getBlockedTrackers();
  for (const tabId in allBlockedTrackers) {
    if (!allOpenTabIds.includes(parseInt(tabId))) {
      delete allBlockedTrackers[parseInt(tabId)];
    }
  }
  saveToStorage({
    [STORAGE_NAMES.BLOCKED_TRACKERS]: allBlockedTrackers,
  });
}
//

// ALARMS
// Fetch latest tracker list every 24 hours
browser.alarms.create("updateTrackerList", { periodInMinutes: 24 * 60 });
// Clear stray tracker logs of closed tabs which were not cleared due to
// a missed closed event for any reason.
browser.alarms.create("clearClosedTabLogs", { periodInMinutes: 24 * 60 });
browser.alarms.onAlarm.addListener((event) => {
  switch (event.name) {
    case "updateTrackerList":
      trackerInstance.updateTrackerList();
      break;
    case "clearClosedTabLogs":
      handleClearClosedTabLogs();
      break;
  }
});
//

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
// browser.tabs.onUpdated.addListener(handleTabUpdated);
// browser.tabs.onUpdated.addListener(handleTabUpdated, {
//   properties: ["status", "url"],
// });
