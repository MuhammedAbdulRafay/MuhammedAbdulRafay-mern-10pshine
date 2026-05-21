import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { AuthLogo } from "./AuthLogo";
import { GoogleIcon } from "./GoogleIcon";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const payload = {
      username: fullName,   // ✅ FIXED mapping
      email,
      password,
    };

    await axios.post(
      "http://localhost:5000/api/auth/register",
      payload
    );

    // ✅ go to login after success
    navigate("/login");

  } catch (error) {
    console.log(error);

    alert(
      error?.response?.data?.message || "Signup failed. Please try again."
    );

  } finally {
    setIsLoading(false);
  }
};

  {/*const handleGoogleSignUp = () => {
    console.log("Google sign-up clicked");
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
          Create an account
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Get started with Draft today
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Full name
            </label>

            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all hover:border-foreground/20 focus:border-foreground"
                required
                autoComplete="name"
              />
            </div>
          </div>

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
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all hover:border-foreground/20 focus:border-foreground"
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
                placeholder="Create a password"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-all hover:border-foreground/20 focus:border-foreground"
                required
                minLength={8}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          {/* Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            whileTap={{ scale: 0.985 }}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Create account"
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
            onClick={handleGoogleSignUp}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary"
            whileTap={{ scale: 0.985 }}
          >
            <GoogleIcon className="h-4.5 w-4.5" />
            Sign up with Google
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
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}