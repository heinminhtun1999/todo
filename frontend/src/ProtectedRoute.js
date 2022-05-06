import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = (props) => {

    const { children } = props;

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    return isLoggedIn ? children : <Navigate to="/login" replace={true} />;
}

export default ProtectedRoute;