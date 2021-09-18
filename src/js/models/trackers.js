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
    this._trackerList = await response.json().trackers;
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

    const trackerEntry = this._trackerList[requestHostName];
    // Early Return: If request domain is not in list of tracker domains then allow request
    if (trackerEntry === undefined) {
      return false;
    }

    // Cases of matching tracker entry found

    // Case 1 - No rules available for tracker i.e. rules are undefined or blank array
    if (
      trackerEntry.rules === undefined ||
      (Array.isArray(trackerEntry.rules) && trackerEntry.rules.length === 0)
    ) {
      return trackerEntry.default === "block";
    }

    // Case 2 - Rule(s) exists
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
