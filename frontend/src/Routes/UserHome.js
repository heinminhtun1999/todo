import React, { useEffect, useState } from "react";
import "../Assets/styles/UserHome.css";
import { useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { getAllBoards } from "../Api/boards";
import { useSelector } from "react-redux";
import Navbar from "../Components/Navbar";

const UserHome = (props) => {

    const { logOut, getAllBoards } = props;

    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector(state => state.auth.user);
    const boards = useSelector(state => state.boards);
    const auth = useSelector(state => state.auth)

    const logout = async () => {
        await logOut();
        navigate("/", { replace: true });
    }


    useEffect(() => {
        let isMounted = true;
        document.title = `ToDO | ${user.username}`;
        if (isMounted) {
            getAllBoards();
        }

        return () => {
            isMounted = false;
            document.title = "ToDO"
        }
    }, [])

    if (!auth.isLoggedIn) return <Navigate to="/login" />

    if (!user || !boards.boards) return <h1>Loading</h1>

    return (
        <div className="user-home">
            <Navbar />
            <Outlet />
        </div>
    )
}

export default UserHome;