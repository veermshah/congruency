import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
    searchParams: Promise<Message>;
}) {
    const searchParams = await props.searchParams;
    return (
        <>
            <form className="flex flex-col w-full gap-2 ">
                <div>
                    <h1 className="text-4xl text-teal-400 font-bold text-center">
                        Reset Password
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
                </div>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    <SubmitButton formAction={forgotPasswordAction}>
                        Reset Password
                    </SubmitButton>
                    <FormMessage message={searchParams} />
                </div>
            </form>
        </>
    );
}
