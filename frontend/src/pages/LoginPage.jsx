import { LoginForm } from "../components/auth/LoginForm";
import { DecorativePanel } from "../components/auth/DecorativePanel";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      
      {/* Left side: form */}
      <div className="flex min-h-screen w-full lg:w-1/2">
        <LoginForm />
      </div>

      {/* Right side: decorative panel */}
      <div className="hidden lg:block lg:w-1/2">
        <DecorativePanel />
      </div>

    </div>
  );
}