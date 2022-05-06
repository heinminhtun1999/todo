import { SET_FLASH_NOTI } from "../constants";

const setFlashNoti = (message) => {
    return {
        type: SET_FLASH_NOTI,
        payload: message,
    }
}

export default setFlashNoti;