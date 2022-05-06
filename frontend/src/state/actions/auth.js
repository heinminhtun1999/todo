import * as auth from "../../Api/auth";
import * as constants from "../constants";

export const checkIsAuthenticated = () => {
    return async (dispatch) => {
        dispatch({ type: constants.ISAUTHENTICATED_PENDING });
        const res = await auth.isAuthenticated();
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.ISAUTHENTICATED_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.ISAUTHENTICATED_SUCCESS, payload: res.data });
        }
    }
}

export const logIn = (data) => {
    return async (dispatch) => {
        dispatch({ type: constants.LOGIN_PENDING });
        const res = await auth.login(data);
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.LOGIN_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.LOGIN_SUCCESS, payload: res.data });
            dispatch({ type: constants.SET_FLASH_NOTI, payload: res.data.message });
        }
    }
}

export const registerUser = (data) => {
    console.log(data.get("name"))
    return async (dispatch) => {
        dispatch({ type: constants.REGISTER_PENDING });
        const res = await auth.register(data);
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.REGISTER_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.REGISTER_SUCCESS, payload: res.data });
            dispatch({ type: constants.SET_FLASH_NOTI, payload: res.data.message });
        }
    }
}

export const logOut = () => {
    return async (dispatch) => {
        dispatch({ type: constants.LOGOUT_PENDING });
        const res = await auth.logout();
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.LOGOUT_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.LOGOUT_SUCCESS });
            dispatch({ type: constants.SET_FLASH_NOTI, payload: res.data.message });
        }
    }
}

export const forgotPassword = (username) => {
    return async (dispatch) => {
        dispatch({ type: constants.FORGOT_PASSWORD_PENDING });
        const res = await auth.forgotPassword(username);
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.FORGOT_PASSWORD_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.FORGOT_PASSWORD_SUCCESS, payload: res.data.message });
        }
    }
}

export const removeForgotPasswordMessage = () => {
    return {
        type: constants.REMOVE_FORGOT_PASSWORD_MESSAGE,
    }
}

export const checkPasswordReset = (token) => {
    return async (dispatch) => {
        dispatch({ type: constants.CHECK_PASSWORD_RESET_PENDING });
        const res = await auth.checkPasswordReset(token);
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.CHECK_PASSWORD_RESET_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.CHECK_PASSWORD_RESET_SUCCESS, payload: res.data });
        }
    }
}

export const resetPassword = (token, password) => {
    return async (dispatch) => {
        dispatch({ type: constants.RESET_PASSWORD_PENDING });
        const res = await auth.resetPassword(token, password);
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.RESET_PASSWORD_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.RESET_PASSWORD_SUCCESS, payload: res.data.message });
        }
    }
}
