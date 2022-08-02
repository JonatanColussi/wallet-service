export const refreshTokenTtl = 60 * 60 * 24 * 30;
export const jwtExpiresIn = 360000;
export const jwtSecret = process.env.JWT_SECRET || 'DEFAULT_JWT_SECRET';
