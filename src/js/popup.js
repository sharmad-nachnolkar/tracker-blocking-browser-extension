import { getFromStorage, saveToStorage } from "./utils/storageUtils";
import { STORAGE_NAMES } from "./constants";
import { getCurrentTab, reloadTab } from "./utils/tabUtils";
import { getDomainName } from "./utils/genericUtils";
import getTrackerInstance from "./models/trackers";

const handlePreventTrackingChange = async (event) => {
  let currentWhitelistedDomains = await getFromStorage(
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
  );
  if (!currentWhitelistedDomains) {
    currentWhitelistedDomains = [];
  }
  const currentTab = await getCurrentTab();
  const currentTabDomain = getDomainName(currentTab.url);
  // Case if user has de-activated tracking on the current site
  // This is string "true" as it is coming from HTML element value
  if (event.target.value === "true") {
    currentWhitelistedDomains.push(currentTabDomain);
  } else {
    // Case if user has activated tracking on the current site
    const whiteListIndex = currentWhitelistedDomains.indexOf(currentTabDomain);
    currentWhitelistedDomains.splice(whiteListIndex, 1);
  }
  await saveToStorage({
    [STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS]: currentWhitelistedDomains,
  });
  // Reload tab to reflect user preferences
  await reloadTab(currentTab.id, true);
  window.close();
};

const formWhitelistedDomainHtml = (whitelistedDomains) =>
  whitelistedDomains.map((domain) => `<span>${domain}</span><br>`).join("");

const formBlockedTrackersHtml = (blockedTrackers) => {
  const blockedTrackerHtmlList = [];
  for (const trackerDomain in blockedTrackers) {
    if (Object.prototype.hasOwnProperty.call(blockedTrackers, trackerDomain)) {
      blockedTrackerHtmlList.push(`<span>${trackerDomain}</span><br>`);
    }
  }
  return blockedTrackerHtmlList.join("");
};

const initTrackingSelectionOption = (preventTrackingValue) => {
  const radios = document.querySelectorAll(
    'input[type=radio][name="preventTracking"]'
  );
  radios.forEach((radio) => {
    radio.addEventListener("change", handlePreventTrackingChange);
    if (radio.id === `preventTracking_${String(preventTrackingValue)}`) {
      radio.checked = true;
    }
  });
};

const initWhitelistedDomainsList = (currentWhitelistedDomains) => {
  let whitelistedDomainsHtml = null;
  if (currentWhitelistedDomains) {
    whitelistedDomainsHtml = formWhitelistedDomainHtml(
      currentWhitelistedDomains
    );
    const whitelistedDomainsDiv = document.querySelector(
      'div[id="whitelistedDomains"]'
    );
    whitelistedDomainsDiv.innerHTML =
      whitelistedDomainsHtml === "" ? "NONE" : whitelistedDomainsHtml;
  }
};

const initBlockedTrackersList = async (blockedTrackers) => {
  const blockedTrackersHtml = formBlockedTrackersHtml(blockedTrackers);
  const blockedTrackersDiv = document.querySelector(
    'div[id="blockedTrackers"]'
  );
  blockedTrackersDiv.innerHTML =
    blockedTrackersHtml === "" ? "NONE" : blockedTrackersHtml;
};

const handleOnLoad = async () => {
  // Fetch and compute values required to setup DOM element values and listeners
  const currentWhitelistedDomains = await getFromStorage(
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
  );
  const currentTab = await getCurrentTab();
  const currentTabDomain = getDomainName(currentTab.url);
  const preventTrackingValue = !!(
    currentWhitelistedDomains &&
    currentWhitelistedDomains.includes(currentTabDomain)
  );
  const trackerInstance = getTrackerInstance();
  const blockedTrackers = await trackerInstance.getBlockedTrackers(
    currentTab.id
  );

  // Call DOM value setters / HTML formers / listener adders with above computed values
  initTrackingSelectionOption(preventTrackingValue);
  initWhitelistedDomainsList(currentWhitelistedDomains);
  // If user has not prevented tracking on the current site
  // then show user entire history of blocked trackers on that tab
  if (!preventTrackingValue) {
    initBlockedTrackersList(blockedTrackers);
  }
};

handleOnLoad();
