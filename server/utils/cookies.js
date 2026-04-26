const env = require("../config/env");
const { durationToMs } = require("./time");

const accessMaxAge = durationToMs(env.accessTokenExpiresIn, 15 * 60 * 1000);
const refreshMaxAge = durationToMs(env.refreshTokenExpiresIn, 7 * 24 * 60 * 60 * 1000);

function buildCookieOptions(maxAge) {
  const options = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge
  };

  if (env.cookieDomain) {
    options.domain = env.cookieDomain;
  }

  return options;
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("cc_access", accessToken, buildCookieOptions(accessMaxAge));
  res.cookie("cc_refresh", refreshToken, buildCookieOptions(refreshMaxAge));
}

function clearAuthCookies(res) {
  const clearOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/"
  };

  if (env.cookieDomain) {
    clearOptions.domain = env.cookieDomain;
  }

  res.clearCookie("cc_access", clearOptions);
  res.clearCookie("cc_refresh", clearOptions);
}

module.exports = {
  setAuthCookies,
  clearAuthCookies
};
