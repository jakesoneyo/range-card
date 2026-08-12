// AuthService.login에서 서명하는 JWT payload 형태. sub = Admin.id.
export interface JwtPayload {
  sub: string;
  username: string;
}

// JwtStrategy.validate()가 반환해 req.user에 주입되는 요청 컨텍스트 관리자.
export interface AuthenticatedAdmin {
  id: string;
  username: string;
}
