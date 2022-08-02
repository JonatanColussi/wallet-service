export interface AccessTokenPayload {
  sub: string;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  jti: string;
}
