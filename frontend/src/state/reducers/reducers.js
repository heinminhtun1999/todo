import { combineReducers } from "redux";
import { authReducer, forgotPasswordReducer, checkPasswordResetReducer, resetPassword } from "./auth";
import { boards } from "./boards";
import serverError from "./serverError";
import { setFlashNoti } from "./flashNoti";

const reducers = combineReducers({
    auth: authReducer,
    boards,
    flashNoti: setFlashNoti,
    forgotPassword: forgotPasswordReducer,
    checkPasswordReset: checkPasswordResetReducer,
    resetPassword,
    serverError
});

export default reducers;