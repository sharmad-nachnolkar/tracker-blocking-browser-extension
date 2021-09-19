import { getDomainName, getAllSubdomains } from "../utils/genericUtils";
import { getFromStorage, saveToStorage } from "../utils/storageUtils";
import { TRACKER_LIST_FETCH_URL, STORAGE_NAMES } from "../constants";
import { getCurrentTab } from "../utils/tabUtils";

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
    console.log("LATEST TRACKER FETCHED - ", this._trackerList);
  }

  async checkTrackerBlocking(requestDetails) {
    const documentHostName = getDomainName(requestDetails.documentUrl);
    const documentSubdomainList = getAllSubdomains(
      requestDetails.documentUrl
    ).concat([documentHostName]);
    const requestHostName = getDomainName(requestDetails.url);
    const requestSubdomainList = getAllSubdomains(requestDetails.url).concat([
      requestHostName,
    ]);

    // Early Return: If document host and request host matches i.e. request is not to a third party domain,
    // then allow the request
    if (documentHostName === requestHostName) {
      return false;
    }

    // Check if user has whitelisted the domain. If yes, allow request
    const whiteListedDomains = await getFromStorage(
      STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
    );
    if (
      Array.isArray(whiteListedDomains) &&
      whiteListedDomains.includes(documentHostName)
    ) {
      return false;
    }

    let trackerEntry;
    for (const subdomain of requestSubdomainList) {
      if (this._trackerList[subdomain]) {
        trackerEntry = this._trackerList[subdomain];
        break;
      }
    }

    // CASE: Early return if request domain is not in list of tracker domains then allow request
    if (trackerEntry === undefined) {
      return false;
    }

    // CASES BELOW: Matching tracker entry found

    // CASE: No rules available for tracker i.e. rules are undefined
    // or not an array or a blank array
    if (
      trackerEntry.rules === undefined ||
      !Array.isArray(trackerEntry.rules) ||
      (Array.isArray(trackerEntry.rules) && trackerEntry.rules.length === 0)
    ) {
      const isCancel = trackerEntry.default === "block";
      if (isCancel) {
        this.updateBlockedTrackers(requestDetails);
      }
      return isCancel;
    }

    // CASE: Rule(s) exists
    let isMatchedRule = false;
    for (const ruleObj of trackerEntry.rules) {
      // CASE: Early return to next iteration if rule doesn't match
      if (!requestDetails.url.match(ruleObj.rule)) {
        continue;
      }
      // CASES BELOW: Rule is matched
      isMatchedRule = true;

      // CASE: Rule is matched and there are no further options or exceptions
      // agains the rule so block the request
      if (
        !ruleObj.options?.domains &&
        !ruleObj.options?.types &&
        !ruleObj.exceptions?.domains &&
        !ruleObj.exceptions?.types
      ) {
        this.updateBlockedTrackers(requestDetails);
        return true;
      }
      // Compute match against 'domain' and 'types' attributes of 'options' and 'exceptions'
      // TODO: Need to match sub domains also here iteratively
      const isOptionDomainRuleMatched = documentSubdomainList.some(
        (subdomain) => ruleObj.options?.domains?.includes?.(subdomain)
      );
      const isOptionRequestTypeRuleMatched = ruleObj.options?.types?.includes?.(
        requestDetails.type
      );
      const isExceptionDomainRuleMatched = documentSubdomainList.some(
        (subdomain) => ruleObj.exceptions?.domains?.includes?.(subdomain)
      );
      const isExceptionRequestTypeRuleMatched =
        ruleObj.exceptions?.types?.includes?.(requestDetails.type);

      // NOTE: The 2 nested if statements can be merged but keeping it nested for readability purposes
      // CASE: Where option exists on rule with either 'domain', 'types' or both
      if (
        ruleObj.options?.domains !== undefined ||
        ruleObj.options?.types !== undefined
      ) {
        // CASE: Where options exist but neither of the 'domain' or 'types' condition match
        // if yes, then do not block and continue to next iteration
        if (
          (ruleObj.options?.domains === undefined ||
            isOptionDomainRuleMatched === false) &&
          (ruleObj.options?.types === undefined ||
            isOptionRequestTypeRuleMatched === false)
        ) {
          continue;
        }
      }

      // CASE: Check if either 'domain' or 'type' exception matches.
      // if yes, then do not block and continue to next iteration
      if (
        isExceptionDomainRuleMatched === true ||
        isExceptionRequestTypeRuleMatched === true
      ) {
        continue;
      }

      // CASE: If exceptions don't match, block the request
      this.updateBlockedTrackers(requestDetails);
      return true;
    }

    // If no rules match, check the default option on the tracker entry
    if (isMatchedRule === false) {
      this.updateBlockedTrackers(requestDetails);
      const isCancel = trackerEntry.default === "block";
      if (isCancel) {
        this.updateBlockedTrackers(requestDetails);
      }
      return isCancel;
    }
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
