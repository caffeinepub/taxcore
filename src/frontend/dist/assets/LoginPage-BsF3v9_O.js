import { r as reactExports, w as whenInitialized, s as storage, j as jsxRuntimeExports, L as Label, I as Input, B as Button, E as EyeOff, a as Eye } from "./index-dGz7Cl66.js";
const workflowSteps = [
  {
    label: "Onboarding",
    desc: "Register firm & add clients",
    color: "#7A6FD4",
    bg: "#EEF0F8",
    icon: "👤",
    num: 1
  },
  {
    label: "Inward Docs",
    desc: "Track & update document receipt status",
    color: "#4A8FD4",
    bg: "#EBF2FA",
    icon: "📄",
    num: 2
  },
  {
    label: "Processing",
    desc: "Update work progress: Pending or Completed",
    color: "#D4920A",
    bg: "#FEF5E8",
    icon: "⚙️",
    num: 3
  },
  {
    label: "Filing Status",
    desc: "Track ITR Filing and E-Verification",
    color: "#D44070",
    bg: "#FDF0F5",
    icon: "🗂️",
    num: 4
  },
  {
    label: "Handover",
    desc: "Final documents ready & Invoicing",
    color: "#3A9A3A",
    bg: "#EEF8EE",
    icon: "🖨️",
    num: 5
  }
];
function WorkflowPanel() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center w-full px-6 py-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs tracking-widest uppercase font-semibold mb-4 text-center",
        style: { color: "#c9a44c" },
        children: "Your ITR Journey"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex flex-col items-center w-full max-w-xs", children: workflowSteps.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-3 w-full rounded-xl px-3 py-2.5",
          style: {
            background: step.bg,
            border: `1.5px solid ${step.color}44`
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold",
                style: {
                  background: step.color,
                  color: "#fff"
                },
                children: step.num
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-sm font-bold",
                  style: { color: "#2a2a2a" },
                  children: step.label
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs mt-0.5 leading-tight",
                  style: { color: "#777" },
                  children: step.desc
                }
              )
            ] })
          ]
        }
      ),
      i < workflowSteps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: { width: 2, height: 10, background: "#c9a44c55" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "7px solid #c9a44c88"
            }
          }
        )
      ] })
    ] }, step.label)) })
  ] });
}
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidMobile(v) {
  return /^\d{10}$/.test(v);
}
function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}
function FieldError({ msg }) {
  if (!msg) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", style: { color: "#c0392b" }, children: msg });
}
function FormWrapper({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center justify-center min-h-full w-full px-6 py-6", children });
}
function LoginPage({ onLogin }) {
  const [view, setView] = reactExports.useState("login");
  const [urlAdminPortal, setUrlAdminPortal] = reactExports.useState(
    () => window.location.hash === "#/admin"
  );
  const [manualAdminMode, setManualAdminMode] = reactExports.useState(false);
  const isAdminPortal = urlAdminPortal || manualAdminMode;
  reactExports.useEffect(() => {
    function onHashChange() {
      setUrlAdminPortal(window.location.hash === "#/admin");
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const [loginEmail, setLoginEmail] = reactExports.useState("");
  const [loginPassword, setLoginPassword] = reactExports.useState("");
  const [loginError, setLoginError] = reactExports.useState("");
  const [loginLoading, setLoginLoading] = reactExports.useState(false);
  const [saEmail, setSaEmail] = reactExports.useState("");
  const [saMobile, setSaMobile] = reactExports.useState("");
  const [saPassword, setSaPassword] = reactExports.useState("");
  const [saConfirm, setSaConfirm] = reactExports.useState("");
  const [saError, setSaError] = reactExports.useState("");
  const [saEmailError, setSaEmailError] = reactExports.useState("");
  const [saMobileError, setSaMobileError] = reactExports.useState("");
  const [ownerName, setOwnerName] = reactExports.useState("");
  const [ownerFirm, setOwnerFirm] = reactExports.useState("");
  const [ownerEmail, setOwnerEmail] = reactExports.useState("");
  const [ownerMobile, setOwnerMobile] = reactExports.useState("");
  const [ownerPassword, setOwnerPassword] = reactExports.useState("");
  const [ownerConfirm, setOwnerConfirm] = reactExports.useState("");
  const [ownerError, setOwnerError] = reactExports.useState("");
  const [ownerEmailError, setOwnerEmailError] = reactExports.useState("");
  const [ownerMobileError, setOwnerMobileError] = reactExports.useState("");
  const [fpEmail, setFpEmail] = reactExports.useState("");
  const [fpEmailError, setFpEmailError] = reactExports.useState("");
  const [fpError, setFpError] = reactExports.useState("");
  const [generatedOtp, setGeneratedOtp] = reactExports.useState("");
  const [otpExpiry, setOtpExpiry] = reactExports.useState(0);
  const [otpUserEmail, setOtpUserEmail] = reactExports.useState("");
  const [otpInput, setOtpInput] = reactExports.useState("");
  const [otpError, setOtpError] = reactExports.useState("");
  const [resendCountdown, setResendCountdown] = reactExports.useState(0);
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = reactExports.useState("");
  const [newPasswordError, setNewPasswordError] = reactExports.useState("");
  const [resetSuccess, setResetSuccess] = reactExports.useState("");
  const [showLoginPw, setShowLoginPw] = reactExports.useState(false);
  const [showSaPw, setShowSaPw] = reactExports.useState(false);
  const [showSaConfirmPw, setShowSaConfirmPw] = reactExports.useState(false);
  const [showOwnerPw, setShowOwnerPw] = reactExports.useState(false);
  const [showOwnerConfirmPw, setShowOwnerConfirmPw] = reactExports.useState(false);
  const [showNewPw, setShowNewPw] = reactExports.useState(false);
  const [showNewConfirmPw, setShowNewConfirmPw] = reactExports.useState(false);
  const countdownRef = reactExports.useRef(null);
  const [checkingAdmin, setCheckingAdmin] = reactExports.useState(true);
  reactExports.useEffect(() => {
    whenInitialized().then(() => {
      const users = storage.getUsers();
      const hasSuperAdmin = users.some((u) => u.role === "Super Admin");
      if (!hasSuperAdmin && !storage.isSuperAdminCreated()) {
        setView("super-admin-setup");
      }
      setCheckingAdmin(false);
    }).catch(() => {
      setCheckingAdmin(false);
    });
  }, []);
  reactExports.useEffect(() => {
    if (resendCountdown <= 0) return;
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resendCountdown]);
  function generateAndStoreOtp() {
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiry = Date.now() + 5 * 60 * 1e3;
    setGeneratedOtp(otp);
    setOtpExpiry(expiry);
    setResendCountdown(30);
    return otp;
  }
  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      const users = storage.getUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
      );
      if (user) {
        if (user.isActive === false) {
          setLoginError(
            "Your account has been deactivated. Contact the administrator."
          );
          setLoginLoading(false);
          return;
        }
        if (isAdminPortal && user.role !== "Super Admin") {
          setLoginError(
            "This portal is for administrators only. Use the firm login page."
          );
          setLoginLoading(false);
          return;
        }
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
  function handleSuperAdminSetup(e) {
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
    const superAdmin = {
      id: storage.uid(),
      email: saEmail.trim(),
      password: saPassword,
      name: "Admin",
      mobile: saMobile.trim(),
      role: "Super Admin",
      isActive: true
    };
    storage.saveUsers([superAdmin]);
    storage.markSuperAdminCreated();
    storage.setCurrentUser(superAdmin);
    onLogin(superAdmin);
  }
  function handleOwnerSignup(e) {
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
    const users = storage.getUsers();
    const hasSuperAdmin = users.some((u) => u.role === "Super Admin");
    if (!hasSuperAdmin) {
      setOwnerError(
        "System setup is not complete. Please contact the administrator."
      );
      return;
    }
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === ownerEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setOwnerEmailError("An account with this email already exists.");
      return;
    }
    const newOwner = {
      id: storage.uid(),
      email: ownerEmail.trim(),
      password: ownerPassword,
      name: ownerName.trim(),
      mobile: ownerMobile.trim(),
      role: "Owner",
      isActive: true,
      accessType: "Trial"
    };
    storage.saveUsers([...users, newOwner]);
    storage.setCurrentUser(newOwner);
    onLogin(newOwner);
  }
  function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    setFpError("");
    if (!fpEmail.trim() || !isValidEmail(fpEmail)) {
      setFpEmailError("Please enter a valid email address.");
      return;
    }
    setFpEmailError("");
    const users = storage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === fpEmail.trim().toLowerCase()
    );
    if (!user) {
      setFpError("No account found with this email address.");
      return;
    }
    setOtpUserEmail(fpEmail.trim().toLowerCase());
    generateAndStoreOtp();
    setView("otp-verify");
  }
  function handleOtpVerify(e) {
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
  function handleSetNewPassword(e) {
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
    const updated = users.map(
      (u) => u.email.toLowerCase() === otpUserEmail ? { ...u, password: newPassword } : u
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
  function goToLogin() {
    setView("login");
    setLoginError("");
    setFpEmail("");
    setFpError("");
    setFpEmailError("");
    setOtpInput("");
    setOtpError("");
  }
  const loginFormContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2",
          style: { background: "#8B1A1A", color: "#C9A84C" },
          children: isAdminPortal ? "🛡️" : "🏢"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#8B1A1A",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: isAdminPortal ? "Administrator Portal" : "Welcome Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: isAdminPortal ? "TaxCore system administration" : "Sign in to continue to TaxCore" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "login-email",
            className: "text-sm font-semibold text-gray-700",
            children: "Email Address"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "login-email",
            "data-ocid": "login.input",
            type: "email",
            value: loginEmail,
            onChange: (e) => setLoginEmail(e.target.value),
            onBlur: () => {
              if (loginEmail && !isValidEmail(loginEmail))
                setLoginError("Please enter a valid email address.");
              else if (loginError === "Please enter a valid email address.")
                setLoginError("");
            },
            placeholder: "Enter your email",
            required: true,
            autoComplete: "email",
            className: "mt-1.5"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "login-password",
              className: "text-sm font-semibold text-gray-700",
              children: "Password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "text-xs font-medium underline",
              style: { color: "#8B1A1A" },
              "data-ocid": "login.link",
              onClick: () => {
                setLoginError("");
                setFpEmail("");
                setFpError("");
                setFpEmailError("");
                setView("forgot-password");
              },
              children: "Forgot Password?"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "login-password",
              "data-ocid": "login.password_input",
              type: showLoginPw ? "text" : "password",
              value: loginPassword,
              onChange: (e) => setLoginPassword(e.target.value),
              placeholder: "Enter password",
              autoComplete: "current-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowLoginPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showLoginPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      loginError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "login.error_state",
          className: "p-3 rounded-lg bg-red-50 border border-red-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: loginError })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "login.submit_button",
          disabled: loginLoading,
          className: "w-full text-white font-semibold h-11 text-base",
          style: { background: "#8B1A1A" },
          children: loginLoading ? "Signing in…" : "Sign In"
        }
      )
    ] }),
    !isAdminPortal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "owner-signup.link",
          className: "text-xs font-medium underline",
          style: { color: "#c9a44c" },
          onClick: () => {
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
          },
          children: "New firm? Create Owner Account →"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "admin-login.link",
          className: "text-xs font-medium underline",
          style: { color: "#C9A84C" },
          onClick: () => {
            setLoginEmail("");
            setLoginPassword("");
            setLoginError("");
            setManualAdminMode(true);
          },
          children: "🛡 Administrator Login"
        }
      ) })
    ] }),
    isAdminPortal && !urlAdminPortal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": "back-to-owner.link",
        className: "text-xs font-medium underline",
        style: { color: "#c9a44c" },
        onClick: () => {
          setLoginEmail("");
          setLoginPassword("");
          setLoginError("");
          setManualAdminMode(false);
        },
        children: "← Back to Owner / Staff Login"
      }
    ) })
  ] }) });
  const superAdminSetupContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2",
          style: { background: "#7a1f2b", color: "#c9a44c" },
          children: "🛡"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: "System Setup"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Initial configuration. Set your administrator credentials." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSuperAdminSetup, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "sa-email",
            className: "text-sm font-semibold text-gray-700",
            children: "Email Address *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "sa-email",
            "data-ocid": "super-admin-signup.input",
            type: "email",
            value: saEmail,
            onChange: (e) => {
              setSaEmail(e.target.value);
              if (saEmailError && isValidEmail(e.target.value))
                setSaEmailError("");
            },
            onBlur: () => {
              if (saEmail && !isValidEmail(saEmail))
                setSaEmailError("Please enter a valid email address.");
            },
            placeholder: "admin@yourdomain.com",
            autoComplete: "email",
            required: true,
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldError, { msg: saEmailError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "sa-mobile",
            className: "text-sm font-semibold text-gray-700",
            children: "Mobile Number *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "sa-mobile",
            "data-ocid": "super-admin-signup.mobile_input",
            type: "tel",
            inputMode: "numeric",
            value: saMobile,
            onChange: (e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setSaMobile(digits);
              if (digits.length > 0 && !isValidMobile(digits))
                setSaMobileError("Mobile must be exactly 10 digits.");
              else setSaMobileError("");
            },
            placeholder: "10-digit mobile",
            maxLength: 10,
            required: true,
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldError, { msg: saMobileError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "sa-password",
            className: "text-sm font-semibold text-gray-700",
            children: "Password *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "sa-password",
              "data-ocid": "super-admin-signup.password_input",
              type: showSaPw ? "text" : "password",
              value: saPassword,
              onChange: (e) => setSaPassword(e.target.value),
              placeholder: "Min. 6 characters",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowSaPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showSaPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "sa-confirm",
            className: "text-sm font-semibold text-gray-700",
            children: "Confirm Password *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "sa-confirm",
              "data-ocid": "super-admin-signup.confirm_input",
              type: showSaConfirmPw ? "text" : "password",
              value: saConfirm,
              onChange: (e) => setSaConfirm(e.target.value),
              placeholder: "Re-enter password",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowSaConfirmPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showSaConfirmPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      saError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "super-admin-signup.error_state",
          className: "p-3 rounded-lg bg-red-50 border border-red-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: saError })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "super-admin-signup.submit_button",
          className: "w-full text-white font-semibold h-11 text-base",
          style: { background: "#7a1f2b" },
          children: "Complete Setup"
        }
      )
    ] })
  ] }) });
  const ownerSignupContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-11 h-11 rounded-full flex items-center justify-center text-xl mx-auto mb-2",
          style: { background: "#7a1f2b", color: "#c9a44c" },
          children: "🏢"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: "Create Owner Account"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Register your firm on TaxCore" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleOwnerSignup, className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-name",
            className: "text-sm font-semibold text-gray-700",
            children: "Owner Name *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "ow-name",
            "data-ocid": "owner-signup.name_input",
            type: "text",
            value: ownerName,
            onChange: (e) => setOwnerName(e.target.value),
            placeholder: "Full name",
            autoComplete: "name",
            required: true,
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-firm",
            className: "text-sm font-semibold text-gray-700",
            children: "Firm Name *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "ow-firm",
            "data-ocid": "owner-signup.firm_input",
            type: "text",
            value: ownerFirm,
            onChange: (e) => setOwnerFirm(e.target.value),
            placeholder: "Your CA firm name",
            required: true,
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-email",
            className: "text-sm font-semibold text-gray-700",
            children: "Email Address *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "ow-email",
            "data-ocid": "owner-signup.email_input",
            type: "email",
            value: ownerEmail,
            onChange: (e) => {
              setOwnerEmail(e.target.value);
              if (ownerEmailError && isValidEmail(e.target.value))
                setOwnerEmailError("");
            },
            onBlur: () => {
              if (ownerEmail && !isValidEmail(ownerEmail))
                setOwnerEmailError("Please enter a valid email address.");
            },
            placeholder: "owner@firm.com",
            autoComplete: "email",
            required: true,
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldError, { msg: ownerEmailError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-mobile",
            className: "text-sm font-semibold text-gray-700",
            children: "Mobile Number *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "ow-mobile",
            "data-ocid": "owner-signup.mobile_input",
            type: "tel",
            inputMode: "numeric",
            value: ownerMobile,
            onChange: (e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setOwnerMobile(digits);
              if (digits.length > 0 && !isValidMobile(digits))
                setOwnerMobileError("Mobile must be exactly 10 digits.");
              else setOwnerMobileError("");
            },
            placeholder: "10-digit mobile",
            maxLength: 10,
            required: true,
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldError, { msg: ownerMobileError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-password",
            className: "text-sm font-semibold text-gray-700",
            children: "Password *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ow-password",
              "data-ocid": "owner-signup.password_input",
              type: showOwnerPw ? "text" : "password",
              value: ownerPassword,
              onChange: (e) => setOwnerPassword(e.target.value),
              placeholder: "Min. 6 characters",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowOwnerPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showOwnerPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "ow-confirm",
            className: "text-sm font-semibold text-gray-700",
            children: "Confirm Password *"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ow-confirm",
              "data-ocid": "owner-signup.confirm_input",
              type: showOwnerConfirmPw ? "text" : "password",
              value: ownerConfirm,
              onChange: (e) => setOwnerConfirm(e.target.value),
              placeholder: "Re-enter password",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowOwnerConfirmPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showOwnerConfirmPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      ownerError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "owner-signup.error_state",
          className: "p-3 rounded-lg bg-red-50 border border-red-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: ownerError })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "owner-signup.submit_button",
          className: "w-full text-white font-semibold h-11 text-base",
          style: { background: "#7a1f2b" },
          children: "Create Owner Account"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-3 text-center", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "underline text-gray-600 font-medium",
          onClick: goToLogin,
          children: "Sign in"
        }
      )
    ] })
  ] }) });
  const forgotFormContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: "Forgot Password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Enter your registered email to receive an OTP." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleForgotPasswordSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "fp-email",
            className: "text-sm font-semibold text-gray-700",
            children: "Email Address"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "fp-email",
            "data-ocid": "forgot-password.input",
            type: "email",
            value: fpEmail,
            onChange: (e) => {
              setFpEmail(e.target.value);
              if (fpEmailError && isValidEmail(e.target.value))
                setFpEmailError("");
            },
            onBlur: () => {
              if (fpEmail && !isValidEmail(fpEmail))
                setFpEmailError("Please enter a valid email address.");
            },
            placeholder: "your@email.com",
            autoComplete: "email",
            required: true,
            className: "mt-1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldError, { msg: fpEmailError })
      ] }),
      fpError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "forgot-password.error_state",
          className: "p-3 rounded-lg bg-red-50 border border-red-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: fpError })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "forgot-password.submit_button",
          className: "w-full text-white font-semibold h-11",
          style: { background: "#7a1f2b" },
          children: "Send OTP"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "forgot-password.cancel_button",
          className: "w-full text-sm text-gray-500 underline",
          onClick: goToLogin,
          children: "Back to Login"
        }
      )
    ] })
  ] }) });
  const otpVerifyContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: "Verify OTP"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
        "Enter the 6-digit OTP for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color: "#7a1f2b" }, children: maskEmail(otpUserEmail) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-4 mb-4 text-center",
        style: {
          background: "rgba(201,164,76,0.12)",
          border: "1.5px solid #c9a44c"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "🔐 Your OTP Code (demo — in production this is sent to your registered email/mobile):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-3xl font-bold tracking-[0.3em]",
              style: { color: "#7a1f2b" },
              children: generatedOtp
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Valid for 5 minutes" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleOtpVerify, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "otp-input",
            className: "text-sm font-semibold text-gray-700",
            children: "Enter OTP"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "otp-input",
            "data-ocid": "otp-verify.input",
            type: "tel",
            inputMode: "numeric",
            value: otpInput,
            onChange: (e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtpInput(digits);
              if (otpError) setOtpError("");
            },
            placeholder: "6-digit OTP",
            maxLength: 6,
            required: true,
            className: "mt-1.5 text-center tracking-widest text-lg font-bold"
          }
        ),
        otpError && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-ocid": "otp-verify.error_state",
            className: "p-2 rounded-lg bg-red-50 border border-red-200 mt-2",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: otpError })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "otp-verify.submit_button",
          className: "w-full text-white font-semibold h-11",
          style: { background: "#7a1f2b" },
          children: "Verify OTP →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "otp-verify.cancel_button",
          className: "text-sm text-gray-500 underline",
          onClick: () => {
            setView("forgot-password");
            setOtpInput("");
            setOtpError("");
          },
          children: "← Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "otp-verify.button",
          disabled: resendCountdown > 0,
          className: "text-sm font-medium underline disabled:opacity-40 disabled:cursor-not-allowed",
          style: { color: "#c9a44c" },
          onClick: handleResendOtp,
          children: resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : "Resend OTP"
        }
      )
    ] })
  ] }) });
  const newPasswordContent = /* @__PURE__ */ jsxRuntimeExports.jsx(FormWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-2xl font-bold mb-1",
          style: {
            color: "#7a1f2b",
            fontFamily: "'Playfair Display', Georgia, serif"
          },
          children: "Set New Password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Choose a new password for your account." })
    ] }),
    resetSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "new-password.success_state",
        className: "p-4 rounded-lg text-sm text-green-800 bg-green-50 border border-green-200 text-center",
        children: [
          "✅ ",
          resetSuccess,
          " Redirecting to login…"
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSetNewPassword, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "new-password",
            className: "text-sm font-semibold text-gray-700",
            children: "New Password"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "new-password",
              "data-ocid": "new-password.input",
              type: showNewPw ? "text" : "password",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              placeholder: "Min. 6 characters",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowNewPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showNewPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "new-password-confirm",
            className: "text-sm font-semibold text-gray-700",
            children: "Confirm New Password"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "new-password-confirm",
              "data-ocid": "new-password.confirm_input",
              type: showNewConfirmPw ? "text" : "password",
              value: newPasswordConfirm,
              onChange: (e) => setNewPasswordConfirm(e.target.value),
              placeholder: "Re-enter new password",
              autoComplete: "new-password",
              required: true,
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowNewConfirmPw((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              tabIndex: -1,
              children: showNewConfirmPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      newPasswordError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "new-password.error_state",
          className: "p-3 rounded-lg bg-red-50 border border-red-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: newPasswordError })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "new-password.submit_button",
          className: "w-full text-white font-semibold h-11",
          style: { background: "#7a1f2b" },
          children: "Update Password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "w-full text-sm text-gray-500 underline",
          onClick: goToLogin,
          children: "Back to Login"
        }
      )
    ] })
  ] }) });
  const activeForm = checkingAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-full w-full px-6 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-7 h-7 rounded-full border-2 animate-spin",
        style: { borderColor: "#8B1A1A", borderTopColor: "transparent" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-3", children: "Checking account…" })
  ] }) : view === "super-admin-setup" ? superAdminSetupContent : view === "owner-signup" ? ownerSignupContent : view === "forgot-password" ? forgotFormContent : view === "otp-verify" ? otpVerifyContent : view === "new-password" ? newPasswordContent : loginFormContent;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col",
      style: { background: "#F7F4EE" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "w-full flex flex-col items-center justify-center py-4 flex-shrink-0",
            style: {
              borderBottom: "1.5px solid #C9A84C",
              background: "#F7F4EE"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  className: "text-4xl font-bold tracking-tight",
                  style: {
                    color: "#8B1A1A",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  },
                  children: "TaxCore"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs tracking-widest uppercase mt-0.5",
                  style: { color: "#C9A84C", letterSpacing: "0.18em" },
                  children: "ITR Workflow & Status Tracker"
                }
              ),
              isAdminPortal && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "mt-1 text-xs px-2 py-0.5 rounded font-semibold tracking-wide",
                  style: {
                    background: "rgba(139,26,26,0.1)",
                    color: "#8B1A1A",
                    border: "1px solid rgba(139,26,26,0.25)"
                  },
                  children: "ADMINISTRATOR PORTAL"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              background: "#F7F4EE",
              borderBottom: "1px solid rgba(201,168,76,0.3)",
              padding: "16px 40px 14px",
              textAlign: "center",
              flexShrink: 0
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  style: {
                    fontFamily: "Georgia, serif",
                    fontSize: 15,
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: "#8B1A1A",
                    margin: 0
                  },
                  children: "Centralize Your Workflow."
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  style: {
                    fontFamily: "Georgia, serif",
                    fontSize: 15,
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: "#B8401A",
                    margin: "2px 0 0 0"
                  },
                  children: "Because You Can't Manage What You Don't Track."
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  style: {
                    width: 120,
                    height: 1,
                    background: "#C9A84C",
                    opacity: 0.6,
                    margin: "10px auto 0"
                  }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex flex-1 flex-col md:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex flex-1 items-center justify-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowPanel, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "hidden md:block flex-shrink-0",
              style: {
                width: 2,
                background: "linear-gradient(to bottom, transparent, #D4C9A8 15%, #D4C9A8 85%, transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center overflow-y-auto", children: activeForm })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "footer",
          {
            className: "w-full py-3 flex flex-col items-center flex-shrink-0",
            style: {
              borderTop: "1px solid #E0D9C8",
              background: "#F7F4EE"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-sm tracking-wide text-center",
                  style: { color: "#8B1A1A", fontWeight: 600 },
                  children: "A complete workflow tool for tax professionals"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs mt-0.5 text-center",
                  style: { color: "#AAA", letterSpacing: "0.06em" },
                  children: "Secure • Multi-tenant • Role-based access"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
export {
  LoginPage as default
};
