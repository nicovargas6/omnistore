export function parseOptionExtraPrice(optionString) {
  if (!optionString || typeof optionString !== "string") return 0;
  // Match (+ Bs 20), (+ Bs. 20), (+ $4), (+ €5), (+ 12.00), etc.
  const match = optionString.match(/\(\+\s*(?:Bs\.?|[$€£S/])?\s*(\d+(?:\.\d+)?)\s*\)/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? 0 : val;
  }
  return 0;
}
