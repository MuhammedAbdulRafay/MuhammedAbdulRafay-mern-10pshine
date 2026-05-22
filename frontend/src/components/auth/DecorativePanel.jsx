import { motion } from "framer-motion";

export function DecorativePanel() {
  return (
      <div className="relative hidden h-full w-full overflow-hidden lg:block">

      {/* Black to white gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-neutral-700" />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,rgba(255,255,255,0.18)_0%,transparent_60%)]" />

      {/* Full panel illustration */}
      <div className="absolute inset-0 flex items-end justify-center pb-12">
        <img
          src="/myartwork.png"
          alt="Illustration"
          className="h-[95%] w-[75%] translate-y-4 opacity-80"
        />
      </div>

      {/* Floating lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M80 200 Q200 100 400 250 T700 200"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />

        <motion.path
          d="M50 400 Q250 300 450 450 T800 350"
          fill="none"
          stroke="white"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        />

        <motion.path
          d="M100 550 Q300 480 500 580 T850 500"
          fill="none"
          stroke="white"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* Floating dots */}
      <div className="absolute inset-0">
        {[
          { top: "15%", left: "20%", delay: 0 },
          { top: "25%", left: "70%", delay: 0.3 },
          { top: "45%", left: "35%", delay: 0.6 },
          { top: "60%", left: "80%", delay: 0.9 },
          { top: "75%", left: "25%", delay: 1.2 },
          { top: "35%", left: "55%", delay: 1.5 },
          { top: "55%", left: "60%", delay: 0.2 },
          { top: "80%", left: "50%", delay: 0.8 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            style={{ top: dot.top, left: dot.left }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.5,
              delay: dot.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Top label */}
      <motion.div
        className="absolute left-8 top-8 flex items-center gap-2 text-white/60"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="h-px w-8 bg-white/20" />
        <span className="text-xs font-light tracking-[0.2em] uppercase">
          Notes reimagined
        </span>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        className="absolute bottom-8 right-8 text-right"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <p className="text-xs font-light tracking-wide text-white/40">
          Capture. Organize. Create.
        </p>
      </motion.div>
    </div>
  );
}