const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyBoard, checkVisibility, verifyEditor, verifyLogin, verifyList, verifyMember, verifyCard, verifyNewList, verifyMultipleCards } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const {
    getAllLists,
    createCard,
    getSingleCard,
    editCard,
    deleteCard,
    moveCard,
    changeCardPosition,
    copyCard,
    moveMultiCards,
    moveAllCards,
    copyMultiCards,
    copyAllCards,
    deleteMultiCards,
    deleteAllCard,
    assignMemberToCard,
    unAssignMemeberFromCard,
    updateAssignmentStatus } = require("../controllers/card");

router.route("/")
    .get(verifyBoard, checkVisibility, verifyList, catchAsync(getAllLists)) // get all cards
    .post(verifyLogin, verifyBoard, verifyEditor, verifyList, catchAsync(createCard)); // create card

// move multi cards

router.put("/move_cards", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewList, verifyMultipleCards, catchAsync(moveMultiCards));

// move all cards

router.put("/move_all", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewList, catchAsync(moveAllCards));

// copy multiple cards 

router.put("/copy_cards", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewList, verifyMultipleCards, catchAsync(copyMultiCards));

// copy all cards

router.put("/copy_all", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewList, catchAsync(copyAllCards));

// delete multiple cards

router.delete("/delete_cards", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyMultipleCards, catchAsync(deleteMultiCards));

// delete card

router.delete("/delete_all", verifyLogin, verifyBoard, verifyEditor, verifyList, catchAsync(deleteAllCard));

// read, update & delete single card

router.route("/:card_id")
    .get(verifyBoard, checkVisibility, verifyList, verifyCard, getSingleCard) // get single card
    .put(verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(editCard)) // edit card
    .delete(verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(deleteCard)); // delete card

// change card position

router.put("/:card_id/change_position", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(changeCardPosition));

// move single card

router.put("/:card_id/move_card", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, verifyNewList, catchAsync(moveCard));

// copy single card

router.put("/:card_id/copy_card", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, verifyNewList, catchAsync(copyCard));

// add member to card assignments

router.put("/:card_id/assignment", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(assignMemberToCard));

// remove member from card assignment

router.put("/:card_id/assignment/remove", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(unAssignMemeberFromCard));

// mark card assignment as completed

router.put("/:card_id/assignment/completed", verifyLogin, verifyBoard, verifyMember, verifyList, verifyCard, catchAsync(updateAssignmentStatus));

module.exports = router;