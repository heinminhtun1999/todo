import React, { useEffect, useState } from "react";
import "../Assets/styles/ResetPassword.css";
import { useLocation, Link } from "react-router-dom";
import BackToHomeLogo from "../Components/BackToHomeLogo";
import { useSelector } from "react-redux";
import Avatar from "../Components/Avatar";
import FormInput from "../Components/FormInput";
import Button from "../Components/Button";
import { checkPassword } from "../utils";

const ResetPassword = ({ checkPasswordReset, resetPassword }) => {

    const [passwordVisible, setPasswordVisible] = useState("hide");
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState("hide");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inputErr, setInputErr] = useState();

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const token = params.get("token");
    const requestedUser = useSelector(state => state.checkPasswordReset);
    const resetPasswordState = useSelector(state => state.resetPassword);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setInputErr();
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setInputErr();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!checkPassword(password)) {
            setInputErr("Password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number");
        } else if (confirmPassword !== password) {
            setInputErr("Passwords do not match");
        } else {
            resetPassword(token, password);
        }
    }

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            checkPasswordReset(token);
            document.title = "ToDO | Reset Password";
        }
        return () => {
            document.title = "ToDO";
            isMounted = false;
        }
    }, []);

    if (!requestedUser.user && !requestedUser.error) {
        return <h1>Loading</h1>
    }

    return (
        <div className="reset-password">
            <div className="reset-password-container">
                <BackToHomeLogo />
                <h1 className="reset-password-title">ToDO | Reset Password</h1>
                <div className="reset-password-content">
                    {
                        requestedUser.error ?
                            (
                                <div className="reset-password-err">
                                    <h2 className="reset-password-err-heading">{requestedUser.error.message}</h2>
                                    <p className="reset-password-err-desc">{requestedUser.error.message === "Password Reset Link Expired" ? "Your link for resetting password's link has expired. You can make another request to reset password link from below"
                                        :
                                        "Your password reset link is invalid. If you forgot your account password, you can make a request to reset your password from below"}
                                    </p>
                                    <div className="reset-err-link-container">
                                        <Link to="/forgot" className="reset-err-link">Forgot password</Link>
                                        <Link to="/" className="reset-err-link">Go to home</Link>
                                    </div>
                                </div>
                            )
                            :
                            (
                                <div className="reset-password-success">
                                    <Avatar src={requestedUser.user.avatar} className="reset-password-avatar" />
                                    <p className="reset-password-username">Enter new password for <b>{requestedUser.user.username}</b></p>
                                    <form className="reset-password-form" onSubmit={handleSubmit}>
                                        <FormInput
                                            placeholder="Password"
                                            passwordVisible={passwordVisible}
                                            setPasswordVisible={setPasswordVisible}
                                            onChange={handlePasswordChange}
                                            err={inputErr && true}
                                            value={password}
                                        />
                                        <FormInput
                                            placeholder="Confirm Password"
                                            passwordVisible={confirmPasswordVisible}
                                            setPasswordVisible={setConfirmPasswordVisible}
                                            onChange={handleConfirmPasswordChange}
                                            err={(inputErr && inputErr !== "Password must be minimum eight characters, at leas…rcase letter, one lowercase letter and one number") && true}
                                            value={confirmPassword}
                                        />
                                        {
                                            inputErr &&
                                            <p className="reset-err-text">*{inputErr}</p>
                                        }
                                        {
                                            resetPasswordState.message &&
                                            <div className="reset-success-text-container">
                                                <span className="reset-success-text">{resetPasswordState.message}</span>
                                                <Link to="/login" className="reset-succes-to-login">to login</Link>
                                            </div>
                                        }
                                        <Button text="Reset Password" className="reset-password-submit" loading={resetPasswordState.isPending} disabled={resetPasswordState.message && true} />
                                    </form>
                                </div>
                            )
                    }
                </div>
            </div>
        </div >
    )
}

export default ResetPassword;