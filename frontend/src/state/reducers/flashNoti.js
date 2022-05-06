import { SET_FLASH_NOTI } from "../constants";

const flashNotiInitialState = {
    message: undefined,
}

export const setFlashNoti = (state = flashNotiInitialState, action) => {
    switch (action.type) {
        case SET_FLASH_NOTI:
            return Object.assign({}, state, { message: action.payload });
        default:
            return state;
    }
}