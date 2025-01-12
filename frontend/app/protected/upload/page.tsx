"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & EventTarget & { files: FileList };
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleFileChange = (e: FileChangeEvent) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage("");

            if (
                selectedFile.type === "application/pdf" ||
                selectedFile.type.startsWith("image/")
            ) {
                const objectUrl = URL.createObjectURL(selectedFile);
                setPreview(objectUrl);
            } else {
                setPreview(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file to upload");
            return;
        }

        try {
            setUploading(true);
            setMessage("");

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) {
                router.push("/sign-in");
                return;
            }

            const filePath = `${user.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("contracts")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setMessage("File uploaded successfully!");
            setFile(null);
            setPreview(null);
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                (fileInput as HTMLInputElement).value = "";
            }
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message || "Error uploading file");
            } else {
                setMessage("Error uploading file");
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 top-16 flex">
            {/* Left side - Upload controls */}
            <div className="w-1/2 p-8">
                <div className="text-4xl text-teal-400 font-bold mb-8">
                    Upload Contract
                </div>

                <div className="space-y-6">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        disabled={uploading}
                        className="block w-full"
                    />

                    {file && (
                        <div className="space-y-2">
                            <p className="font-medium">File Details:</p>
                            <p className="text-sm text-gray-600">
                                Name: {file.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                Size: {formatFileSize(file.size)}
                            </p>
                            <p className="text-sm text-gray-600">
                                Type: {file.type || "Unknown"}
                            </p>
                        </div>
                    )}
                    <div className="space-y-4 flex flex-col">
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="px-4 py-2 bg-teal-400 text-white font-bold rounded w-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:scale-105 active:scale-90 duration-100"
                        >
                            {uploading ? "Uploading..." : "Upload File"}
                        </button>
                        <Link
                            href="/protected/view"
                            className="rounded bg-teal-400 text-white font-bold px-3 py-2 w-full text-center hover:scale-105 active:scale-90 duration-100"
                        >
                            View Your Documents
                        </Link>
                    </div>

                    {message && (
                        <p className="text-sm p-4 bg-gray-50 rounded">
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* Right side - Preview */}
            <div className="w-1/2 border-l">
                {file && preview ? (
                    file.type === "application/pdf" ? (
                        <iframe
                            src={preview}
                            className="w-full h-full"
                            title="PDF preview"
                        />
                    ) : file.type.startsWith("image/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ) : null
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        No preview available
                    </div>
                )}
            </div>
        </div>
    );
}
