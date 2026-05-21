import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLogo } from "./AuthLogo";
import { GoogleIcon } from "./GoogleIcon";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email,
        password,
      }
    );

    const token = res.data.token;

    // Save token
    localStorage.setItem("token", token);

    // Redirect to dashboard
    navigate("/dashboard");

  } catch (error) {
    console.log(error);

    alert(
      error?.response?.data?.message || "Login failed. Please try again."
    );

  } finally {
    setIsLoading(false);
  }
};
``
  {/*const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
  };*/}

  return (
    <div className="flex min-h-screen w-full flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AuthLogo />
      </motion.div>

      {/* Form */}
      <motion.div
        className="mx-auto w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Please enter your details
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Email address
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 hover:border-foreground/20 focus:border-foreground focus:ring-1 focus:ring-foreground/10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 hover:border-foreground/20 focus:border-foreground focus:ring-1 focus:ring-foreground/10"
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="#"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-60"
            whileTap={{ scale: 0.985 }}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Sign in"
            )}
          </motion.button>

          {/* Divider */}
          {/*<div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>*/}

          {/* Google */}
          {/*<motion.button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary"
            whileTap={{ scale: 0.985 }}
          >
            <GoogleIcon className="h-4.5 w-4.5" />
            Sign in with Google
          </motion.button>*/}
        </form>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-bold text-foreground underline underline-offset-4"
        >
          Sign up
        </Link>
      </motion.p>
    </div>
  );
}