import React, { useState, useEffect } from "react";
import "../Assets/styles/FormInput.css";
import show from "../Assets/icons/show.png";
import hide from "../Assets/icons/hide.png";

const FormInput = (props) => {

    const [focused, setFocused] = useState(false);

    const { type, placeholder, onChange, passwordVisible, setPasswordVisible, value, err, className } = props;

    const handleFocus = (e) => {
        setFocused(true);
    };

    const handleBlur = (e) => {
        if (!e.target.value) {
            setFocused(false);
        }
    }

    return (
        <div className={`form-input-container ${focused && "focused"} ${className}`} >
            <label htmlFor={placeholder} className="form-label" style={{ color: err && "red" }}>{placeholder}</label>
            <input
                type={passwordVisible ? (passwordVisible === "show" ? "text" : "password") : type}
                onChange={onChange}
                className="form-input"
                id={placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={value}
                style={{ borderBottom: err && "1px solid red", color: err && "red" }}
            />
            {
                passwordVisible &&
                <img
                    className="show-password"
                    src={passwordVisible === "show" ? show : hide}
                    alt="password-visibility-icon"
                    onClick={() => setPasswordVisible(passwordVisible === "show" ? "hide" : "show")}
                    title={`${passwordVisible === "show" ? "hide" : "show"} password`}
                    style={{ color: err && "red" }}
                />
            }
            {
                (err && err !== true) &&
                <span className="input-error">*{err}</span>
            }
        </div>
    )
}

export default FormInput;