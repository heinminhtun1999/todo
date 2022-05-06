import { SET_SERVER_ERROR } from "../constants";

const serverError = (error) => {
    return {
        type: SET_SERVER_ERROR,
        payload: error
    }
}

export default serverError;