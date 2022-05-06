import React, { useEffect, useState } from "react";
import "../Assets/styles/Login.css";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "../Components/FormInput";
import Button from "../Components/Button";
import BackToHomeLogo from "../Components/BackToHomeLogo";
import { useSelector } from "react-redux";

const Login = ({ logIn }) => {

    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);

    const [data, setData] = useState({
        username: "",
        password: ""
    });
    const [err, setErr] = useState();
    const [passwordVisible, setPasswordVisible] = useState("hide");

    const handleUsername = (e) => {
        setData(prevValue => ({ ...prevValue, username: e.target.value }));
        setErr(err !== "username is required" && null);
    }

    const handlePassword = (e) => {
        setData(prevValue => ({ ...prevValue, password: e.target.value }));
        setErr(err !== "password is required" && null);
    }

    const submitForm = (e) => {
        e.preventDefault();
        if (!data.username && !data.password) {
            setErr("username or password is required");
            return;
        } else if (!data.username) {
            setErr("username is required");
            return;
        } else if (!data.password) {
            setErr("password is required");
            return;
        }
        logIn(data);
    }

    useEffect(() => {
        if (auth.loginError) {
            setErr(auth.loginError.message === "Unauthorized" ? "username or password is incorrect" : auth.loginError.message);
        }
    }, [auth.loginError])

    return (
        <div className="login">
            <div className="login-content">
                <BackToHomeLogo />
                <h1 className="login-title">ToDO | Login</h1>
                <form className="login-form" onSubmit={submitForm}>
                    <FormInput
                        type="text"
                        onChange={handleUsername}
                        placeholder="Username"
                        value={data.username}
                        err={err === "username is required" ? err : (err === "username or password is required" || err === "username or password is incorrect") && true}
                    />
                    <FormInput
                        type="password"
                        onChange={handlePassword}
                        placeholder="Password"
                        passwordVisible={passwordVisible}
                        setPasswordVisible={setPasswordVisible}
                        value={data.password}
                        err={err === "password is required" ? err : (err === "username or password is required" || err === "username or password is incorrect") && true}
                    />
                    {
                        (err && (err !== "username is required" && err !== "password is required"))
                        &&
                        <p className="login-error">*{err}</p>
                    }
                    <Button loading={auth.loginPending} text="Login" className="login-button" />
                </form>
                <Link to="/forgot" className="forgot-password-text">forgot password?</Link>
                <p className="register-text">Don't have an account? <Link className="register-text-link" to="/register">Register</Link></p>
            </div>
        </div>
    )
}

export default Login;