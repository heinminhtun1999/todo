import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = (props) => {

    const { children } = props;

    const { isLoggedIn, user } = useSelector(state => state.auth);

    return isLoggedIn ? <Navigate to={`/${user.username}/boards`} replace={true} /> : children;
}

export default PublicRoute; 