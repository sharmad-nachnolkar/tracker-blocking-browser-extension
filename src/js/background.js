// import "core-js/stable";
import "regenerator-runtime/runtime";
import { getDomainName } from "./utils/genericUtils";
import { REQUEST_TYPES } from "./constants";
import getTrackerInstance from "./models/trackers";

const browser = require("webextension-polyfill");

const trackerInstance = getTrackerInstance();
console.log("This is extension tracker blocker - file - background");

// handlers
function handleOnBeforeRequest(requestDetails) {
  // TODO: Add whitelisting condition of user
  const documentHostName = getDomainName(requestDetails.documentUrl);
  const requestHostName = getDomainName(requestDetails.url);
  if (documentHostName !== requestHostName) {
    console.log(documentHostName, requestHostName);
    return {
      cancel: trackerInstance.checkTrackerBlocking(requestDetails),
    };
  }
}

function handleOnInstall(details) {
  console.log(details.reason);
  trackerInstance.updateTrackerList();
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
