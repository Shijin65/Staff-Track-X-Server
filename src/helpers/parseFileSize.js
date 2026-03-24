/**
 * Parses an XML string into an XML document
 *
 * @param {string} xmlStr
 * @returns {Element}
 */

function parseXML(xmlStr) {
  return new window.DOMParser().parseFromString(xmlStr, "text/xml")
    .documentElement;
}

/**
 * Converts a size string (e.g., "5mb", "10kb") into bytes.
 *
 * @param {string} sizeStr - Size string (e.g., "5mb", "10kb", "2gb").
 * @returns {number} - Size in bytes.
 */

function parseSizeToBytes(sizeStr) {
  const sizePattern = /^(\d+(\.\d+)?)\s*(KB|MB|GB|TB|Bytes)?$/i;
  const matches = sizeStr.match(sizePattern);
  if (!matches) return 0;

  const value = parseFloat(matches[1]);
  const unit = matches[3]?.toLowerCase();

  switch (unit) {
    case "kb":
      return value * 1024;
    case "mb":
      return value * 1024 * 1024;
    case "gb":
      return value * 1024 * 1024 * 1024;
    case "tb":
      return value * 1024 * 1024 * 1024 * 1024;
    case "bytes":
    default:
      return value;
  }
}

/**
 * Converts bytes to a human-readable size string.
 *
 * @param {number} sizeInBytes - Size in bytes.
 * @returns {string} - Size string (e.g., "5.00 MB", "10.00 KB").
 */
function parseBytesToSize(sizeInBytes) {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024;
    index++;
  }

  return sizeInBytes.toFixed(2) + " " + units[index];
}

module.exports = { parseXML, parseSizeToBytes, parseBytesToSize };
