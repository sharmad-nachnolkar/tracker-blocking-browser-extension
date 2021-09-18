import { getFromStorage, saveToStorage } from "./utils/storageUtils";
import { STORAGE_NAMES } from "./constants";
import { getCurrentTab, reloadTab } from "./utils/tabUtils";
import { getDomainName } from "./utils/genericUtils";

console.log("POPUP FILE");
// document.addEventListener("DOMContentLoaded", function());

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
  reloadTab(currentTab.id);
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

  // const selectedRadioButton = document.querySelectorAll(
  //   `input[type=radio][name="preventTracking_${String(preventTrackingValue)}"]`
  // )[0];
  // selectedRadioButton.checked = true
};

handleOnLoad();
