function durationToMs(duration, fallbackMs) {
  if (!duration || typeof duration !== "string") {
    return fallbackMs;
  }

  const trimmed = duration.trim();
  const match = trimmed.match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!match) {
    return fallbackMs;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return fallbackMs;
  }
}

module.exports = {
  durationToMs
};
