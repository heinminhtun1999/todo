import * as constants from "../constants";

const authInitialState = {
    isLoggedIn: undefined,
    isLoggedInPending: false,
    isLoggedInError: undefined,
    user: undefined,
    loginPending: false,
    loginError: undefined,
    registerPending: false,
    registerError: undefined,
    logoutPending: false,
    logoutError: undefined
}

export const authReducer = (state = authInitialState, action) => {
    switch (action.type) {
        case constants.ISAUTHENTICATED_PENDING:
            return Object.assign({}, state, { isLoggedInPending: true });
        case constants.ISAUTHENTICATED_SUCCESS:
            return Object.assign({}, state, { isLoggedIn: action.payload.isLoggedIn, user: action.payload.user, isLoggedInPending: false });
        case constants.ISAUTHENTICATED_FAILED:
            return Object.assign({}, state, { isLoggedInPending: false, isLoggedInError: action.payload });
        case constants.LOGIN_PENDING:
            return Object.assign({}, state, { loginPending: true });
        case constants.LOGIN_SUCCESS:
            return Object.assign({}, state, { loginPending: false, isLoggedIn: true, user: action.payload.user, loginError: undefined });
        case constants.LOGIN_FAILED:
            return Object.assign({}, state, { loginPending: false, loginError: action.payload });
        case constants.REGISTER_PENDING:
            return Object.assign({}, state, { registerPending: true });
        case constants.REGISTER_SUCCESS:
            return Object.assign({}, state, { registerPending: false, user: action.payload.user, registerError: undefined, isLoggedIn: true });
        case constants.REGISTER_FAILED:
            return Object.assign({}, state, { registerPending: false, user: undefined, registerError: action.payload });
        case constants.LOGOUT_PENDING:
            return Object.assign({}, state, { logoutPending: true });
        case constants.LOGOUT_SUCCESS:
            return Object.assign({}, state, { logoutPending: false, isLoggedIn: false, user: undefined });
        case constants.LOGOUT_FAILED:
            return Object.assign({}, state, { logoutPending: false, payload: action.payload });
        default:
            return state;
    }
}

const forgortPasswordInitialState = {
    isPending: false,
    message: undefined,
    error: undefined
}

export const forgotPasswordReducer = (state = forgortPasswordInitialState, action) => {
    switch (action.type) {
        case constants.FORGOT_PASSWORD_PENDING:
            return Object.assign({}, state, { isPending: true });
        case constants.FORGOT_PASSWORD_SUCCESS:
            return Object.assign({}, state, { isPending: false, message: action.payload, error: undefined });
        case constants.FORGOT_PASSWORD_FAILED:
            return Object.assign({}, state, { isPending: false, error: action.payload, message: undefined });
        case constants.REMOVE_FORGOT_PASSWORD_MESSAGE:
            return Object.assign({}, state, { message: undefined, error: undefined });
        default:
            return state;
    }
}

const checkPasswordResetInitialState = {
    isPending: false,
    error: undefined,
    user: undefined
}

export const checkPasswordResetReducer = (state = checkPasswordResetInitialState, action) => {
    switch (action.type) {
        case constants.CHECK_PASSWORD_RESET_PENDING:
            return Object.assign({}, state, { isPending: true });
        case constants.CHECK_PASSWORD_RESET_SUCCESS:
            return Object.assign({}, state, { isPending: false, user: action.payload });
        case constants.CHECK_PASSWORD_RESET_FAILED:
            return Object.assign({}, state, { isPending: false, error: action.payload });
        default:
            return state;
    }
}

const resetPasswordInitialState = {
    isPending: false,
    error: undefined,
    message: undefined
}

export const resetPassword = (state = resetPasswordInitialState, action) => {
    switch (action.type) {
        case constants.RESET_PASSWORD_PENDING:
            return Object.assign({}, state, { isPending: true });
        case constants.RESET_PASSWORD_SUCCESS:
            return Object.assign({}, state, { isPending: false, message: action.payload, error: undefined });
        case constants.RESET_PASSWORD_FAILED:
            return Object.assign({}, state, { isPending: false, error: action.payload, message: undefined });
        default:
            return state;
    }
}
