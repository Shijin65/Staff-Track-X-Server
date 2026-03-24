const jwt = require("jsonwebtoken");
const {
  JWT_REFRESH_TOKEN_EXPIRY,
  REFRESH_SECRET_KEY,
  ACCESS_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRY,
} = require("../config/envConfig");

/**
 * Generates access and refresh tokens for a given user.
 *
 * @param {Object} user - The user object for which tokens are generated.
 * @return {Object} An object containing the access token and refresh token.
 */

const generateTokens = (user) => {
  const accessToken = jwt.sign({ user }, ACCESS_SECRET_KEY, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ user }, REFRESH_SECRET_KEY, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
