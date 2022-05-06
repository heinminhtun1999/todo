import React from "react";
import { Link } from "react-router-dom";
import logo from "../Assets/icons/logo.png";

const BackToHomeLogo = (props) => {

    const { className, width = "4em", height = "4em" } = props;

    return (
        <Link to="/">
            <img src={logo} alt="toDO-logo" className={`logo-link ${className}`} title="home" style={{ width, height }}></img>
        </Link>
    )
}

export default BackToHomeLogo;