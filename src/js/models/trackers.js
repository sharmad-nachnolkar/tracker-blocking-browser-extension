import { getDomainName } from "../utils/genericUtils";
import { getFromStorage, saveToStorage } from "../utils/storageUtils";
import { TRACKER_LIST_FETCH_URL, STORAGE_NAMES } from "../constants";
import { getCurrentTab } from "../utils/tabUtils";
import { matchTrackersWithUrl } from "../utils/trackerUtils";

class Tracker {
  constructor() {
    this._trackerList = {};
    this.updateTrackerList();
  }

  getTrackerList() {
    return this._trackerList;
  }

  async getBlockedTrackers(tabId) {
    const blockedTrackers = await getFromStorage(
      STORAGE_NAMES.BLOCKED_TRACKERS
    );
    if (tabId) {
      return blockedTrackers[tabId];
    }
    return blockedTrackers;
  }

  async updateTrackerList() {
    const response = await fetch(TRACKER_LIST_FETCH_URL);
    this._trackerList = await response.json();
  }

  async checkTrackerBlocking(requestDetails) {
    const whiteListedDomains = await getFromStorage(
      STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
    );
    const isCancel = matchTrackersWithUrl(
      requestDetails,
      this._trackerList,
      whiteListedDomains
    );
    if (isCancel) {
      this.updateBlockedTrackers(requestDetails);
    }
    return isCancel;
  }

  async updateBlockedTrackers(requestDetails) {
    const currentTab = await getCurrentTab();
    const requestDomainName = getDomainName(requestDetails.url);
    let currentBlockedTrackers = await getFromStorage(
      STORAGE_NAMES.BLOCKED_TRACKERS
    );
    if (!currentBlockedTrackers) {
      currentBlockedTrackers = {};
    }
    if (!currentBlockedTrackers[currentTab.id]) {
      currentBlockedTrackers[currentTab.id] = {};
    }
    if (!currentBlockedTrackers[currentTab.id][requestDomainName]) {
      currentBlockedTrackers[currentTab.id][requestDomainName] = [];
    }
    currentBlockedTrackers[currentTab.id][requestDomainName].push({
      url: requestDetails.url,
      documentUrl: getDomainName(requestDetails.documentUrl),
    });
    saveToStorage({
      [STORAGE_NAMES.BLOCKED_TRACKERS]: currentBlockedTrackers,
    });
  }

  async clearTabLogs(tabId) {
    const currentBlockedTrackers = await getFromStorage(
      STORAGE_NAMES.BLOCKED_TRACKERS
    );
    if (currentBlockedTrackers?.[tabId]) {
      delete currentBlockedTrackers[tabId];
      saveToStorage({
        [STORAGE_NAMES.BLOCKED_TRACKERS]: currentBlockedTrackers,
      });
    }
  }
}

let instance;
const getTrackerInstance = () => {
  if (instance !== undefined) {
    return instance;
  }
  instance = new Tracker();
  return instance;
};
export default getTrackerInstance;
