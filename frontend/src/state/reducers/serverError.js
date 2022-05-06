import { SET_SERVER_ERROR } from "../constants";

const serverErrorInitialState = {
    error: undefined
}

const serverError = (state = serverErrorInitialState, action) => {
    if (action.type === SET_SERVER_ERROR) {
        return Object.assign({}, state, { error: action.payload })
    } else {
        return state;
    }
};

export default serverError;