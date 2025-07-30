import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Note } from "../models/note.model.js";
import mongoose from "mongoose";

// Controller to create a new note
export const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title) {
        throw new ApiError(400, "Note title is required.");
    }

    const note = await Note.create({
        title,
        content,
        owner: req.user?._id, // Get owner from the authenticated user
    });

    if (!note) {
        throw new ApiError(500, "Failed to create the note. Please try again.");
    }

    return res.status(201).json(new ApiResponse(201, note, "Note created successfully."));
});

// Controller to get all notes for the logged-in user
export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ owner: req.user?._id }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, notes, "Notes retrieved successfully."));
});

// Controller to update a specific note
export const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid note ID.");
    }

    if (!title) {
        throw new ApiError(400, "Note title is required.");
    }

    const note = await Note.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Note not found.");
    }

    // Ensure the user owns the note before updating
    if (note.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this note.");
    }

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        {
            $set: {
                title,
                content,
            },
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedNote, "Note updated successfully."));
});

// Controller to delete a specific note
export const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    if (!mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid note ID.");
    }

    const note = await Note.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Note not found.");
    }

    // Ensure the user owns the note before deleting
    if (note.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this note.");
    }

    await Note.findByIdAndDelete(noteId);

    return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully."));
});