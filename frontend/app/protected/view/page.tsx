"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface FileObject {
    name: string;
    id: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        size: number;
        mimetype?: string;
    };
}

export default function DocumentBrowser() {
    const [files, setFiles] = useState<FileObject[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const loadUserFiles = async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) {
                router.push("/sign-in");
                return;
            }

            const { data, error: storageError } = await supabase.storage
                .from("contracts")
                .list(user.id);

            if (storageError) throw storageError;

            const mappedFiles = (data || []).map((file) => ({
                name: file.name,
                id: file.id,
                created_at: file.created_at,
                last_accessed_at: file.last_accessed_at,
                metadata: {
                    size: file.metadata.size,
                    mimetype: file.metadata.mimetype,
                },
            }));
            setFiles(mappedFiles);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Error loading files"
            );
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserFiles();
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleDownload = async (fileName: string) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const filePath = `${user.id}/${fileName}`;
            const { data, error } = await supabase.storage
                .from("contracts")
                .download(filePath);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Error downloading file"
            );
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!window.confirm("Are you sure you want to delete this file?"))
            return;

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const filePath = `${user.id}/${fileName}`;
            const { error } = await supabase.storage
                .from("contracts")
                .remove([filePath]);

            if (error) throw error;

            await loadUserFiles();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Error deleting file"
            );
        }
    };

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 top-16 p-8 overflow-hidden">
            <div className="text-4xl text-teal-400 font-bold mb-6">
                Your Documents
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {loading ? (
                <div>Loading documents...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : files.length === 0 ? (
                <div>No documents found. Upload some files to get started.</div>
            ) : (
                <div className="overflow-y-auto h-[calc(100vh-250px)] space-y-4">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.id}
                            className="border rounded p-4 flex justify-between items-center hover:bg-gray-50"
                        >
                            <div className="flex-grow">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                    Size: {formatFileSize(file.metadata.size)} |
                                    Created: {formatDate(file.created_at)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(file.name)}
                                    className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDelete(file.name)}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
