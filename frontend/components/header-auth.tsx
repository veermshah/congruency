import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!hasEnvVars) {
        return (
            <>
                <div className="flex gap-4 items-center">
                    <div>
                        <Badge
                            variant={"default"}
                            className="font-normal pointer-events-none"
                        >
                            Please update .env.local file with anon key and url
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/sign-in">Sign ins</Link>
                        <Link href="/sign-up">Sign up</Link>
                    </div>
                </div>
            </>
        );
    }
    return user ? (
        <div className="flex items-center gap-6 text-2xl text-teal-400 font-bold">
            Hey, {user.email}!
            <form action={signOutAction}>
                <button
                    type="submit"
                    className="text-2xl hover:font-bold hover:text-teal-400 text-black duration-500"
                >
                    Sign Out
                </button>
            </form>
        </div>
    ) : (
        <div className="flex gap-8">
            <Link
                href="/sign-in"
                className="text-2xl hover:font-bold hover:text-teal-400 duration-500"
            >
                Login
            </Link>

            <Link
                href="/sign-up"
                className="text-2xl hover:font-bold hover:text-teal-400 duration-500"
            >
                Sign up
            </Link>
        </div>
    );
}
