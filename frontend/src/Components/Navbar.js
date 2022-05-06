import React from "react";
import { Link } from "react-router-dom";
import "../Assets/styles/Navbar.css";

const Navbar = () => {

    return (
        <div className="navbar">
            <Link to="/heinminhtun2/boards/b">Board</Link>
        </div>
    )
}

export default Navbar;