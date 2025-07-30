import { Router } from "express";
import {
    createNote,
    getAllNotes,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this file
// This ensures that only authenticated users can access these endpoints
router.use(verifyJWT);

router.route("/").post(createNote).get(getAllNotes);
router.route("/:noteId").patch(updateNote).delete(deleteNote);

export default router;