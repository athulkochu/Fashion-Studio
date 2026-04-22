import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLogin,
  useSignup,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";

const editorial = [
  {
    src: "/products/nocturne-velvet-gown.png",
    title: "Nocturne",
    caption: "Velvet that drinks the light",
  },
  {
    src: "/products/aurelia-satin-bias.png",
    title: "Aurélia",
    caption: "Champagne satin, true bias",
  },
  {
    src: "/products/sienna-silk-slip.png",
    title: "Sienna",
    caption: "Mulberry silk, candlelit",
  },
  {
    src: "/products/isolde-bridal-gown.png",
    title: "Isolde",
    caption: "Quiet, considered, modern",
  },
];

type Mode = "login" | "signup";

export default function Auth({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);

  const login = useLogin();
  const signup = useSignup();
  const submitting = login.isPending || signup.isPending;

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  useEffect(() => {
    const t = setInterval(
      () => setSlide((s) => (s + 1) % editorial.length),
      4500,
    );
    return () => clearInterval(t);
  }, []);

  const passwordStrength = useMemo(() => scorePassword(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        await signup.mutateAsync({ data: { email, password, name } });
      } else {
        await login.mutateAsync({ data: { email, password } });
      }
      await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Something went wrong";
      setError(msg);
    }
  }

  const current = editorial[slide];

  return (
    <div className="min-h-[calc(100vh-5rem)] grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Editorial side */}
      <div className="relative hidden lg:block overflow-hidden bg-[#1a1310]">
        <AnimatePresence mode="sync">
          <motion.img
            key={current.src}
            src={current.src}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-black/70" />

        {/* Floating script */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-full flex flex-col justify-between p-12 text-white"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4" strokeWidth={1.2} />
            <span className="text-xs uppercase tracking-[0.35em]">
              The Atelier
            </span>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3">
                  Now showing
                </p>
                <h2 className="font-serif text-5xl xl:text-6xl leading-[1.05] mb-3">
                  {current.title}
                </h2>
                <p className="text-white/75 italic font-serif text-lg max-w-sm">
                  &ldquo;{current.caption}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-8">
              {editorial.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`h-[2px] transition-all duration-500 ${
                    i === slide ? "w-10 bg-white" : "w-5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-6 py-16 sm:px-12">
        {/* Decorative ornament */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Mode toggle */}
          <div className="relative mb-10 inline-flex items-center rounded-full border border-border/60 bg-background/60 p-1 text-xs uppercase tracking-[0.2em]">
            <ToggleButton
              active={mode === "login"}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              Sign in
            </ToggleButton>
            <ToggleButton
              active={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
            >
              Create account
            </ToggleButton>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3 leading-tight">
                {mode === "login" ? (
                  <>
                    Welcome <em className="text-primary not-italic">back</em>.
                  </>
                ) : (
                  <>
                    Begin your <em className="text-primary not-italic">collection</em>.
                  </>
                )}
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {mode === "login"
                  ? "Sign in to revisit your favourites, track an order, and pick up where you left off."
                  : "Create an account to save the dresses that move you and keep an eye on what's new in the atelier."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <FloatingField
                    label="Your name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={setName}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FloatingField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              required
            />

            <div>
              <FloatingField
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={setPassword}
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                }
              />
              {mode === "signup" && password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength.score
                            ? passwordStrength.color
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-md px-4 py-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="group w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 px-6 rounded-full text-sm uppercase tracking-[0.25em] hover:bg-primary/90 transition disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              {mode === "login" ? (
                <>
                  New to Lumière?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-foreground underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-foreground underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground pt-6">
              <Link href="/" className="hover:text-foreground">
                ← Back to the boutique
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative px-5 py-2 rounded-full transition-colors"
    >
      {active && (
        <motion.span
          layoutId="auth-toggle-pill"
          className="absolute inset-0 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span
        className={`relative ${
          active ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

function FloatingField({
  label,
  value,
  onChange,
  type,
  autoComplete,
  required,
  trailing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  autoComplete?: string;
  required?: boolean;
  trailing?: React.ReactNode;
}) {
  const filled = value.length > 0;
  return (
    <label className="relative block">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="peer w-full bg-transparent border-0 border-b border-border focus:border-primary focus:outline-none focus:ring-0 px-0 pr-8 pt-6 pb-2 text-foreground placeholder-transparent transition-colors"
        placeholder={label}
      />
      <span
        className={`pointer-events-none absolute left-0 transition-all duration-200 ${
          filled
            ? "top-0 text-[10px] uppercase tracking-[0.25em] text-primary"
            : "top-6 text-base text-muted-foreground"
        } peer-focus:top-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.25em] peer-focus:text-primary`}
      >
        {label}
      </span>
      {trailing && (
        <span className="absolute right-0 bottom-2.5">{trailing}</span>
      )}
    </label>
  );
}

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  const palette = [
    "bg-destructive",
    "bg-amber-500",
    "bg-amber-400",
    "bg-emerald-500",
  ];
  const labels = ["Too short", "Getting there", "Good", "Strong"];
  const idx = Math.max(0, Math.min(score - 1, 3));
  return {
    score,
    color: palette[idx] ?? "bg-border",
    label: score === 0 ? "Too short" : labels[idx],
  };
}
