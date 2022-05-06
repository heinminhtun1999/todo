const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyBoard, checkVisibility, verifyEditor, verifyLogin, verifyList, verifyNewBoard, verifyMultipleLists } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { getAllLists,
    createList,
    editList,
    deleteList,
    deleteLists,
    viewList,
    deleteAllLists,
    changeListPosition,
    moveList,
    moveMultiLists,
    moveAllLists,
    copyList,
    copyMultiLists,
    copyAllLists } = require("../controllers/list");


router.route("/")
    .get(verifyBoard, checkVisibility, catchAsync(getAllLists)) // get all lists
    .post(verifyLogin, verifyBoard, verifyEditor, catchAsync(createList)); // create list

// delete multiple lists 

router.delete("/delete_lists", verifyLogin, verifyBoard, verifyEditor, verifyMultipleLists, catchAsync(deleteLists));

// delete all lists

router.delete("/delete_all", verifyLogin, verifyBoard, verifyEditor, catchAsync(deleteAllLists));

// move multi lists

router.put("/move_lists", verifyLogin, verifyBoard, verifyEditor, verifyNewBoard, verifyMultipleLists, catchAsync(moveMultiLists));

// move all lists

router.put("/move_all", verifyLogin, verifyBoard, verifyEditor, verifyNewBoard, catchAsync(moveAllLists));

// copy multi lists

router.put("/copy_lists", verifyLogin, verifyBoard, verifyEditor, verifyNewBoard, verifyMultipleLists, catchAsync(copyMultiLists));

// copy all lists

router.put("/copy_all", verifyLogin, verifyBoard, verifyEditor, verifyNewBoard, catchAsync(copyAllLists));

// read, update & delete single list

router.route("/:list_id")
    .get(verifyBoard, checkVisibility, verifyList, viewList) // get single list
    .put(verifyLogin, verifyBoard, verifyEditor, verifyList, catchAsync(editList)) // edit single list
    .delete(verifyLogin, verifyBoard, verifyEditor, verifyList, catchAsync(deleteList)); // delete single list

// change list position

router.put("/:list_id/change_position", verifyLogin, verifyBoard, verifyEditor, verifyList, catchAsync(changeListPosition));

// move list from one board to another

router.put("/:list_id/move_list", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewBoard, catchAsync(moveList));

// copy list 

router.put("/:list_id/copy_list", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyNewBoard, catchAsync(copyList));

module.exports = router;