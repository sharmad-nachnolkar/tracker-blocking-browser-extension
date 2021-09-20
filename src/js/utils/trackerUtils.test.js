import { matchTrackers } from "./trackerUtils";
import { trackerList } from "../../mockData/mockTrackerList";
import {
  MOCK_URL_REQUESTS,
  MOCK_WHITELISTED_DOMAINS,
} from "../../mockData/mockTrackerUrls";

describe("Testing cases for tracker matching logic", () => {
  test.each(MOCK_URL_REQUESTS)(
    "CASE: $testDescription",
    ({ requestDetails, result }) => {
      expect(
        matchTrackers(requestDetails, trackerList, MOCK_WHITELISTED_DOMAINS)
      ).toBe(result);
    }
  );
});
