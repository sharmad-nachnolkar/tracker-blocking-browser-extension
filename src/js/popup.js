import { getFromStorage, saveToStorage } from "./utils/storageUtils";
import { STORAGE_NAMES } from "./constants";
import { getCurrentTab, reloadTab } from "./utils/tabUtils";
import { getDomainName } from "./utils/genericUtils";
import getTrackerInstance from "./models/trackers";

// TODO: handle addition and removal change. Right now its only adding
const handlePreventTrackingChange = async (event) => {
  let currentWhiteListedDomains = await getFromStorage(
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
  );
  if (!currentWhiteListedDomains) {
    currentWhiteListedDomains = [];
  }
  const currentTab = await getCurrentTab();
  const currentTabDomain = getDomainName(currentTab.url);
  if (event.target.value === "true") {
    currentWhiteListedDomains.push(currentTabDomain);
  } else {
    const whiteListIndex = currentWhiteListedDomains.indexOf(currentTabDomain);
    currentWhiteListedDomains.splice(whiteListIndex, 1);
  }
  await saveToStorage({
    [STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS]: currentWhiteListedDomains,
  });
  window.close();
  reloadTab(currentTab.id, true);
};

const formWhiteListedDomainHtml = (whitelistedDomains) =>
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

// getFromStorage(STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS);
const handleOnLoad = async () => {
  const currentWhiteListedDomains = await getFromStorage(
    STORAGE_NAMES.WHITELISTED_DOCUMENT_DOMAINS
  );
  const currentTab = await getCurrentTab();
  const currentTabDomain = getDomainName(currentTab.url);
  const preventTrackingValue = !!(
    currentWhiteListedDomains &&
    currentWhiteListedDomains.includes(currentTabDomain)
  );

  const radios = document.querySelectorAll(
    'input[type=radio][name="preventTracking"]'
  );
  radios.forEach((radio) => {
    radio.addEventListener("change", handlePreventTrackingChange);
    if (radio.id === `preventTracking_${String(preventTrackingValue)}`) {
      radio.checked = true;
    }
  });

  let whiteListedDomainsHtml = null;
  if (currentWhiteListedDomains) {
    whiteListedDomainsHtml = formWhiteListedDomainHtml(
      currentWhiteListedDomains
    );
    const whitelistedDomainsDiv = document.querySelector(
      'div[id="whitelistedDomains"]'
    );
    whitelistedDomainsDiv.innerHTML =
      whiteListedDomainsHtml === "" ? "NONE" : whiteListedDomainsHtml;
  }

  const trackerInstance = getTrackerInstance();
  const blockedTrackers = await trackerInstance.getBlockedTrackers(
    currentTab.id
  );
  const blockedTrackersHtml = formBlockedTrackersHtml(blockedTrackers);
  const blockedTrackersDiv = document.querySelector(
    'div[id="blockedTrackers"]'
  );
  blockedTrackersDiv.innerHTML =
    blockedTrackersHtml === "" ? "NONE" : blockedTrackersHtml;
};

handleOnLoad();
