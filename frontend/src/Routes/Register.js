import React, { useEffect, useState } from "react";
import "../Assets/styles/Register.css";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "../Components/Avatar";
import BackToHomeLogo from "../Components/BackToHomeLogo";
import FormInput from "../Components/FormInput";
import Button from "../Components/Button";
import AvatarEditorCustom from "../Components/AvatarEditorCustom";
import { checkInputs } from "../utils";

const Register = ({ register }) => {

    const [file, setFile] = useState();
    const [data, setData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: undefined
    });
    const [displayAvatar, setDisplayAvatar] = useState("https://res.cloudinary.com/hein-s-cloud/image/upload/v1651469923/ToDO/Avatars/afzblll1thb9ghyrj71z.png");
    const [passwordVisible, setPasswordVisible] = useState("hide");
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState("hide");
    const [err, setErr] = useState();

    const auth = useSelector(state => state.auth);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        e.target.value = null;
    }

    const handleNameChange = (e) => {
        setData(prevValue => ({ ...prevValue, name: e.target.value }));
        setErr(err === "name is required" && null);
    };

    const handleUsernameChange = (e) => {
        setData(prevValue => ({ ...prevValue, username: e.target.value }));
        setErr((err === "username is required" || err === "username must be between 6 to 25 characters long and special characters must be excluded") && null);
    }

    const handleEmailChange = (e) => {
        setData(prevValue => ({ ...prevValue, email: e.target.value }));
        setErr((err === "email is required" || err === "invalid email address") && null);
    }

    const handlePasswordChange = (e) => {
        setData(prevValue => ({ ...prevValue, password: e.target.value }));
        setErr((err === "password is required"
            ||
            err === "password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number"
            ||
            err === "passwords do not match") && null);
    }

    const handleConfirmPasswordChange = (e) => {
        setData(prevValue => ({ ...prevValue, confirmPassword: e.target.value }));
        setErr((err === "confirm password is required" || err === "passwords do not match") && null);
    }

    const submitForm = async (e) => {
        e.preventDefault();
        if (checkInputs(data) !== true) {
            setErr(checkInputs(data));
        } else {
            const fd = new FormData();
            for (let keys in data) {
                if (keys !== "confirmPassword") {
                    fd.append(keys, data[keys])
                }
            }
            await register(fd);
        }
    }

    useEffect(() => {
        if (auth.registerError) {
            setErr(auth.registerError.message)
        }
    }, [auth.registerError])

    return (
        <div className="register">
            <div className="register-content">
                <BackToHomeLogo />
                <h1 className="register-title">ToDO | Register</h1>
                <form onSubmit={submitForm} className="register-form">
                    <FormInput
                        type="text"
                        placeholder="Name"
                        onChange={handleNameChange}
                        className="register-name-input"
                        value={data.name}
                        err={err === "name is required" ? err : err === "you must all enter fields to register" && true}
                    />
                    <div className="register-avatar-container">
                        <label htmlFor="avatar-file" className="avatar-label">
                            <Avatar
                                width="60px"
                                height="60px"
                                className="register-avatar-display"
                                src={file ? file : displayAvatar}
                            />
                            <input type="file" className="file-input" id="avatar-file" onInput={handleFileChange} accept=".png, .jpg, .jpeg" />
                        </label>
                        <span className="register-avatar-title">Avatar</span>
                    </div>
                    <FormInput
                        type="text"
                        placeholder="Username"
                        onChange={handleUsernameChange}
                        value={data.username}
                        err={
                            (err === "username is required" || err === "username must be between 6 to 25 characters long and special characters must be excluded")
                                ?
                                err
                                :
                                (err === "you must all enter fields to register" || err === "username or email already exists") && true
                        }
                    />
                    <FormInput
                        type="text"
                        placeholder="Email"
                        onChange={handleEmailChange}
                        value={data.email}
                        err={
                            (err === "email is required" || err === "invalid email address") ?
                                err
                                :
                                (err === "you must all enter fields to register" || err === "username or email already exists") && true
                        }
                    />
                    <FormInput
                        type="text"
                        placeholder="Password"
                        onChange={handlePasswordChange}
                        value={data.password}
                        passwordVisible={passwordVisible}
                        setPasswordVisible={setPasswordVisible}
                        err={
                            (err === "password is required"
                                ||
                                err === "password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number"
                                ||
                                err === "passwords do not match")
                                ?
                                err
                                :
                                err === "you must all enter fields to register" && true
                        }
                    />
                    <FormInput
                        type="text"
                        placeholder="ConfirmPassword"
                        onChange={handleConfirmPasswordChange}
                        value={data.confirmPassword}
                        passwordVisible={confirmPasswordVisible}
                        setPasswordVisible={setConfirmPasswordVisible}
                        err={
                            (err === "confirm password is required" || err === "passwords do not match")
                                ?
                                err
                                :
                                err === "you must all enter fields to register" && true
                        }
                    />
                    {
                        (err && (err === "username or email already exists" || err === "you must all enter fields to register"))
                        &&
                        <p className="register-error">*{err}</p>
                    }
                    <Button text="Register" className="register-submit-btn" loading={auth.registerPending} />
                </form>
                <p className="login-text">Already have an account?<Link to="/login" className="login-text-link">Login</Link></p>
            </div>
            {
                file &&
                <AvatarEditorCustom file={file} setFile={setFile} setData={setData} setDisplayAvatar={setDisplayAvatar} />
            }
        </div>
    )
}

export default Register;