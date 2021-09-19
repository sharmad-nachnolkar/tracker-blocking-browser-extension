export const MOCK_URL_REQUESTS = [
  {
    requestDetails: {
      url: "https://googletagmanager.com/gtm.js",
      documentUrl: "https://googletagmanager.com/dashboard/new/",
      type: "script",
    },
    testDescription: "Same domain request",
    result: false,
  },
  {
    requestDetails: {
      url: "https://googletagmanager.com/gtm.js",
      documentUrl: "https://stackoverflow.com/answers/1544/",
      type: "script",
    },
    testDescription: "Matches whitelisted domain",
    result: false,
  },
  {
    requestDetails: {
      url: "https://googletagmanager.com/gtm.js",
      documentUrl: "https://javascript.frontend.geeksforgeeks.com/articles/123",
      type: "script",
    },
    testDescription:
      "Parent domain of documentUrl matches whitelisted subdomain",
    result: false,
  },
  {
    requestDetails: {
      url: "https://cloudfront.com/getData/",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription: "Third party request, Does not match any tracker entry",
    result: false,
  },
  {
    requestDetails: {
      url: "https://videodelivery.net/post/",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Matches tracker domain, No rules present, Default is block",
    result: true,
  },
  {
    requestDetails: {
      url: "https://disqus.com/post/",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Matches tracker domain, No rules present, Default is ignore",
    result: false,
  },
  {
    requestDetails: {
      url: "https://googletagmanager.com/script1.js",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription: "Rules present, No rule matched, Default is block",
    result: true,
  },
  {
    requestDetails: {
      url: "https://linkedin.com/abc/post/",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription: "Rules present, No rule matched, Default is ignore",
    result: false,
  },
  {
    requestDetails: {
      url: "https://googletagservices.com/gpt.js",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Rules present, Rule matched, No options or exceptions present",
    result: true,
  },
  {
    requestDetails: {
      url: "https://dummy1.net/post",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Rules present, Rule matched, Option present, Option domain and type not matched",
    result: false,
  },
  {
    requestDetails: {
      url: "https://dummy2.net/post",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Rules present, Rule matched, Option present, Option type matched, No Exceptions",
    result: true,
  },
  {
    requestDetails: {
      url: "https://dummy3.net/post",
      documentUrl: "https://google.com/",
      type: "xmlhttprequest",
    },
    testDescription:
      "Rules present, Rule matched, Option present, Option type matched, Exception domain matched",
    result: false,
  },
  {
    requestDetails: {
      url: "https://dummy4.net/post",
      documentUrl: "https://google.com/",
      type: "image",
    },
    testDescription:
      "Rules present, Rule matched, No option present, Exception type matched",
    result: false,
  },
  {
    requestDetails: {
      url: "https://dummy5.net/post",
      documentUrl: "https://google.com/",
      type: "image",
    },
    testDescription:
      "Rules present, Rule matched, No option present, Exception domain matched",
    result: false,
  },
];

export const MOCK_WHITELISTED_DOMAINS = [
  "stackoverflow.com",
  "geeksforgeeks.com",
];
