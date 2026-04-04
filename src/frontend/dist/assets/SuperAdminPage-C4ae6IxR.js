import { c as createLucideIcon, r as reactExports, s as storage, j as jsxRuntimeExports, $ as ShieldCheck, B as Button, C as CircleCheckBig, D as Dialog, l as DialogContent, m as DialogHeader, n as DialogTitle, L as Label, I as Input } from "./index-BC4bIN54.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DeH4EJUo.js";
import { P as Plus } from "./plus-Co6pJy_L.js";
import { T as Trash2 } from "./trash-2-dFxyUbsa.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }],
  ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }],
  ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }],
  ["path", { d: "M10 6h4", key: "1itunk" }],
  ["path", { d: "M10 10h4", key: "tcdvrf" }],
  ["path", { d: "M10 14h4", key: "kelpxr" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
];
const Building2 = createLucideIcon("building-2", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode);
function SuperAdminPage() {
  const [showForm, setShowForm] = reactExports.useState(false);
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const [form, setForm] = reactExports.useState({
    ownerName: "",
    firmName: "",
    email: "",
    mobile: "",
    password: "",
    accessType: "Trial"
  });
  const [formError, setFormError] = reactExports.useState("");
  const firms = reactExports.useMemo(() => {
    return storage.getFirmAccounts();
  }, [refreshKey]);
  const refresh = () => setRefreshKey((k) => k + 1);
  const handleCreate = () => {
    setFormError("");
    if (!form.ownerName.trim()) return setFormError("Owner name is required.");
    if (!form.firmName.trim()) return setFormError("Firm name is required.");
    if (!form.email.trim()) return setFormError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setFormError("Invalid email format.");
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.password.trim() || form.password.length < 6)
      return setFormError("Password must be at least 6 characters.");
    const users = storage.getUsers();
    if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      return setFormError("An account with this email already exists.");
    }
    const newFirm = {
      id: storage.uid(),
      ownerName: form.ownerName.trim(),
      firmName: form.firmName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      accessType: form.accessType,
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      clientCount: 0
    };
    storage.saveFirmAccounts([...firms, newFirm]);
    const newUser = {
      id: storage.uid(),
      email: form.email.trim(),
      password: form.password,
      name: form.ownerName.trim(),
      mobile: form.mobile.trim(),
      role: "Owner",
      isActive: true,
      accessType: form.accessType
    };
    storage.saveUsers([...users, newUser]);
    setForm({
      ownerName: "",
      firmName: "",
      email: "",
      mobile: "",
      password: "",
      accessType: "Trial"
    });
    setShowForm(false);
    refresh();
  };
  const handleToggleActive = (id) => {
    const updated = firms.map(
      (f) => f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    storage.saveFirmAccounts(updated);
    const firmAcc = firms.find((f) => f.id === id);
    if (firmAcc) {
      const users = storage.getUsers();
      const updatedUsers = users.map(
        (u) => u.email.toLowerCase() === firmAcc.email.toLowerCase() ? { ...u, isActive: !firmAcc.isActive } : u
      );
      storage.saveUsers(updatedUsers);
    }
    refresh();
  };
  const handleToggleAccess = (id) => {
    const updated = firms.map(
      (f) => f.id === id ? { ...f, accessType: f.accessType === "Trial" ? "Full" : "Trial" } : f
    );
    storage.saveFirmAccounts(updated);
    const firmAcc = firms.find((f) => f.id === id);
    if (firmAcc) {
      const users = storage.getUsers();
      const newAccess = firmAcc.accessType === "Trial" ? "Full" : "Trial";
      const updatedUsers = users.map(
        (u) => u.email.toLowerCase() === firmAcc.email.toLowerCase() ? { ...u, accessType: newAccess } : u
      );
      storage.saveUsers(updatedUsers);
    }
    refresh();
  };
  const handleDelete = (id) => {
    if (!confirm("Delete this firm account? This cannot be undone.")) return;
    const firmAcc = firms.find((f) => f.id === id);
    storage.saveFirmAccounts(firms.filter((f) => f.id !== id));
    if (firmAcc) {
      const users = storage.getUsers();
      storage.saveUsers(
        users.filter(
          (u) => u.email.toLowerCase() !== firmAcc.email.toLowerCase()
        )
      );
    }
    refresh();
  };
  const stats = {
    total: firms.length,
    active: firms.filter((f) => f.isActive).length,
    trial: firms.filter((f) => f.accessType === "Trial").length,
    full: firms.filter((f) => f.accessType === "Full").length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Total Firms", value: stats.total, color: "#6B1A2B" },
      { label: "Active", value: stats.active, color: "#16a34a" },
      { label: "Trial", value: stats.trial, color: "#d97706" },
      { label: "Full Access", value: stats.full, color: "#7c3aed" }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white rounded-lg p-4 shadow-sm border text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold", style: { color: s.color }, children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500 mt-1", children: s.label })
        ]
      },
      s.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5", style: { color: "#6B1A2B" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", style: { color: "#6B1A2B" }, children: "Firm Accounts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setForm({
              ownerName: "",
              firmName: "",
              email: "",
              mobile: "",
              password: "",
              accessType: "Trial"
            });
            setFormError("");
            setShowForm(true);
          },
          style: { background: "#6B1A2B" },
          className: "text-white",
          "data-ocid": "super-admin.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Firm Account"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border overflow-x-auto", children: firms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16 text-gray-400",
        "data-ocid": "super-admin.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-12 h-12 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No firm accounts yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Click “Add Firm Account” to create the first one." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", "data-ocid": "super-admin.table", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#6B1A2B" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
        "Firm Name",
        "Owner",
        "Email",
        "Mobile",
        "Access",
        "Status",
        "Actions"
      ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "text-left py-3 px-4 text-white font-medium",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: firms.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          className: "border-b last:border-0 hover:bg-gray-50",
          "data-ocid": `super-admin.item.${i + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Building2,
                {
                  className: "w-4 h-4 flex-shrink-0",
                  style: { color: "#6B1A2B" }
                }
              ),
              f.firmName
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: f.ownerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-gray-500", children: f.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-gray-500", children: f.mobile }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleToggleAccess(f.id),
                className: `px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${f.accessType === "Full" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`,
                title: "Click to toggle Trial / Full",
                children: f.accessType
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2 py-0.5 rounded-full text-xs font-medium ${f.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`,
                children: f.isActive ? "Active" : "Inactive"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleToggleActive(f.id),
                  title: f.isActive ? "Deactivate" : "Activate",
                  className: "p-1 rounded hover:bg-gray-100",
                  children: f.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-500" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleDelete(f.id),
                  title: "Delete",
                  className: "p-1 rounded hover:bg-red-100 text-red-400",
                  "data-ocid": `super-admin.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }) })
          ]
        },
        f.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "super-admin.dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "#6B1A2B" }, children: "Add New Firm Account" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Firm Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.firmName,
                onChange: (e) => setForm((f) => ({ ...f, firmName: e.target.value })),
                placeholder: "ABC & Associates",
                className: "mt-1",
                "data-ocid": "super-admin.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Owner Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.ownerName,
                onChange: (e) => setForm((f) => ({ ...f, ownerName: e.target.value })),
                placeholder: "CA Ramesh Gupta",
                className: "mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: form.email,
              onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
              placeholder: "owner@firm.com",
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile * (10 digits)" }),
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
                placeholder: "9876543210",
                maxLength: 10,
                className: "mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.accessType,
                onValueChange: (v) => setForm((f) => ({ ...f, accessType: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Trial", children: "Trial (5 clients)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Full", children: "Full (Unlimited)" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Login Password *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              value: form.password,
              onChange: (e) => setForm((f) => ({ ...f, password: e.target.value })),
              placeholder: "Min. 6 characters",
              className: "mt-1"
            }
          )
        ] }),
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-red-600 text-sm bg-red-50 rounded p-2",
            "data-ocid": "super-admin.error_state",
            children: formError
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleCreate,
              style: { background: "#6B1A2B" },
              className: "text-white flex-1",
              "data-ocid": "super-admin.submit_button",
              children: "Create Account"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              onClick: () => {
                setShowForm(false);
                setFormError("");
              },
              className: "flex-1",
              "data-ocid": "super-admin.cancel_button",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SuperAdminPage as default
};
