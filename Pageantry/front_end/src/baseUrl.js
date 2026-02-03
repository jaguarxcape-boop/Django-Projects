

// export const BASE_URL = (path) => `http://10.187.99.190:8000/${path}`
export const BASE_URL = (path) => `http://localhost:8000/${path}`
export const CSRFToken = document.cookie.split("=")[1]


export const AuthUrls = () => ({
    login: `auth/login`, register: `auth/register`, refreshToken: "auth/refresh", blacklistToken: "auth/logout/", reset_password: 'auth/passwordreset', password_reset_done: 'auth/password_reset_done',


    resend_email_verificaition_link: 'auth/resend_email_verificaition_link'
})

