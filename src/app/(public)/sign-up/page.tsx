import { redirect } from "next/navigation";

export default async function SignUp() {
  return redirect("/sign-in");
}
