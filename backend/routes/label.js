const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyBoard, verifyList, verifyCard, verifyLogin, checkVisibility, verifyEditor, verifyLabel } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { getAllLabel, createOrAddLabel, deleteLabel, removeLabelFromCard } = require("../controllers/label");

// get all label from board

router.get("/", verifyBoard, checkVisibility, verifyList, verifyCard, catchAsync(getAllLabel));

// create label or add label into card if label exists in board

router.post("/", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, catchAsync(createOrAddLabel));

// delete label from board

router.delete("/:label_id", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, verifyLabel, catchAsync(deleteLabel));

// remove label from card 

router.put("/:label_id", verifyLogin, verifyBoard, verifyEditor, verifyList, verifyCard, verifyLabel, catchAsync(removeLabelFromCard));

module.exports = router;