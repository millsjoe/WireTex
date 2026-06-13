/** Replace remote image URLs in WireTex with placeholder # links. */
const IMAGE_LINK_PATTERN =
  /!\[([^\]]*)\]\(\s*(?!#|\s*\))([^)]+)\)/g;

export function stripRemoteImageUrls(markup: string): string {
  return markup.replace(IMAGE_LINK_PATTERN, "![$1](#)");
}
