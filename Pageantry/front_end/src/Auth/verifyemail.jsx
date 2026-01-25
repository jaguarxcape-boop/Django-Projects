import { useState, useEffect, useCallback } from "react"
import { useSearchParams, Link } from "react-router"
import { BASE_URL, AuthUrls, CSRFToken } from "../baseUrl"
import "./verify-email.css"

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams()
    const [verificationState, setVerificationState] = useState({
        loading: false,
        success: false,
        error: null,
        message: ""
    })

    const token = searchParams.get("token")

    const handleEmailVerification = useCallback(async (verificationToken) => {
        setVerificationState({
            loading: true,
            success: false,
            error: null,
            message: "Verifying your email..."
        })

        try {
            const res = await fetch(BASE_URL("auth/verify-email/"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": CSRFToken,
                },
                body: JSON.stringify({ token: verificationToken })
            })

            const data = await res.json()

            if (res.ok && data.code === "email_verified") {
                setVerificationState({
                    loading: false,
                    success: true,
                    error: null,
                    message: "Email verified successfully!"
                })
            } else {
                setVerificationState({
                    loading: false,
                    success: false,
                    error: data.statusText ? data.statusText[0] : "Verification failed",
                    message: ""
                })
            }
        } catch (err) {
            setVerificationState({
                loading: false,
                success: false,
                error: err.message || "An error occurred during verification",
                message: ""
            })
        }
    }, [])

    const handleResendEmail = async () => {
        // TODO: Implement resend verification email
        setVerificationState({
            loading: true,
            success: false,
            error: null,
            message: "Resending verification email..."
        })
        // Will implement resend endpoint after this
    }
    useEffect(() => {
        if (token) {
            handleEmailVerification(token)
        }
    }, [token, handleEmailVerification])
    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {!token ? (
                    <>
                        <div className="verify-email-icon">✉️</div>
                        <h2>Check Your Email</h2>
                        <p className="verify-subtitle">
                            We've sent a verification link to your email address.
                        </p>
                        <p className="verify-instructions">
                            Click the link in the email to verify your account and get started.
                        </p>

                        <div className="verify-info-box">
                            <p>
                                <strong>Don't see the email?</strong> Check your spam folder.
                            </p>

                            <h4>This link will expire in 24 hours</h4>
                        </div>

                        {/* <button 
                            className="resend-button" 
                            onClick={handleResendEmail}
                            disabled={verificationState.loading}
                        >
                            {verificationState.loading ? "Sending..." : "Resend Verification Email"}
                        </button> */}

                        <div className="verify-actions">
                            <Link to="/auth/login" className="back-login-link">
                                Back to Login
                            </Link>
                        </div>
                    </>
                ) : verificationState.loading ? (
                    <>
                        <div className="verify-spinner"></div>
                        <h2>Verifying...</h2>
                        <p>{verificationState.message}</p>
                    </>
                ) : verificationState.success ? (
                    <>
                        <div className="verify-email-icon success">✓</div>
                        <h2>Email Verified!</h2>
                        <p className="verify-success-message">
                            Your email has been verified successfully. You can now log in to your account.
                        </p>
                        <Link to="/auth/login" className="verify-login-button">
                            Go to Login
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="verify-email-icon error">✗</div>
                        <h2>Verification Failed</h2>
                        <p className="verify-error-message">
                            {verificationState.error}
                        </p>
                        <div className="verify-error-info">
                            <p>The link may have expired or is invalid.</p>
                        </div>
                        <button 
                            className="resend-button" 
                            onClick={handleResendEmail}
                            disabled={verificationState.loading}
                        >
                            {verificationState.loading ? "Sending..." : "Resend Verification Email"}
                        </button>
                        <Link to="/auth/register" className="back-register-link">
                            Back to Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default VerifyEmailPage
