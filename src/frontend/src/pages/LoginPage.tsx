import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { storage } from "../data/storage";
import type { User } from "../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type View =
  | "login"
  | "super-admin-setup" // hidden: only auto-shown when no SA exists
  | "owner-signup"
  | "forgot-password"
  | "otp-verify"
  | "new-password";

// ─── Workflow Panel ───────────────────────────────────────────────────────────

const workflowSteps = [
  {
    label: "Onboarding",
    desc: "Register firm & add clients",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.13)",
    icon: "👤",
    num: 1,
  },
  {
    label: "Inward Docs",
    desc: "Track & update document receipt status",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.13)",
    icon: "📄",
    num: 2,
  },
  {
    label: "Processing",
    desc: "Update work progress: Pending or Completed",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.13)",
    icon: "⚙️",
    num: 3,
  },
  {
    label: "Filing Status",
    desc: "Track ITR Filing and E-Verification",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.13)",
    icon: "🗂️",
    num: 4,
  },
  {
    label: "Handover",
    desc: "Final documents ready & Invoicing",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.13)",
    icon: "🖨️",
    num: 5,
  },
];

function WorkflowPanel() {
  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-4">
      <p
        className="text-xs tracking-widest uppercase font-semibold mb-4 text-center"
        style={{ color: "#c9a44c" }}
      >
        Your ITR Journey
      </p>

      <div className="relative flex flex-col items-center w-full max-w-xs">
        {workflowSteps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center w-full">
            <div
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5"
              style={{
                background: step.bg,
                border: `1.5px solid ${step.color}`,
              }}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
                style={{
                  background: `${step.color}22`,
                  border: `2px solid ${step.color}`,
                  color: step.color,
                  boxShadow: `0 0 8px ${step.color}44`,
                }}
              >
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: step.color,
                      color: "#fff",
                      fontSize: 9,
                    }}
                  >
                    {step.num}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {step.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>

            {i < workflowSteps.length - 1 && (
              <div className="flex flex-col items-center py-0.5">
                <div
                  style={{ width: 2, height: 10, background: "#c9a44c55" }}
                />
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "7px solid #c9a44c88",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidMobile(v: string): boolean {
  return /^\d{10}$/.test(v);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

// ─── Inline error component ───────────────────────────────────────────────────

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
      {msg}
    </p>
  );
}

// ─── Form wrapper — defined OUTSIDE LoginPage to prevent remount on every render ─
// If FormWrapper were defined inside LoginPage, React would see a new function
// identity on each state update, unmount all child inputs, and kill focus.

function FormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-6">
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<View>("login");

  // Detect if we are on the admin portal URL (hash = #/admin)
  const [isAdminPortal, setIsAdminPortal] = useState(
    () => window.location.hash === "#/admin",
  );

  useEffect(() => {
    function onHashChange() {
      setIsAdminPortal(window.location.hash === "#/admin");
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Super admin setup fields (hidden from owners)
  const [saEmail, setSaEmail] = useState("");
  const [saMobile, setSaMobile] = useState("");
  const [saPassword, setSaPassword] = useState("");
  const [saConfirm, setSaConfirm] = useState("");
  const [saError, setSaError] = useState("");
  const [saEmailError, setSaEmailError] = useState("");
  const [saMobileError, setSaMobileError] = useState("");

  // Owner signup fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerFirm, setOwnerFirm] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerConfirm, setOwnerConfirm] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [ownerEmailError, setOwnerEmailError] = useState("");
  const [ownerMobileError, setOwnerMobileError] = useState("");

  // Forgot password / OTP flow
  const [fpEmail, setFpEmail] = useState("");
  const [fpEmailError, setFpEmailError] = useState("");
  const [fpError, setFpError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [otpUserEmail, setOtpUserEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if Super Admin exists on mount.
  // If not, silently redirect to the hidden SA setup view.
  // Owners never see any reference to this -- the setup page has no links back visible.
  useEffect(() => {
    const users = storage.getUsers();
    const hasSuperAdmin = users.some((u) => u.role === "Super Admin");
    if (!hasSuperAdmin && !storage.isSuperAdminCreated()) {
      setView("super-admin-setup");
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resendCountdown]);

  function generateAndStoreOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    setGeneratedOtp(otp);
    setOtpExpiry(expiry);
    setResendCountdown(30);
    return otp;
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      const users = storage.getUsers();
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === loginEmail.toLowerCase() &&
          u.password === loginPassword,
      );
      if (user) {
        if (user.isActive === false) {
          setLoginError(
            "Your account has been deactivated. Contact the administrator.",
          );
          setLoginLoading(false);
          return;
        }
        // On admin portal, only allow Super Admin login
        if (isAdminPortal && user.role !== "Super Admin") {
          setLoginError(
            "This portal is for administrators only. Use the firm login page.",
          );
          setLoginLoading(false);
          return;
        }
        // On owner portal, block Super Admin login
        if (!isAdminPortal && user.role === "Super Admin") {
          setLoginError("Please use the Administrator Portal to sign in.");
          setLoginLoading(false);
          return;
        }
        storage.setCurrentUser(user);
        onLogin(user);
      } else {
        setLoginError("Invalid email or password.");
      }
      setLoginLoading(false);
    }, 300);
  }

  function handleSuperAdminSetup(e: React.FormEvent) {
    e.preventDefault();
    setSaError("");
    let hasErr = false;
    if (!saEmail.trim() || !isValidEmail(saEmail)) {
      setSaEmailError("Please enter a valid email address.");
      hasErr = true;
    } else {
      setSaEmailError("");
    }
    if (!isValidMobile(saMobile)) {
      setSaMobileError("Mobile must be exactly 10 digits.");
      hasErr = true;
    } else {
      setSaMobileError("");
    }
    if (!saPassword || saPassword.length < 6) {
      setSaError("Password must be at least 6 characters.");
      hasErr = true;
    } else if (saPassword !== saConfirm) {
      setSaError("Passwords do not match.");
      hasErr = true;
    }
    if (hasErr) return;

    const existingUsers = storage.getUsers();
    const alreadyHasSA = existingUsers.some((u) => u.role === "Super Admin");
    if (alreadyHasSA) {
      setView("login");
      return;
    }

    const superAdmin: User = {
      id: storage.uid(),
      email: saEmail.trim(),
      password: saPassword,
      name: "Admin",
      mobile: saMobile.trim(),
      role: "Super Admin",
      isActive: true,
    };
    storage.saveUsers([superAdmin]);
    storage.markSuperAdminCreated();
    storage.setCurrentUser(superAdmin);
    onLogin(superAdmin);
  }

  function handleOwnerSignup(e: React.FormEvent) {
    e.preventDefault();
    setOwnerError("");
    let hasErr = false;

    if (!ownerName.trim()) {
      setOwnerError("Owner name is required.");
      hasErr = true;
    }
    if (!ownerFirm.trim()) {
      setOwnerError("Firm name is required.");
      hasErr = true;
    }
    if (!ownerEmail.trim() || !isValidEmail(ownerEmail)) {
      setOwnerEmailError("Please enter a valid email address.");
      hasErr = true;
    } else {
      setOwnerEmailError("");
    }
    if (!isValidMobile(ownerMobile)) {
      setOwnerMobileError("Mobile must be exactly 10 digits.");
      hasErr = true;
    } else {
      setOwnerMobileError("");
    }
    if (!ownerPassword || ownerPassword.length < 6) {
      setOwnerError("Password must be at least 6 characters.");
      hasErr = true;
    } else if (ownerPassword !== ownerConfirm) {
      setOwnerError("Passwords do not match.");
      hasErr = true;
    }
    if (hasErr) return;

    // Check Super Admin exists
    const users = storage.getUsers();
    const hasSuperAdmin = users.some((u) => u.role === "Super Admin");
    if (!hasSuperAdmin) {
      setOwnerError(
        "System setup is not complete. Please contact the administrator.",
      );
      return;
    }

    // Check email uniqueness
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === ownerEmail.trim().toLowerCase(),
    );
    if (emailExists) {
      setOwnerEmailError("An account with this email already exists.");
      return;
    }

    const newOwner: User = {
      id: storage.uid(),
      email: ownerEmail.trim(),
      password: ownerPassword,
      name: ownerName.trim(),
      mobile: ownerMobile.trim(),
      role: "Owner",
      isActive: true,
      accessType: "Trial",
    };
    storage.saveUsers([...users, newOwner]);
    storage.setCurrentUser(newOwner);
    onLogin(newOwner);
  }

  function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFpError("");
    if (!fpEmail.trim() || !isValidEmail(fpEmail)) {
      setFpEmailError("Please enter a valid email address.");
      return;
    }
    setFpEmailError("");
    const users = storage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === fpEmail.trim().toLowerCase(),
    );
    if (!user) {
      setFpError("No account found with this email address.");
      return;
    }
    setOtpUserEmail(fpEmail.trim().toLowerCase());
    generateAndStoreOtp();
    setView("otp-verify");
  }

  function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    if (Date.now() > otpExpiry) {
      setOtpError("OTP expired. Please request a new one.");
      return;
    }
    if (otpInput.trim() !== generatedOtp) {
      setOtpError("Incorrect OTP. Please try again.");
      return;
    }
    setView("new-password");
  }

  function handleResendOtp() {
    generateAndStoreOtp();
    setOtpInput("");
    setOtpError("");
  }

  function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setNewPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setNewPasswordError("Passwords do not match.");
      return;
    }
    const users = storage.getUsers();
    const updated = users.map((u) =>
      u.email.toLowerCase() === otpUserEmail
        ? { ...u, password: newPassword }
        : u,
    );
    storage.saveUsers(updated);
    setResetSuccess("Password updated successfully!");
    setTimeout(() => {
      setView("login");
      setLoginEmail(otpUserEmail);
      setLoginPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setNewPasswordError("");
      setResetSuccess("");
      setOtpInput("");
      setOtpUserEmail("");
    }, 1500);
  }

  // ─── Navigation helper ────────────────────────────────────────────────────────

  function goToLogin() {
    setView("login");
    setLoginError("");
    setFpEmail("");
    setFpError("");
    setFpEmailError("");
    setOtpInput("");
    setOtpError("");
  }

  // ─── Login form ───────────────────────────────────────────────────────────────

  const loginFormContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
            style={{ background: "#7a1f2b", color: "#c9a44c" }}
          >
            {isAdminPortal ? "🛡️" : "🏢"}
          </div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {isAdminPortal ? "Administrator Portal" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdminPortal
              ? "TaxCore system administration"
              : "Sign in to continue to TaxCore"}
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label
              htmlFor="login-email"
              className="text-sm font-semibold text-gray-700"
            >
              Email Address
            </Label>
            <Input
              id="login-email"
              data-ocid="login.input"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onBlur={() => {
                if (loginEmail && !isValidEmail(loginEmail))
                  setLoginError("Please enter a valid email address.");
                else if (loginError === "Please enter a valid email address.")
                  setLoginError("");
              }}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="mt-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="login-password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </Label>
              <button
                type="button"
                className="text-xs font-medium underline"
                style={{ color: "#7a1f2b" }}
                data-ocid="login.link"
                onClick={() => {
                  setLoginError("");
                  setFpEmail("");
                  setFpError("");
                  setFpEmailError("");
                  setView("forgot-password");
                }}
              >
                Forgot Password?
              </button>
            </div>
            <Input
              id="login-password"
              data-ocid="login.password_input"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {loginError && (
            <div
              data-ocid="login.error_state"
              className="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p className="text-red-700 text-sm">{loginError}</p>
            </div>
          )}
          <Button
            type="submit"
            data-ocid="login.submit_button"
            disabled={loginLoading}
            className="w-full text-white font-semibold h-11 text-base"
            style={{ background: "#7a1f2b" }}
          >
            {loginLoading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        {/* Only show signup link on owner/staff portal, not admin portal */}
        {!isAdminPortal && (
          <div className="mt-4 text-center">
            <button
              type="button"
              data-ocid="owner-signup.link"
              className="text-xs font-medium underline"
              style={{ color: "#c9a44c" }}
              onClick={() => {
                setOwnerError("");
                setOwnerEmailError("");
                setOwnerMobileError("");
                setOwnerName("");
                setOwnerFirm("");
                setOwnerEmail("");
                setOwnerMobile("");
                setOwnerPassword("");
                setOwnerConfirm("");
                setView("owner-signup");
              }}
            >
              New firm? Create Owner Account →
            </button>
          </div>
        )}
      </div>
    </FormWrapper>
  );

  // ─── Super Admin setup form (hidden -- only auto-shown on first run) ──────────
  // This form is NEVER linked from the regular login page.
  // It only appears programmatically when no Super Admin account exists.
  // No "Super Admin" wording is shown to the end user.

  const superAdminSetupContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
            style={{ background: "#7a1f2b", color: "#c9a44c" }}
          >
            🛡
          </div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            System Setup
          </h2>
          <p className="text-sm text-gray-500">
            Initial configuration. Set your administrator credentials.
          </p>
        </div>
        <form onSubmit={handleSuperAdminSetup} className="space-y-3">
          <div>
            <Label
              htmlFor="sa-email"
              className="text-sm font-semibold text-gray-700"
            >
              Email Address *
            </Label>
            <Input
              id="sa-email"
              data-ocid="super-admin-signup.input"
              type="email"
              value={saEmail}
              onChange={(e) => {
                setSaEmail(e.target.value);
                if (saEmailError && isValidEmail(e.target.value))
                  setSaEmailError("");
              }}
              onBlur={() => {
                if (saEmail && !isValidEmail(saEmail))
                  setSaEmailError("Please enter a valid email address.");
              }}
              placeholder="admin@yourdomain.com"
              autoComplete="email"
              required
              className="mt-1"
            />
            <FieldError msg={saEmailError} />
          </div>
          <div>
            <Label
              htmlFor="sa-mobile"
              className="text-sm font-semibold text-gray-700"
            >
              Mobile Number *
            </Label>
            <Input
              id="sa-mobile"
              data-ocid="super-admin-signup.mobile_input"
              type="tel"
              inputMode="numeric"
              value={saMobile}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setSaMobile(digits);
                if (digits.length > 0 && !isValidMobile(digits))
                  setSaMobileError("Mobile must be exactly 10 digits.");
                else setSaMobileError("");
              }}
              placeholder="10-digit mobile"
              maxLength={10}
              required
              className="mt-1"
            />
            <FieldError msg={saMobileError} />
          </div>
          <div>
            <Label
              htmlFor="sa-password"
              className="text-sm font-semibold text-gray-700"
            >
              Password *
            </Label>
            <Input
              id="sa-password"
              data-ocid="super-admin-signup.password_input"
              type="password"
              value={saPassword}
              onChange={(e) => setSaPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="sa-confirm"
              className="text-sm font-semibold text-gray-700"
            >
              Confirm Password *
            </Label>
            <Input
              id="sa-confirm"
              data-ocid="super-admin-signup.confirm_input"
              type="password"
              value={saConfirm}
              onChange={(e) => setSaConfirm(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
              className="mt-1"
            />
          </div>
          {saError && (
            <div
              data-ocid="super-admin-signup.error_state"
              className="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p className="text-red-700 text-sm">{saError}</p>
            </div>
          )}
          <Button
            type="submit"
            data-ocid="super-admin-signup.submit_button"
            className="w-full text-white font-semibold h-11 text-base"
            style={{ background: "#7a1f2b" }}
          >
            Complete Setup
          </Button>
        </form>
      </div>
    </FormWrapper>
  );

  // ─── Owner signup form ────────────────────────────────────────────────────────

  const ownerSignupContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
            style={{ background: "#7a1f2b", color: "#c9a44c" }}
          >
            🏢
          </div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Create Owner Account
          </h2>
          <p className="text-sm text-gray-500">Register your firm on TaxCore</p>
        </div>
        <form onSubmit={handleOwnerSignup} className="space-y-2">
          <div>
            <Label
              htmlFor="ow-name"
              className="text-sm font-semibold text-gray-700"
            >
              Owner Name *
            </Label>
            <Input
              id="ow-name"
              data-ocid="owner-signup.name_input"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="ow-firm"
              className="text-sm font-semibold text-gray-700"
            >
              Firm Name *
            </Label>
            <Input
              id="ow-firm"
              data-ocid="owner-signup.firm_input"
              type="text"
              value={ownerFirm}
              onChange={(e) => setOwnerFirm(e.target.value)}
              placeholder="Your CA firm name"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="ow-email"
              className="text-sm font-semibold text-gray-700"
            >
              Email Address *
            </Label>
            <Input
              id="ow-email"
              data-ocid="owner-signup.email_input"
              type="email"
              value={ownerEmail}
              onChange={(e) => {
                setOwnerEmail(e.target.value);
                if (ownerEmailError && isValidEmail(e.target.value))
                  setOwnerEmailError("");
              }}
              onBlur={() => {
                if (ownerEmail && !isValidEmail(ownerEmail))
                  setOwnerEmailError("Please enter a valid email address.");
              }}
              placeholder="owner@firm.com"
              autoComplete="email"
              required
              className="mt-1"
            />
            <FieldError msg={ownerEmailError} />
          </div>
          <div>
            <Label
              htmlFor="ow-mobile"
              className="text-sm font-semibold text-gray-700"
            >
              Mobile Number *
            </Label>
            <Input
              id="ow-mobile"
              data-ocid="owner-signup.mobile_input"
              type="tel"
              inputMode="numeric"
              value={ownerMobile}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setOwnerMobile(digits);
                if (digits.length > 0 && !isValidMobile(digits))
                  setOwnerMobileError("Mobile must be exactly 10 digits.");
                else setOwnerMobileError("");
              }}
              placeholder="10-digit mobile"
              maxLength={10}
              required
              className="mt-1"
            />
            <FieldError msg={ownerMobileError} />
          </div>
          <div>
            <Label
              htmlFor="ow-password"
              className="text-sm font-semibold text-gray-700"
            >
              Password *
            </Label>
            <Input
              id="ow-password"
              data-ocid="owner-signup.password_input"
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="ow-confirm"
              className="text-sm font-semibold text-gray-700"
            >
              Confirm Password *
            </Label>
            <Input
              id="ow-confirm"
              data-ocid="owner-signup.confirm_input"
              type="password"
              value={ownerConfirm}
              onChange={(e) => setOwnerConfirm(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
              className="mt-1"
            />
          </div>
          {ownerError && (
            <div
              data-ocid="owner-signup.error_state"
              className="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p className="text-red-700 text-sm">{ownerError}</p>
            </div>
          )}
          <Button
            type="submit"
            data-ocid="owner-signup.submit_button"
            className="w-full text-white font-semibold h-11 text-base"
            style={{ background: "#7a1f2b" }}
          >
            Create Owner Account
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Already have an account?{" "}
          <button
            type="button"
            className="underline text-gray-600 font-medium"
            onClick={goToLogin}
          >
            Sign in
          </button>
        </p>
      </div>
    </FormWrapper>
  );

  // ─── Forgot password – Step 1: Email entry ───────────────────────────────────

  const forgotFormContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter your registered email to receive an OTP.
          </p>
        </div>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="fp-email"
              className="text-sm font-semibold text-gray-700"
            >
              Email Address
            </Label>
            <Input
              id="fp-email"
              data-ocid="forgot-password.input"
              type="email"
              value={fpEmail}
              onChange={(e) => {
                setFpEmail(e.target.value);
                if (fpEmailError && isValidEmail(e.target.value))
                  setFpEmailError("");
              }}
              onBlur={() => {
                if (fpEmail && !isValidEmail(fpEmail))
                  setFpEmailError("Please enter a valid email address.");
              }}
              placeholder="your@email.com"
              autoComplete="email"
              required
              className="mt-1.5"
            />
            <FieldError msg={fpEmailError} />
          </div>
          {fpError && (
            <div
              data-ocid="forgot-password.error_state"
              className="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p className="text-red-700 text-sm">{fpError}</p>
            </div>
          )}
          <Button
            type="submit"
            data-ocid="forgot-password.submit_button"
            className="w-full text-white font-semibold h-11"
            style={{ background: "#7a1f2b" }}
          >
            Send OTP
          </Button>
          <button
            type="button"
            data-ocid="forgot-password.cancel_button"
            className="w-full text-sm text-gray-500 underline"
            onClick={goToLogin}
          >
            Back to Login
          </button>
        </form>
      </div>
    </FormWrapper>
  );

  // ─── Forgot password – Step 2: OTP verification ──────────────────────────────

  const otpVerifyContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Verify OTP
          </h2>
          <p className="text-sm text-gray-500">
            Enter the 6-digit OTP for{" "}
            <span className="font-semibold" style={{ color: "#7a1f2b" }}>
              {maskEmail(otpUserEmail)}
            </span>
          </p>
        </div>

        {/* OTP display box */}
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{
            background: "rgba(201,164,76,0.12)",
            border: "1.5px solid #c9a44c",
          }}
        >
          <p className="text-xs text-gray-500 mb-1">
            🔐 Your OTP Code (demo — in production this is sent to your
            registered email/mobile):
          </p>
          <p
            className="text-3xl font-bold tracking-[0.3em]"
            style={{ color: "#7a1f2b" }}
          >
            {generatedOtp}
          </p>
          <p className="text-xs text-gray-400 mt-1">Valid for 5 minutes</p>
        </div>

        <form onSubmit={handleOtpVerify} className="space-y-4">
          <div>
            <Label
              htmlFor="otp-input"
              className="text-sm font-semibold text-gray-700"
            >
              Enter OTP
            </Label>
            <Input
              id="otp-input"
              data-ocid="otp-verify.input"
              type="tel"
              inputMode="numeric"
              value={otpInput}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtpInput(digits);
                if (otpError) setOtpError("");
              }}
              placeholder="6-digit OTP"
              maxLength={6}
              required
              className="mt-1.5 text-center tracking-widest text-lg font-bold"
            />
            {otpError && (
              <div
                data-ocid="otp-verify.error_state"
                className="p-2 rounded-lg bg-red-50 border border-red-200 mt-2"
              >
                <p className="text-red-700 text-sm">{otpError}</p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            data-ocid="otp-verify.submit_button"
            className="w-full text-white font-semibold h-11"
            style={{ background: "#7a1f2b" }}
          >
            Verify OTP →
          </Button>
        </form>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            data-ocid="otp-verify.cancel_button"
            className="text-sm text-gray-500 underline"
            onClick={() => {
              setView("forgot-password");
              setOtpInput("");
              setOtpError("");
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            data-ocid="otp-verify.button"
            disabled={resendCountdown > 0}
            className="text-sm font-medium underline disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#c9a44c" }}
            onClick={handleResendOtp}
          >
            {resendCountdown > 0
              ? `Resend OTP (${resendCountdown}s)`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </FormWrapper>
  );

  // ─── Forgot password – Step 3: Set new password ──────────────────────────────

  const newPasswordContent = (
    <FormWrapper>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h2
            className="text-2xl font-bold mb-1"
            style={{
              color: "#7a1f2b",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Set New Password
          </h2>
          <p className="text-sm text-gray-500">
            Choose a new password for your account.
          </p>
        </div>
        {resetSuccess ? (
          <div
            data-ocid="new-password.success_state"
            className="p-4 rounded-lg text-sm text-green-800 bg-green-50 border border-green-200 text-center"
          >
            ✅ {resetSuccess} Redirecting to login…
          </div>
        ) : (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <Label
                htmlFor="new-password"
                className="text-sm font-semibold text-gray-700"
              >
                New Password
              </Label>
              <Input
                id="new-password"
                data-ocid="new-password.input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label
                htmlFor="new-password-confirm"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm New Password
              </Label>
              <Input
                id="new-password-confirm"
                data-ocid="new-password.confirm_input"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                required
                className="mt-1.5"
              />
            </div>
            {newPasswordError && (
              <div
                data-ocid="new-password.error_state"
                className="p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <p className="text-red-700 text-sm">{newPasswordError}</p>
              </div>
            )}
            <Button
              type="submit"
              data-ocid="new-password.submit_button"
              className="w-full text-white font-semibold h-11"
              style={{ background: "#7a1f2b" }}
            >
              Update Password
            </Button>
            <button
              type="button"
              className="w-full text-sm text-gray-500 underline"
              onClick={goToLogin}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </FormWrapper>
  );

  // ─── Active form selector ─────────────────────────────────────────────────────

  const activeForm =
    view === "super-admin-setup"
      ? superAdminSetupContent
      : view === "owner-signup"
        ? ownerSignupContent
        : view === "forgot-password"
          ? forgotFormContent
          : view === "otp-verify"
            ? otpVerifyContent
            : view === "new-password"
              ? newPasswordContent
              : loginFormContent;

  // ─── Page layout ──────────────────────────────────────────────────────────────

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#FAF7F2" }}
    >
      {/* ── Top Header ── */}
      <header
        className="w-full flex flex-col items-center justify-center py-4 flex-shrink-0"
        style={{
          borderBottom: "2px solid #c9a44c",
          background: "#FAF7F2",
        }}
      >
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          TaxCore
        </h1>
        <p
          className="text-xs tracking-widest uppercase mt-0.5"
          style={{ color: "#c9a44c", letterSpacing: "0.18em" }}
        >
          ITR Workflow &amp; Status Tracker
        </p>
        {isAdminPortal && (
          <span
            className="mt-1 text-xs px-2 py-0.5 rounded font-semibold tracking-wide"
            style={{
              background: "rgba(122,31,43,0.1)",
              color: "#7a1f2b",
              border: "1px solid rgba(122,31,43,0.25)",
            }}
          >
            ADMINISTRATOR PORTAL
          </span>
        )}
      </header>

      {/* ── Main two-column body ── */}
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left: Workflow Flowchart */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <WorkflowPanel />
        </div>

        {/* Gold divider */}
        <div
          className="hidden md:block flex-shrink-0"
          style={{
            width: 2,
            background:
              "linear-gradient(to bottom, transparent, #c9a44c 15%, #c9a44c 85%, transparent)",
          }}
        />

        {/* Right: Form — overflow-y-auto so all inputs are reachable on short screens */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          {activeForm}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full py-3 flex flex-col items-center flex-shrink-0"
        style={{
          borderTop: "1px solid rgba(201,164,76,0.35)",
          background: "#FAF7F2",
        }}
      >
        <p
          className="text-sm font-semibold tracking-wide text-center"
          style={{ color: "#7a1f2b" }}
        >
          A complete workflow tool for tax professionals
        </p>
        <p className="text-xs text-gray-400 mt-0.5 text-center">
          Secure &bull; Multi-tenant &bull; Role-based access
        </p>
      </footer>
    </div>
  );
}
