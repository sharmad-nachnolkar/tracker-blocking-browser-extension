import { getDomainName, getAllSubdomains } from "./genericUtils";

/**
 * @requestDetails {object} object supplied by by browser in callback function of event listeners
 * @trackerList {object} map of trackers to be blocked along with rules
 * @whitelistedDomains {array} list of domains whitelisted by user
 *
 * @return {boolean} - returns boolean based on whether match is found
 */
export const matchTrackers = (
  requestDetails,
  trackerList,
  whitelistedDomains
) => {
  // Firefox has documentUrl property. Chromium based browsers have initiator
  const documentUrl = requestDetails.documentUrl ?? requestDetails.initiator;
  const documentHostName = getDomainName(documentUrl);
  const documentSubdomainList = getAllSubdomains(documentUrl).concat([
    documentHostName,
  ]);
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
  if (
    Array.isArray(whitelistedDomains) &&
    whitelistedDomains.includes(documentHostName)
  ) {
    return false;
  }

  let trackerEntry;
  for (const subdomain of requestSubdomainList) {
    if (trackerList[subdomain]) {
      trackerEntry = trackerList[subdomain];
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
    return trackerEntry.default === "block";
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
      return true;
    }
    // Compute match against 'domain' and 'types' attributes of 'options' and 'exceptions'
    const isOptionDomainRuleMatched = documentSubdomainList.some((subdomain) =>
      ruleObj.options?.domains?.includes?.(subdomain)
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
    return true;
  }

  // If no rules match, check the default option on the tracker entry
  if (isMatchedRule === false) {
    return trackerEntry.default === "block";
  }
  return false;
};
