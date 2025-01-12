import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
    searchParams: Promise<Message>;
}) {
    const searchParams = await props.searchParams;
    if ("message" in searchParams) {
        return (
            <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <FormMessage message={searchParams} />
            </div>
        );
    }

    return (
        <>
            <form className="flex flex-col mx-auto">
                <h1 className="text-4xl text-teal-400 font-bold text-center">
                    Sign up
                </h1>
                <p className="mt-2 text-center text-xl text-gray-600">
                    Already have an account?{" "}
                    <Link
                        className="duration-500 text-teal-400 hover:font-bold"
                        href="/sign-in"
                    >
                        Login
                    </Link>
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    <Label htmlFor="password">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Your password"
                        minLength={6}
                        required
                    />
                    <SubmitButton
                        formAction={signUpAction}
                        pendingText="Signing up..."
                    >
                        Sign up
                    </SubmitButton>
                    <FormMessage message={searchParams} />
                </div>
            </form>
        </>
    );
}
