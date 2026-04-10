import jwt, { SignOptions, Secret } from "jsonwebtoken";
import {
  JWT_REFRESH_TOKEN_EXPIRY,
  REFRESH_SECRET_KEY,
  ACCESS_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRY,
} from "../config/envConfig";

interface UserPayload {
  userId: string;
  roleId: number;
  roleName: string;
  isSuperAdmin: boolean;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (user: UserPayload): TokenResponse => {
  const payload = { user };

  const accessOptions: SignOptions = {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
  };

  const refreshOptions: SignOptions = {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign(
    payload,
    ACCESS_SECRET_KEY as Secret,
    accessOptions
  );

  const refreshToken = jwt.sign(
    payload,
    REFRESH_SECRET_KEY as Secret,
    refreshOptions
  );

  return { accessToken, refreshToken };
};

export default generateTokens;