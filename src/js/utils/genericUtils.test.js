import { getDomainName, getAllSubdomains } from "./genericUtils";

const MOCK_URLS = [
  {
    url: "http://abc.pqr.com",
    expectedDomain: "pqr.com",
    subdomains: ["abc.pqr.com"],
  },
  {
    url: "abc.pqr.com",
    expectedDomain: "pqr.com",
    subdomains: ["abc.pqr.com"],
  },
  {
    url: "https://google.co.in",
    expectedDomain: "google.co.in",
    subdomains: [],
  },
  {
    url: "www.org1.co.uk",
    expectedDomain: "org1.co.uk",
    subdomains: ["www.org1.co.uk"],
  },
  { url: "", expectedDomain: null, subdomains: [] },
  {
    url: "https://www.l3.l2.l1.co.uk",
    expectedDomain: "l1.co.uk",
    subdomains: ["www.l3.l2.l1.co.uk", "l3.l2.l1.co.uk", "l2.l1.co.uk"],
  },
  { url: "moz://extension-1-url/", expectedDomain: null, subdomains: [] },
  { url: undefined, expectedDomain: undefined, subdomains: [] },
];
describe("Testing generic Utils", () => {
  test.each(MOCK_URLS)(
    "Checking domain match of $url to $expectedDomain",
    ({ url, expectedDomain }) => {
      expect(getDomainName(url)).toBe(expectedDomain);
    }
  );

  test.each(MOCK_URLS)(
    "Checking subdomains match of $url to $subdomains",
    ({ url, subdomains }) => {
      expect(getAllSubdomains(url)).toStrictEqual(subdomains);
    }
  );
});
