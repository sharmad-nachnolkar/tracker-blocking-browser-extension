import { getDomainName } from "../utils/genericUtils";
import { TRACKER_LIST_FETCH_URL } from "../constants";

class Tracker {
  constructor() {
    this._trackerList = {};
    this.updateTrackerList();
  }

  getTrackerList() {
    return this._trackerList;
  }

  async updateTrackerList() {
    const response = await fetch(TRACKER_LIST_FETCH_URL);
    this._trackerList = await response.json();
    console.log("LATEST TRACKER FETCHED - ", this._trackerList);
  }

  checkTrackerBlocking(requestDetails) {
    const documentHostName = getDomainName(requestDetails.documentUrl);
    const requestHostName = getDomainName(requestDetails.url);
    // Early Return: If document host and request host matches i.e. request is not to a third party domain,
    // then allow the request
    if (documentHostName === requestHostName) {
      return false;
    }
    // TODO: Add checks to iteratively check subdomains of request also in the tracker list
    const trackerEntry = this._trackerList[requestHostName];
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
        !Array.isArray(ruleObj.options) &&
        !Array.isArray(ruleObj.exceptions)
      ) {
        return true;
      }

      // Compute match against 'domain' and 'types' attributes of 'options' and 'exceptions'
      // TODO: Need to match sub domains also here iteratively
      const isOptionDomainRuleMatched =
        ruleObj.options?.domains?.includes?.(documentHostName);
      const isOptionRequestTypeRuleMatched = ruleObj.options?.types?.includes?.(
        requestDetails.type
      );
      const isExceptionDomainRuleMatched =
        ruleObj.exceptions?.domains?.includes?.(documentHostName);
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
