export const JWT_SECRET = process.env.JWT_SECRET_KEY;
export const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME;
export const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME;
export const HASH_ROUND = parseInt(process.env.HASH_ROUND, 10);
