import * as constants from "../constants";

const boardsInititalState = {
    boards: undefined,
    memberOf: undefined,
    highlightedBoards: undefined,
    sharedBoards: undefined,
    isPending: false,
    error: undefined
}

export const boards = (state = boardsInititalState, action) => {
    switch (action.type) {
        case constants.FETCH_BOARDS_PENDING:
            return Object.assign({}, state, { isPending: true });
        case constants.FETCH_BOARDS_SUCCESS:
            return Object.assign({}, state, { isPending: false, ...action.payload });
        case constants.FETCH_BOARDS_FAILED:
            return Object.assign({}, state, { isPending: false, error: action.payload });
        default:
            return state;
    }
}