

export const BASE_URL = (path) => `http://localhost:8000/${path}`

export const CSRFToken = document.cookie.split("=")[1]


export const AuthUrls = () => ({ login: `auth/login`, register: `auth/register`,refreshToken:"auth/refresh", blacklistToken:"auth/logout/" })