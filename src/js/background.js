// import "core-js/stable";
import "regenerator-runtime/runtime";
import { getDomainName } from "./utils/genericUtils";
import { REQUEST_TYPES, STORAGE_NAMES } from "./constants";
import getTrackerInstance from "./models/trackers";
import { getFromStorage, saveToStorage } from "./utils/storageUtils";

const browser = require("webextension-polyfill");

const trackerInstance = getTrackerInstance();

// handlers
async function handleOnBeforeRequest(requestDetails) {
  // TODO: Add whitelisting condition of user
  const documentHostName = getDomainName(requestDetails.documentUrl);
  const requestHostName = getDomainName(requestDetails.url);
  // TODO: Confirm this check. Do we want to allow subdomains to hit other subdomains of that TLD?
  if (documentHostName !== requestHostName) {
    // console.log(documentHostName, requestHostName);
    const isCancel = await trackerInstance.checkTrackerBlocking(requestDetails);
    if (isCancel) {
      console.log(requestDetails.documentUrl, requestDetails.url);
    }
    return {
      cancel: isCancel,
    };
  }
}

async function handleOnInstall(details) {
  console.log(details.reason);
  trackerInstance.updateTrackerList();
  const currentWhiteListedDomains = await getFromStorage([
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS,
  ]);
  if (!currentWhiteListedDomains) {
    saveToStorage({
      [STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS]: [],
    });
  }
}
//

// ALARMS
browser.alarms.create("updateTrackerList", { periodInMinutes: 24 * 60 });
browser.alarms.onAlarm.addListener((event) => {
  switch (event.name) {
    case "updateTrackerList":
      trackerInstance.updateTrackerList();
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
