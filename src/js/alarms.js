import "regenerator-runtime/runtime";
import { STORAGE_NAMES } from "./constants";
import getTrackerInstance from "./models/trackers";
import { saveToStorage } from "./utils/storageUtils";

const trackerInstance = getTrackerInstance();
const browser = require("webextension-polyfill");

// handlers
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

// alarm registrations

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
