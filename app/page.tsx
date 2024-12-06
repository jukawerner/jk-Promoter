import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export default async function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <LoginForm />
    </main>
  );
}