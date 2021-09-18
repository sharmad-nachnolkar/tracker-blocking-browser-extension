import { parse } from "tldts";

export const getDomainName = (url) => {
  if (url === undefined || url === null) return undefined;
  const urlDetails = parse(url);
  return urlDetails.domain;
};

export const getAllSubdomains = (url) => {
  if (url === undefined || url === null) return [];
  const urlDetails = parse(url);
  const subdomainsPrefixList = urlDetails.subdomain.split(".");
  return subdomainsPrefixList.map(
    (subDomainPrefix, index, originalArray) =>
      `${originalArray.slice(index).join(".")}.${urlDetails.domain}`
  );
};
