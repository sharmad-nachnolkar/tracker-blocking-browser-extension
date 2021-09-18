import { parse } from "tldts";

export const getDomainName = (url) => {
  if (url === undefined || url === null) return undefined;
  const urlDetails = parse(url);
  return urlDetails.domain;
};
