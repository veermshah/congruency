import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { IoCloudUploadSharp } from "react-icons/io5";
import { RiAiGenerate } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log("User Details:", JSON.stringify(user, null, 2));

    if (!user) {
        return redirect("/sign-in");
    }
    // User Details: JSON.stringify(user, null, 2)

    return (
        <div className="absolute left-0 top-20">
            <div className="mt-5 mx-16">
                <div className="text-4xl text-teal-400 font-bold mb-5">
                    Contracts
                </div>
                <div className="flex items-center gap-16">
                    <Link
                        href="/protected/upload"
                        className="flex items-center gap-3 text-2xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-2xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <IoCloudUploadSharp size={40} />
                        Upload
                    </Link>
                    <Link
                        href="/protected/ai"
                        className="flex items-center gap-3 text-2xl rounded-3xl hover:text-teal-400 border-black border-1 shadow-2xl px-8 py-5 hover:scale-105 active:scale-90 duration-500 cursor-pointer"
                    >
                        <RiAiGenerate size={40} />
                        Create with AI
                    </Link>
                </div>
            </div>
        </div>
    );
}
