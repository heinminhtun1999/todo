import React from "react";
import "../Assets/styles/Button.css";
import LoadingSpin from "react-loading-spin";

const Button = (props) => {

    const { loading, text, className, disabled, onClick } = props;

    return <button
        className={`auth-button ${className}`}
        type="submit"
        disabled={(loading || disabled) && true}
        onClick={onClick}
    >
        {loading ? <LoadingSpin size={"2px"} primaryColor="#2c3344" /> : text}
    </button>
}

export default Button;