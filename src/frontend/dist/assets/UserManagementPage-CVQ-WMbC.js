import { c as createLucideIcon, r as reactExports, s as storage, j as jsxRuntimeExports, B as Button, D as Dialog, m as DialogContent, n as DialogHeader, p as DialogTitle, L as Label, I as Input, E as EyeOff, a as Eye } from "./index-C3td_S1k.js";
import { P as Plus } from "./plus-CS-pVhl7.js";
import { T as Trash2 } from "./trash-2-BWQ0jueE.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode);
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function UserManagementPage() {
  const [showForm, setShowForm] = reactExports.useState(false);
  const [showStaffPw, setShowStaffPw] = reactExports.useState(false);
  const [showStaffConfirmPw, setShowStaffConfirmPw] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    mobile: ""
  });
  const [formError, setFormError] = reactExports.useState("");
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const currentUser = storage.getCurrentUser();
  const { ownerUser, staffUsers } = reactExports.useMemo(() => {
    const users = storage.getUsers();
    const visible = users.filter(
      (u) => u.role === "Owner" || u.role === "Staff"
    );
    const ownerUser2 = visible.find((u) => u.role === "Owner") || null;
    const staffUsers2 = visible.filter((u) => u.role === "Staff");
    return { ownerUser: ownerUser2, staffUsers: staffUsers2 };
  }, [refreshKey]);
  const allUsers = reactExports.useMemo(() => {
    return storage.getUsers();
  }, [refreshKey]);
  const handleAdd = () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.email.trim() || !isValidEmail(form.email))
      return setFormError("Please enter a valid email address.");
    if (form.mobile && !/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.password.trim() || form.password.length < 6)
      return setFormError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setFormError("Passwords do not match.");
    if (allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      return setFormError("A user with this email already exists.");
    }
    const newUser = {
      id: storage.uid(),
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      role: "Staff",
      isActive: true
    };
    storage.saveUsers([...allUsers, newUser]);
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      mobile: ""
    });
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };
  const handleDelete = (id) => {
    if ((currentUser == null ? void 0 : currentUser.id) === id)
      return alert("Cannot delete the currently logged-in user.");
    const target = allUsers.find((u) => u.id === id);
    if ((target == null ? void 0 : target.role) === "Owner")
      return alert("Cannot delete the Owner account.");
    if ((target == null ? void 0 : target.role) === "Super Admin")
      return alert("Cannot delete the Administrator account.");
    if (!confirm("Delete this staff user?")) return;
    storage.saveUsers(allUsers.filter((u) => u.id !== id));
    setRefreshKey((k) => k + 1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    ownerUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white rounded-lg border p-4 shadow-sm",
        "data-ocid": "user-management.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Crown,
              {
                className: "w-4 h-4",
                style: { color: "var(--theme-gold, #C9A44C)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h3",
              {
                className: "font-semibold text-sm",
                style: { color: "var(--theme-primary, #6B1A2B)" },
                children: "Owner Account"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                style: { background: "var(--theme-primary, #6B1A2B)" },
                children: ownerUser.name[0].toUpperCase()
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: ownerUser.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700", children: ownerUser.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Mobile" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: ownerUser.mobile || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 italic", children: "Not set" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
                  "Owner"
                ] })
              ] }),
              ownerUser.accessType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Plan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `px-2 py-0.5 rounded-full text-xs font-medium ${ownerUser.accessType === "Full" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`,
                    children: ownerUser.accessType
                  }
                )
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "h3",
        {
          className: "font-semibold text-sm",
          style: { color: "var(--theme-primary, #6B1A2B)" },
          children: [
            "Staff Members (",
            staffUsers.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setForm({
              email: "",
              password: "",
              confirmPassword: "",
              name: "",
              mobile: ""
            });
            setFormError("");
            setShowForm(true);
          },
          style: { background: "var(--theme-primary, #6B1A2B)" },
          className: "text-white",
          "data-ocid": "user-management.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Staff User"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-white rounded-lg shadow-sm border overflow-x-auto",
        "data-ocid": "user-management.table",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "var(--theme-primary, #6B1A2B)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Name", "Email", "Mobile", "Role", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "text-left py-3 px-4 text-white font-medium",
              children: h
            },
            h
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            staffUsers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 5,
                className: "py-10 text-center text-gray-400",
                "data-ocid": "user-management.empty_state",
                children: "No staff users yet. Add your first staff member."
              }
            ) }),
            staffUsers.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "border-b last:border-0 hover:bg-gray-50",
                "data-ocid": `user-management.item.${i + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold",
                        style: { background: "var(--theme-primary, #6B1A2B)" },
                        children: u.name[0].toUpperCase()
                      }
                    ),
                    u.name
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-gray-500", children: u.email }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-gray-500", children: u.mobile || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 italic", children: "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700", children: "Staff" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleDelete(u.id),
                      className: "p-1 rounded hover:bg-red-100 text-red-400",
                      "data-ocid": `user-management.delete_button.${i + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  ) })
                ]
              },
              u.id
            ))
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "data-ocid": "user-management.dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "var(--theme-primary, #6B1A2B)" }, children: "Add Staff User" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              placeholder: "Staff member name",
              className: "mt-1",
              "data-ocid": "user-management.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: form.email,
              onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
              placeholder: "staff@firm.com",
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile (10 digits, optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "tel",
              inputMode: "numeric",
              value: form.mobile,
              onChange: (e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((f) => ({ ...f, mobile: digits }));
              },
              placeholder: "Enter 10-digit mobile",
              maxLength: 10,
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Password *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: showStaffPw ? "text" : "password",
                value: form.password,
                onChange: (e) => setForm((f) => ({ ...f, password: e.target.value })),
                placeholder: "Minimum 6 characters",
                className: "pr-10"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowStaffPw((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                tabIndex: -1,
                children: showStaffPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirm Password *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: showStaffConfirmPw ? "text" : "password",
                value: form.confirmPassword,
                onChange: (e) => setForm((f) => ({ ...f, confirmPassword: e.target.value })),
                placeholder: "Re-enter password",
                className: "pr-10"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowStaffConfirmPw((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                tabIndex: -1,
                children: showStaffConfirmPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-red-600 text-sm bg-red-50 rounded p-2",
            "data-ocid": "user-management.error_state",
            children: formError
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleAdd,
              style: { background: "var(--theme-primary, #6B1A2B)" },
              className: "text-white flex-1",
              "data-ocid": "user-management.submit_button",
              children: "Create Staff"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              onClick: () => setShowForm(false),
              className: "flex-1",
              "data-ocid": "user-management.cancel_button",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 text-center pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5 inline mr-1" }),
      "Staff users have limited access. Option to update mobile and email coming in a future update."
    ] })
  ] });
}
export {
  UserManagementPage as default
};
