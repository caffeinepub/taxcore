import { s as storage, r as reactExports, l as getDueAlertClients, o as onStorageChange, j as jsxRuntimeExports, X, m as Bell, I as Input, B as Button, n as getDaysUntilDue, i as getLatestDocStatus, h as getClientWork, p as getHeadOfIncome, b as Eye, D as Dialog, t as DialogContent, v as DialogHeader, x as DialogTitle, L as Label, y as getPanCategory, u as ue, k as getLatestDoc } from "./index-tCszq4kq.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BG7hvqo8.js";
import { D as DatePickerInput } from "./DatePickerInput-B0ta2O77.js";
import { T as TriangleAlert, I as InlineStatusCell } from "./InlineStatusCell-BbZy6Xi7.js";
import { a as getCurrentTaxYear, g as getTaxYears } from "./taxYears-JUInSDi_.js";
import { S as Search } from "./search-BwFYVWzd.js";
import { P as Plus } from "./plus-Dp42ifSS.js";
import { P as Pen } from "./pen-DAj1nGbj.js";
import { T as Trash2 } from "./trash-2-72HwX21E.js";
import "./index-D7bKbSxL.js";
const TAX_YEARS = getTaxYears();
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const WORK_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "Pending",
    colorClass: "bg-orange-100 text-orange-700"
  },
  {
    label: "In Progress",
    value: "In Progress",
    colorClass: "bg-blue-100 text-blue-700"
  },
  {
    label: "Completed",
    value: "Completed",
    colorClass: "bg-green-100 text-green-700"
  }
];
const DOC_STATUS_OPTIONS = [
  {
    label: "Complete",
    value: "Complete",
    colorClass: "bg-emerald-100 text-emerald-700"
  },
  {
    label: "Partial",
    value: "Partial",
    colorClass: "bg-yellow-100 text-yellow-700"
  }
];
const HEAD_OF_INCOME_OPTIONS = [
  "Salaried",
  "Business",
  "Agricultural",
  "Capital Gain"
];
function ClientMasterPage({
  onViewClient,
  currentUserId
}) {
  const currentUser = storage.getCurrentUser();
  const TRIAL_LIMIT = 5;
  const [search, setSearch] = reactExports.useState("");
  const [filterYear, setFilterYear] = reactExports.useState("All");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editClient, setEditClient] = reactExports.useState(null);
  const [formError, setFormError] = reactExports.useState("");
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const [alertDismissed, setAlertDismissed] = reactExports.useState(false);
  const [alertClients, setAlertClients] = reactExports.useState(() => getDueAlertClients());
  const [showUpgradeModal, setShowUpgradeModal] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setAlertClients(getDueAlertClients());
    const unsub = onStorageChange(() => {
      setAlertClients(getDueAlertClients());
      setRefreshKey((k) => k + 1);
    });
    return unsub;
  }, []);
  const [form, setForm] = reactExports.useState({
    name: "",
    pan: "",
    mobile: "",
    email: "",
    clientType: "Existing",
    headOfIncome: "Salaried",
    businessName: "",
    taxYear: getCurrentTaxYear(),
    dueDate: ""
  });
  const clients = reactExports.useMemo(() => {
    let list = storage.getClients();
    if (filterYear !== "All")
      list = list.filter((c) => c.taxYear === filterYear);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.pan.toLowerCase().includes(q) || c.mobile.includes(q)
      );
    }
    return list;
  }, [search, filterYear, refreshKey]);
  const getCurrentUserName = () => {
    var _a;
    return ((_a = storage.getUsers().find((u) => u.id === currentUserId)) == null ? void 0 : _a.name) || "Unknown";
  };
  const openAdd = () => {
    if ((currentUser == null ? void 0 : currentUser.accessType) === "Trial") {
      const ownerClients = storage.getClients().filter((c) => {
        return currentUser.role === "Owner" ? true : c.createdBy === currentUser.id;
      });
      if (ownerClients.length >= TRIAL_LIMIT) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setEditClient(null);
    setForm({
      name: "",
      pan: "",
      mobile: "",
      email: "",
      clientType: "Existing",
      headOfIncome: "Salaried",
      businessName: "",
      taxYear: getCurrentTaxYear(),
      dueDate: ""
    });
    setFormError("");
    setShowForm(true);
  };
  const openEdit = (c) => {
    setEditClient(c);
    setForm({
      name: c.name,
      pan: c.pan,
      mobile: c.mobile,
      email: c.email,
      clientType: c.clientType,
      headOfIncome: getHeadOfIncome(c) || "Salaried",
      businessName: c.businessName,
      taxYear: c.taxYear,
      dueDate: c.dueDate
    });
    setFormError("");
    setShowForm(true);
  };
  const validateDate = (d) => {
    if (!d) return false;
    const parts = d.split("-");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return !Number.isNaN(dt.getTime()) && dt.getFullYear() === Number(yyyy);
  };
  const handleSave = () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!PAN_REGEX.test(form.pan.toUpperCase()))
      return setFormError("Invalid PAN format (e.g. ABCDE1234F).");
    if (!/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.taxYear) return setFormError("Tax Year is required.");
    if (!validateDate(form.dueDate))
      return setFormError("Due Date must be in DD-MM-YYYY format.");
    if (form.taxYear && validateDate(form.dueDate)) {
      const endYear = Number(form.taxYear.split("-")[1]);
      const taxYearEnd = new Date(endYear, 2, 31);
      const dueParts = form.dueDate.split("-");
      const dueDate = new Date(
        Number(dueParts[2]),
        Number(dueParts[1]) - 1,
        Number(dueParts[0])
      );
      if (dueDate <= taxYearEnd)
        return setFormError(
          `Due Date must be after 31-03-${endYear} (end of tax year ${form.taxYear}).`
        );
    }
    const pan = form.pan.toUpperCase();
    const allClients = storage.getClients();
    const dup = allClients.find(
      (c) => c.pan.toUpperCase() === pan && c.taxYear === form.taxYear && c.id !== (editClient == null ? void 0 : editClient.id)
    );
    if (dup)
      return setFormError(
        "A client with this PAN and Tax Year already exists. To file a Revised or Updated return, open the existing client and update the Return Type in Work Processing."
      );
    if (editClient) {
      const updated = {
        ...editClient,
        name: form.name,
        pan,
        mobile: form.mobile,
        email: form.email,
        clientType: form.clientType,
        headOfIncome: form.headOfIncome,
        businessName: form.headOfIncome === "Business" ? form.businessName : "",
        taxYear: form.taxYear,
        dueDate: form.dueDate,
        clientCategory: getPanCategory(pan)
      };
      storage.saveClients(
        allClients.map((c) => c.id === editClient.id ? updated : c)
      );
      storage.addAuditLog({
        id: storage.uid(),
        userId: currentUserId,
        userName: getCurrentUserName(),
        userRole: currentUser == null ? void 0 : currentUser.role,
        action: "Client Updated",
        clientId: editClient.id,
        clientName: form.name,
        fieldChanged: "Client Details",
        oldValue: editClient.name,
        newValue: `${form.name} | PAN: ${pan} | Year: ${form.taxYear}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      const newClient = {
        id: storage.uid(),
        name: form.name,
        pan,
        mobile: form.mobile,
        email: form.email,
        clientType: form.clientType,
        headOfIncome: form.headOfIncome,
        businessName: form.headOfIncome === "Business" ? form.businessName : "",
        taxYear: form.taxYear,
        dueDate: form.dueDate,
        clientCategory: getPanCategory(pan),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: currentUserId
      };
      storage.saveClients([...allClients, newClient]);
      const work = storage.getWork();
      const wp = {
        id: storage.uid(),
        clientId: newClient.id,
        taxYear: form.taxYear,
        status: "Pending",
        itrForm: "",
        ackNumber: "",
        filingDate: "",
        filingStatus: "Pending",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.saveWork([...work, wp]);
      storage.addAuditLog({
        id: storage.uid(),
        userId: currentUserId,
        userName: getCurrentUserName(),
        userRole: currentUser == null ? void 0 : currentUser.role,
        action: "Client Added",
        clientId: newClient.id,
        clientName: newClient.name,
        fieldChanged: "Client Added",
        oldValue: "-",
        newValue: `${newClient.name} | PAN: ${pan} | Year: ${form.taxYear}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };
  const handleDelete = (id) => {
    if (!confirm("Delete this client and all related data?")) return;
    const deletedClient = storage.getClients().find((c) => c.id === id);
    storage.saveClients(storage.getClients().filter((c) => c.id !== id));
    storage.saveWork(storage.getWork().filter((w) => w.clientId !== id));
    storage.saveDocuments(
      storage.getDocuments().filter((d) => d.clientId !== id)
    );
    storage.saveBilling(storage.getBilling().filter((b) => b.clientId !== id));
    if (deletedClient) {
      storage.addAuditLog({
        id: storage.uid(),
        userId: currentUserId,
        userName: getCurrentUserName(),
        userRole: currentUser == null ? void 0 : currentUser.role,
        action: "Client Deleted",
        clientId: id,
        clientName: deletedClient.name,
        fieldChanged: "Client",
        oldValue: `${deletedClient.name} | PAN: ${deletedClient.pan}`,
        newValue: "Deleted",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    setRefreshKey((k) => k + 1);
  };
  const handleWorkStatusSave = (client, newVal) => {
    const work = getClientWork(client.id);
    if (!work) return;
    const oldVal = work.status === "Filed" ? "Completed" : work.status;
    if (oldVal === newVal) return;
    const allWork = storage.getWork();
    storage.saveWork(
      allWork.map(
        (w) => w.id === work.id ? {
          ...w,
          status: newVal,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : w
      )
    );
    storage.addAuditLog({
      id: storage.uid(),
      userId: currentUserId,
      userName: getCurrentUserName(),
      userRole: currentUser == null ? void 0 : currentUser.role,
      action: "Updated Work Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Work Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    ue.success("Status updated", {
      description: `${client.name} → ${newVal}`
    });
    setRefreshKey((k) => k + 1);
  };
  const handleDocStatusSave = (client, newVal) => {
    const latestDoc = getLatestDoc(client.id);
    const oldVal = (latestDoc == null ? void 0 : latestDoc.status) ?? "-";
    if (oldVal === newVal) return;
    if (latestDoc) {
      const allDocs = storage.getDocuments();
      storage.saveDocuments(
        allDocs.map(
          (d) => d.id === latestDoc.id ? { ...d, status: newVal } : d
        )
      );
    }
    storage.addAuditLog({
      id: storage.uid(),
      userId: currentUserId,
      userName: getCurrentUserName(),
      userRole: currentUser == null ? void 0 : currentUser.role,
      action: "Updated Inward Docs Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Inward Docs Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    ue.success("Doc status updated", {
      description: `${client.name} → ${newVal}`
    });
    setRefreshKey((k) => k + 1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !alertDismissed && alertClients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "clients.alert.panel",
        className: "relative rounded-lg shadow-md p-4 mb-4 border",
        style: {
          background: "rgba(220,38,38,0.05)",
          borderColor: "rgba(220,38,38,0.25)",
          borderLeft: "4px solid #dc2626"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAlertDismissed(true),
              className: "absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-gray-400",
              "aria-label": "Dismiss",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-red-700", children: [
              alertClients.length,
              " client",
              alertClients.length > 1 ? "s" : "",
              " ",
              "with urgent due dates"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: alertClients.map(({ client, daysLeft }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TriangleAlert,
              {
                className: `w-3.5 h-3.5 flex-shrink-0 ${daysLeft < 0 ? "text-yellow-500" : daysLeft <= 5 ? "text-red-500" : "text-amber-500"}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: client.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 font-mono text-xs", children: client.pan }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600", children: [
              "Due: ",
              client.dueDate
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${daysLeft < 0 ? "bg-yellow-100 text-yellow-700" : daysLeft <= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
                children: daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`
              }
            )
          ] }, client.id)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search name, PAN, mobile...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9 w-64",
              "data-ocid": "clients.search_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", "data-ocid": "clients.filter.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "All", children: "All Years" }),
            TAX_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openAdd,
          style: { background: "var(--theme-primary, #6B1A2B)" },
          className: "text-white",
          "data-ocid": "clients.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Client"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-white rounded-lg shadow-sm border overflow-x-auto",
        "data-ocid": "clients.table",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "var(--theme-primary, #6B1A2B)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
            "Name",
            "PAN",
            "Head of Income",
            "Business Name",
            "Tax Year",
            "Due Date",
            "Doc Status",
            "Work Status",
            "Work Remark",
            "Actions"
          ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "text-left py-3 px-3 text-white font-medium text-xs",
              children: h
            },
            h
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            clients.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 10,
                className: "py-10 text-center text-gray-400",
                "data-ocid": "clients.empty_state",
                children: "No clients found. Add your first client."
              }
            ) }),
            clients.map((client, i) => {
              const days = getDaysUntilDue(client.dueDate);
              const isAlert = days !== null && days <= 10;
              const latestDoc = getLatestDocStatus(client.id);
              const work = getClientWork(client.id);
              const docHasEntry = latestDoc !== "-";
              const headOfIncome = getHeadOfIncome(client);
              const workStatusDisplay = (work == null ? void 0 : work.status) === "Filed" ? "Completed" : (work == null ? void 0 : work.status) || "Pending";
              const alertRowClass = days !== null && days < 0 ? "bg-yellow-50 border-l-4 border-l-yellow-400" : isAlert && days !== null && days <= 5 ? "bg-red-50 border-l-4 border-l-red-500" : isAlert ? "bg-amber-50 border-l-4 border-l-amber-400" : "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  "data-ocid": `clients.item.${i + 1}`,
                  className: `border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"} ${alertRowClass}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => onViewClient(client),
                        className: "hover:underline",
                        style: { color: "var(--theme-primary, #6B1A2B)" },
                        children: client.name
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-mono text-xs", children: client.pan }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `px-1.5 py-0.5 rounded text-xs font-medium ${headOfIncome === "Business" ? "bg-purple-100 text-purple-700" : headOfIncome === "Salaried" ? "bg-blue-100 text-blue-700" : headOfIncome === "Agricultural" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`,
                        children: headOfIncome
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-xs text-gray-600", children: headOfIncome === "Business" && client.businessName ? client.businessName : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-xs", children: client.taxYear }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      isAlert && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TriangleAlert,
                        {
                          className: `w-3.5 h-3.5 flex-shrink-0 ${days !== null && days < 0 ? "text-yellow-500" : "text-red-500"}`
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-xs ${days !== null && days < 0 ? "text-yellow-600 font-semibold" : isAlert ? "text-red-600 font-semibold" : ""}`,
                          children: client.dueDate
                        }
                      ),
                      isAlert && days !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          className: `text-xs ${days < 0 ? "text-yellow-500" : "text-red-500"}`,
                          children: [
                            "(",
                            days < 0 ? `${Math.abs(days)}d ago` : `${days}d`,
                            ")"
                          ]
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: docHasEntry ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      InlineStatusCell,
                      {
                        value: latestDoc,
                        options: DOC_STATUS_OPTIONS,
                        onSave: (newVal) => handleDocStatusSave(client, newVal)
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 italic", children: "No docs" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      InlineStatusCell,
                      {
                        value: workStatusDisplay,
                        options: WORK_STATUS_OPTIONS,
                        onSave: (newVal) => handleWorkStatusSave(client, newVal)
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 max-w-[160px]", children: (work == null ? void 0 : work.remark) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-xs text-gray-700 italic block truncate",
                        title: work.remark,
                        children: work.remark
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-300", children: "—" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => onViewClient(client),
                          title: "View",
                          className: "p-1 rounded hover:bg-gray-200 text-gray-500",
                          "data-ocid": `clients.item.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => openEdit(client),
                          title: "Edit",
                          className: "p-1 rounded hover:bg-gray-200 text-gray-500",
                          "data-ocid": `clients.edit_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => handleDelete(client.id),
                          title: "Delete",
                          className: "p-1 rounded hover:bg-red-100 text-red-400",
                          "data-ocid": `clients.delete_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                        }
                      )
                    ] }) })
                  ]
                },
                client.id
              );
            })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        className: "max-w-lg max-h-[90vh] overflow-y-auto",
        "data-ocid": "clients.dialog",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "var(--theme-primary, #6B1A2B)" }, children: editClient ? "Edit Client" : "Add New Client" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: form.name,
                    onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                    placeholder: "Full name",
                    className: "mt-1",
                    "data-ocid": "clients.input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PAN *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: form.pan,
                    onChange: (e) => setForm((f) => ({
                      ...f,
                      pan: e.target.value.toUpperCase()
                    })),
                    placeholder: "ABCDE1234F",
                    maxLength: 10,
                    className: "mt-1 font-mono uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile * (10 digits)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: form.mobile,
                    onChange: (e) => setForm((f) => ({
                      ...f,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10)
                    })),
                    placeholder: "Enter 10-digit mobile",
                    type: "tel",
                    inputMode: "numeric",
                    className: "mt-1"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "email",
                    value: form.email,
                    onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
                    placeholder: "email@example.com (optional)",
                    className: "mt-1"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Client Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.clientType,
                    onValueChange: (v) => setForm((f) => ({
                      ...f,
                      clientType: v
                    })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Existing", children: "Existing" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "New", children: "New" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Head of Income" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.headOfIncome,
                    onValueChange: (v) => setForm((f) => ({
                      ...f,
                      headOfIncome: v
                    })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HEAD_OF_INCOME_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                    ]
                  }
                )
              ] }),
              form.headOfIncome === "Business" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Business Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: form.businessName,
                    onChange: (e) => setForm((f) => ({ ...f, businessName: e.target.value })),
                    placeholder: "Business / firm name",
                    className: "mt-1"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tax Year *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.taxYear,
                    onValueChange: (v) => setForm((f) => ({ ...f, taxYear: v })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TAX_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date * (DD-MM-YYYY)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DatePickerInput,
                  {
                    value: form.dueDate,
                    onChange: (v) => setForm((f) => ({ ...f, dueDate: v })),
                    placeholder: "DD-MM-YYYY",
                    className: "mt-1"
                  }
                )
              ] })
            ] }),
            formError && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-red-600 text-sm bg-red-50 rounded p-2",
                "data-ocid": "clients.error_state",
                children: formError
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: handleSave,
                  style: { background: "var(--theme-primary, #6B1A2B)" },
                  className: "text-white flex-1",
                  "data-ocid": "clients.submit_button",
                  children: "Save Client"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setShowForm(false),
                  className: "flex-1",
                  "data-ocid": "clients.cancel_button",
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showUpgradeModal, onOpenChange: setShowUpgradeModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "data-ocid": "trial.dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "var(--theme-primary, #6B1A2B)" }, children: "Trial Limit Reached" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-7 h-7 text-amber-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700 text-center", children: [
            "You've reached the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 client limit" }),
            " for the Trial plan."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 text-center", children: [
            "Contact your Administrator to upgrade to the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Full plan" }),
            " for unlimited clients."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setShowUpgradeModal(false),
            className: "w-full text-white",
            style: { background: "var(--theme-primary, #6B1A2B)" },
            "data-ocid": "trial.close_button",
            children: "OK, Got It"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ClientMasterPage as default
};
