import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLogo } from "./AuthLogo";
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
      const user = res.data.user;

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

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

  return (
    <div className="flex min-h-screen w-full flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
      <motion.div
        className="shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AuthLogo />
      </motion.div>

      <div className="flex flex-1 flex-col justify-center">
        <motion.div
          className="mx-auto w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex flex-col gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Please enter your details
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col gap-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

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
          </form>

          <p className="w-full text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-foreground underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
