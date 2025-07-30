import React, { useState, useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import CreateNoteForm from "../../components/CreateNoteForm";
import Modal from "../../components/Modal";
import envConfig from "../../../conf/envConfiq";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import NoteSkeleton from "../../components/Skeleton/NoteSkeleton";

const Dashboard = () => {
    const [notes, setNotes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${envConfig.BaseUrl}/notes`, {
                    withCredentials: true,
                });
                setNotes(response.data.data);
            } catch (error) {
                toast.error("Could not fetch notes.", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [user]);

    const handleSignOut = async () => {
        await logout();
        navigate("/auth");
    };

    const handleDeleteNote = async (noteId) => {
        const originalNotes = [...notes];
        setNotes((currentNotes) =>
            currentNotes.filter((note) => note?._id !== noteId)
        );
        const toastId = toast.loading("Deleting note...");
        try {
            await axios.delete(`${envConfig.BaseUrl}/notes/${noteId}`, {
                withCredentials: true,
            });
            toast.success("Note deleted!", { id: toastId });
        } catch (error) {
            setNotes(originalNotes);
            toast.error("Failed to delete note.", { id: toastId });
        }
    };

    const handleCreateNote = async (data) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Creating note...");
        try {
            const response = await axios.post(
                `${envConfig.BaseUrl}/notes`,
                data,
                { withCredentials: true }
            );
            setNotes((currentNotes) => [response.data.data, ...currentNotes]);
            toast.success("Note created!", { id: toastId });
            setIsModalOpen(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create note.",
                { id: toastId }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-md bg-white shadow-lg flex flex-col">
                <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="HD Logo" className="h-6" />
                        <h1 className="text-xl font-bold text-gray-800">
                            Dashboard
                        </h1>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign Out
                    </button>
                </header>
                <main className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <div className="p-4 border space-y-4  border-gray-200 rounded-lg shadow-md">
                        <h2 className="text-lg font-inter font-bold text-[#232323]">
                            Welcome, {user?.fullName}!
                        </h2>
                        <p className="text-sm text-[#232323] tracking-wider">
                            Email: {user?.email}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-btn-bg-color text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Create Note
                    </Button>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-600">
                            Notes
                        </h3>
                        <div className="space-y-3">
                            {isLoading ? (
                                <>
                                    <NoteSkeleton />
                                    <NoteSkeleton />
                                    <NoteSkeleton />
                                    <NoteSkeleton />
                                </>
                            ) : notes.length > 0 ? (
                                notes.map((note) => (
                                    <div
                                        key={note?._id}
                                        className="flex items-center justify-between py-2 px-4 border border-gray-200 rounded-lg shadow-md"
                                    >
                                        <p className="text-notes-color ">
                                            {note?.title}
                                        </p>
                                        <button
                                            onClick={() =>
                                                handleDeleteNote(note?._id)
                                            }
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <FaRegTrashAlt />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No notes yet. Create one!
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isLoading && setIsModalOpen(false)}
                title="Create a New Note"
            >
                <CreateNoteForm
                    onSubmit={handleCreateNote}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
};

export default Dashboard;
