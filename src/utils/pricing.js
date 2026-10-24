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

export function getOptionDetails(optionString, currency = "Bs ") {
  if (!optionString || typeof optionString !== "string") {
    return { 
      name: optionString || "", 
      hasExtra: false, 
      extraPrice: 0, 
      extraText: "", 
      fullDisplay: optionString || "" 
    };
  }
  const curr = (currency || "Bs ").trim();
  const match = optionString.match(/\(\+\s*(?:Bs\.?|[$€£S/])?\s*(\d+(?:\.\d+)?)\s*\)/i);
  if (match && match[1]) {
    const extraPrice = parseFloat(match[1]) || 0;
    const name = optionString.replace(/\s*\(\+.*?\)\s*/i, "").trim();
    return {
      name,
      hasExtra: true,
      extraPrice,
      extraText: `(+ ${curr} ${extraPrice.toFixed(2)})`,
      fullDisplay: `${name} (+ ${curr} ${extraPrice.toFixed(2)})`,
    };
  }
  return {
    name: optionString,
    hasExtra: false,
    extraPrice: 0,
    extraText: "",
    fullDisplay: optionString,
  };
}

export function formatOptionDisplay(optionString, currency = "Bs ") {
  return getOptionDetails(optionString, currency).fullDisplay;
}
