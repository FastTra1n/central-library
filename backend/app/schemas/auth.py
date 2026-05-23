from datetime import date

from pydantic import BaseModel, EmailStr, Field


class AuthRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=6)
    birth_date: date | None = None
    education: str | None = None
    hall_id: int | None = None


class AuthLogin(BaseModel):
    identifier: str
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    message: str


class TokenPayload(BaseModel):
    sub: str | None = None
    type: str | None = None
    exp: int | None = None


class AuthError(BaseModel):
    detail: str


class AuthStatus(BaseModel):
    authenticated: bool
    user_id: int | None = None


class AuthUserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role_id: int
    role_name: str | None = None
    card_number: str
    phone: str | None = None
    hall_id: int | None = None
    birth_date: date | None = None
    education: str | None = None


class AuthLoginResponse(TokenResponse):
    user: AuthUserResponse


class AuthRegisterResponse(TokenResponse):
    user: AuthUserResponse


class AuthRefreshResponse(RefreshResponse):
    user: AuthUserResponse


class AuthLogoutResponse(MessageResponse):
    pass


class AuthMeResponse(AuthUserResponse):
    pass
