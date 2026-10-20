// Utility to parse extra prices from option strings like "Con burrata (+ $4)", "Kit (+ $35)", "Talle XL (+ $2.50)"
export function parseOptionExtraPrice(optionString) {
  if (!optionString || typeof optionString !== "string") return 0;
  // Match (+ $4), (+ $4.50), (+ 4), (+ 12.00), (+ $12), (+ €5), (+ S/ 8), etc.
  const match = optionString.match(/\(\+\s*[\$€S/\s]*(\d+(?:\.\d+)?)\s*\)/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? 0 : val;
  }
  return 0;
}
