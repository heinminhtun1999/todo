import React, { useState, useEffect } from "react";
import "../Assets/styles/ForgotPassword.css";
import FormInput from "../Components/FormInput";
import Button from "../Components/Button";
import { Link } from "react-router-dom";
import BackToHomeLogo from "../Components/BackToHomeLogo";
import { useSelector } from "react-redux";

const ForgotPassword = (props) => {

    const { forgotPassword, removeForgotPasswordMessage } = props;

    const [username, setUsername] = useState("");
    const [err, setErr] = useState();

    const fgPw = useSelector(state => state.forgotPassword);

    const handleChange = (e) => {
        setUsername(e.target.value);
        setErr(err && null);
    }

    const submitForm = (e) => {
        e.preventDefault();
        if (!username) {
            setErr("username cannot be blank");
            return;
        }
        forgotPassword(username);
    }

    useEffect(() => {
        if (fgPw.error) {
            setErr(fgPw.error.message)
        }
    }, [fgPw.error]);

    useEffect(() => {
        return () => {
            // remove error message or success message on component unmount
            if (fgPw.error || fgPw.message)
                removeForgotPasswordMessage();
        }
    })

    return (
        <div className="forgot-password">
            <div className="forgot-password-content">
                <BackToHomeLogo />
                <h1 className="forgot-password-title">Forgot Password</h1>
                <p>Enter username or email to reset password</p>
                <form className="forgot-password-form" onSubmit={submitForm}>
                    <FormInput type="text" onChange={handleChange} placeholder="Username or Email" err={err} value={username} />
                    {fgPw.message && <p className="reset-link-message">{fgPw.message}</p>}
                    <Button loading={fgPw.isPending} text="Submit" className="forgot-password-button" />
                </form>
                <Link to="/login" className="back-to-login">Back To Login</Link>
            </div>
        </div>
    )
};

export default ForgotPassword;