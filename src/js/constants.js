export const REQUEST_TYPES = [
  "stylesheet",
  "script",
  "image",
  "xmlhttprequest",
  "ping",
  "object",
  "other",
];

// Served through github pages. For production this can be moved to a more scalable storage like s3
export const TRACKER_LIST_FETCH_URL =
  "https://sharmad-nachnolkar.github.io/tracker-blocking-browser-extension/trackers.json";

export const STORAGE_NAMES = {
  TRACKER_LIST: "TRACKER_LIST",
  WHITELISTED_DOCUMENT_DOMAINS: "WHITELISTED_DOCUMENT_DOMAINS",
  BLOCKED_TRACKERS: "BLOCKED_TRACKERS",
};
