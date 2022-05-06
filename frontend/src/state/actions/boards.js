import * as boards from "../../Api/boards";
import * as constants from "../constants";

export const getAllBoards = () => {
    return async (dispatch) => {
        dispatch({ type: constants.FETCH_BOARDS_PENDING });
        const res = await boards.getAllBoards();
        if (res.error) {
            if (res.error.status === 500) {
                dispatch({ type: constants.SET_SERVER_ERROR, payload: res.error });
                return;
            }
            dispatch({ type: constants.FETCH_BOARDS_FAILED, payload: res.error });
        } else {
            dispatch({ type: constants.FETCH_BOARDS_SUCCESS, payload: res.data });
        }
    }
}