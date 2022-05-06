const express = require("express");
const router = express.Router();
const { verifyLogin, verifyBoard, checkVisibility, verifyOwner, verifyMember } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const {
    showAllBoards,
    createBoard,
    showBoard,
    editBoard,
    deleteBoard,
    highlightBoard,
    generateInvite,
    setPasswordToInviteLink,
    changeMemberRole,
    removeBoardMember,
    leaveBoard } = require("../controllers/board");


router.route("/")
    .get(verifyLogin, catchAsync(showAllBoards)) //get all board
    .post(verifyLogin, catchAsync(createBoard)); // create board

router.route("/:board_id")
    .get(verifyBoard, checkVisibility, showBoard) //get single board
    .put(verifyLogin, verifyBoard, verifyOwner, catchAsync(editBoard)) //edit single board
    .delete(verifyLogin, verifyBoard, verifyOwner, catchAsync(deleteBoard)); // delete single board

// highlight board

router.post("/:board_id/highlight_board", verifyLogin, verifyBoard, catchAsync(highlightBoard));

// generate invite link for board

router.post("/:board_id/generate_invite", verifyLogin, verifyBoard, catchAsync(generateInvite));

// set password for invite link

router.post("/:board_id/invite/set_password", verifyLogin, verifyBoard, verifyOwner, catchAsync(setPasswordToInviteLink));

// change member role

router.put("/:board_id/members/:user_id/change_roles", verifyLogin, verifyBoard, verifyOwner, catchAsync(changeMemberRole));

// remove member from the board 

router.put("/:board_id/members/:user_id/remove_member/", verifyLogin, verifyBoard, verifyOwner, catchAsync(removeBoardMember));

// leave from the board members

router.put("/:board_id/members/leave_board", verifyLogin, verifyBoard, verifyMember, catchAsync(leaveBoard));


module.exports = router;