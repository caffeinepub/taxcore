import { c as createLucideIcon, r as reactExports, M as useControllableState, j as jsxRuntimeExports, t as createContextScope, N as useId, A as Primitive, y as composeEventHandlers, P as Presence, O as cn, s as storage, T as parseDDMMYYYY, V as getHeadOfIncome, L as Label, I as Input, B as Button } from "./index-33rM45Gk.js";
import { u as useDirection, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DrYyrOJ6.js";
import { c as createRovingFocusGroupScope, R as Root, I as Item } from "./index-DU2Jj6aX.js";
import { D as DatePickerInput } from "./DatePickerInput-CTzMDtIJ.js";
import { P as Plus } from "./plus-DuZL1ru0.js";
import { T as Trash2 } from "./trash-2-Dxi4WjER.js";
import { S as Save } from "./save-DWsql_w8.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode);
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
function ClientDetailPage({ client, onBack }) {
  var _a, _b, _c;
  const [docForm, setDocForm] = reactExports.useState({
    date: "",
    mode: "Email",
    status: "Complete",
    remarks: ""
  });
  const [docError, setDocError] = reactExports.useState("");
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const [workForm, setWorkForm] = reactExports.useState({
    filingStatus: "Pending",
    returnType: "Original",
    remark: ""
  });
  const [filingDateLocked, setFilingDateLocked] = reactExports.useState(false);
  const [workError, setWorkError] = reactExports.useState("");
  const [workSaved, setWorkSaved] = reactExports.useState(false);
  const workInitialized = reactExports.useRef(false);
  const docs = reactExports.useMemo(() => {
    return storage.getDocuments().filter((d) => d.clientId === client.id).sort((a, b) => {
      var _a2, _b2;
      const da = ((_a2 = parseDDMMYYYY(a.date)) == null ? void 0 : _a2.getTime()) || 0;
      const db = ((_b2 = parseDDMMYYYY(b.date)) == null ? void 0 : _b2.getTime()) || 0;
      return db - da;
    });
  }, [client.id, refreshKey]);
  const work = reactExports.useMemo(() => {
    return storage.getWork().find((w) => w.clientId === client.id) || null;
  }, [client.id, refreshKey]);
  reactExports.useEffect(() => {
    if (work && !workInitialized.current) {
      workInitialized.current = true;
      const fs = work.filingStatus ?? (work.eVerified ? "E-Verified" : "Pending");
      setWorkForm({
        status: work.status,
        itrForm: work.itrForm,
        returnType: work.returnType || "Original",
        remark: work.remark || "",
        ackNumber: work.ackNumber,
        filingDate: work.filingDate,
        filingStatus: fs
      });
      if (work.ackNumber && /^\d{15}$/.test(work.ackNumber)) {
        setFilingDateLocked(true);
      }
    }
  }, [work]);
  const validateDate = (d) => {
    if (!d) return false;
    const parts = d.split("-");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return !Number.isNaN(dt.getTime()) && dt.getFullYear() === Number(yyyy);
  };
  const isDateInFuture = (d) => {
    const dt = parseDDMMYYYY(d);
    if (!dt) return false;
    return dt > /* @__PURE__ */ new Date();
  };
  const deriveFilingDateFromAck = (digits) => {
    if (digits.length !== 15) return null;
    const last6 = digits.slice(9, 15);
    const dd = last6.slice(0, 2);
    const mm = last6.slice(2, 4);
    const yy = last6.slice(4, 6);
    const yyyy = `20${yy}`;
    const dayNum = Number(dd);
    const monthNum = Number(mm);
    const yearNum = Number(yyyy);
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2e3 || yearNum > 2099) {
      return null;
    }
    const dt = new Date(yearNum, monthNum - 1, dayNum);
    if (dt.getFullYear() !== yearNum || dt.getMonth() !== monthNum - 1 || dt.getDate() !== dayNum) {
      return null;
    }
    return `${dd}-${mm}-${yyyy}`;
  };
  const handleAckNumberChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 15);
    if (digits.length === 15) {
      const derived = deriveFilingDateFromAck(digits);
      if (derived) {
        setWorkForm((f) => ({ ...f, ackNumber: digits, filingDate: derived }));
        setFilingDateLocked(true);
        return;
      }
    }
    setWorkForm((f) => ({ ...f, ackNumber: digits }));
    setFilingDateLocked(false);
  };
  const handleAddDoc = () => {
    setDocError("");
    if (!docForm.date) return setDocError("Date is required.");
    if (!validateDate(docForm.date))
      return setDocError("Date must be DD-MM-YYYY format.");
    if (isDateInFuture(docForm.date))
      return setDocError("Date cannot be in the future.");
    const newDoc = {
      id: storage.uid(),
      clientId: client.id,
      date: docForm.date,
      mode: docForm.mode,
      status: docForm.status,
      remarks: docForm.remarks,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    storage.saveDocuments([...storage.getDocuments(), newDoc]);
    setDocForm({ date: "", mode: "Email", status: "Complete", remarks: "" });
    setRefreshKey((k) => k + 1);
  };
  const handleDeleteDoc = (id) => {
    storage.saveDocuments(storage.getDocuments().filter((d) => d.id !== id));
    setRefreshKey((k) => k + 1);
  };
  const handleSaveWork = () => {
    setWorkError("");
    if (workForm.ackNumber && !/^\d{15}$/.test(workForm.ackNumber))
      return setWorkError(
        "Acknowledgement Number must be exactly 15 numeric digits."
      );
    if (workForm.filingDate) {
      if (!validateDate(workForm.filingDate))
        return setWorkError("Filing Date must be DD-MM-YYYY format.");
      if (isDateInFuture(workForm.filingDate))
        return setWorkError("Filing Date cannot be in the future.");
    }
    const allWork = storage.getWork();
    const filingStatus = workForm.filingStatus || "Pending";
    const eVerified = filingStatus === "E-Verified";
    if (work) {
      const updated = {
        ...work,
        status: workForm.status || work.status,
        itrForm: workForm.itrForm || "",
        returnType: workForm.returnType || "Original",
        remark: workForm.remark || "",
        ackNumber: workForm.ackNumber || "",
        filingDate: workForm.filingDate || "",
        filingStatus,
        eVerified,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.saveWork(allWork.map((w) => w.id === work.id ? updated : w));
    } else {
      const wp = {
        id: storage.uid(),
        clientId: client.id,
        taxYear: client.taxYear,
        status: workForm.status || "Pending",
        itrForm: workForm.itrForm || "",
        returnType: workForm.returnType || "Original",
        remark: workForm.remark || "",
        ackNumber: workForm.ackNumber || "",
        filingDate: workForm.filingDate || "",
        filingStatus,
        eVerified,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      storage.saveWork([...allWork, wp]);
    }
    setWorkSaved(true);
    setTimeout(() => setWorkSaved(false), 2e3);
    setRefreshKey((k) => k + 1);
  };
  const currentWork = work ? { ...work, ...workForm } : workForm;
  const headOfIncome = getHeadOfIncome(client);
  const filingStatusColor = (status) => {
    if (status === "E-Verified") return "text-green-700";
    if (status === "Pending for E-verification") return "text-blue-700";
    return "text-orange-700";
  };
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "flex items-center gap-1 text-sm hover:underline",
          style: { color: "var(--theme-primary, #6B1A2B)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            " Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-px bg-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-gray-800", children: client.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 px-2 py-0.5 rounded font-mono", children: client.pan }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: client.taxYear })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Mobile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: client.mobile })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-xs break-all leading-tight mt-0.5", children: client.email || "-" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: client.clientCategory })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Head of Income" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: headOfIncome })
      ] }),
      headOfIncome === "Business" && client.businessName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Business Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: client.businessName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Tax Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: client.taxYear })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Due Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: client.dueDate })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "documents", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TabsList,
        {
          style: {
            background: "var(--theme-primary-light, rgba(107,26,43,0.1))"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "documents", style: { fontWeight: 600 }, children: "Document Inward" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "work", style: { fontWeight: 600 }, children: "Work Processing" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "documents", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h3",
            {
              className: "font-semibold mb-3",
              style: { color: "var(--theme-primary, #6B1A2B)" },
              children: "Add Document Entry"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date (no future) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DatePickerInput,
                {
                  value: docForm.date,
                  onChange: (v) => setDocForm((f) => ({ ...f, date: v })),
                  placeholder: "DD-MM-YYYY",
                  maxDate: today,
                  className: "mt-1"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Mode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: docForm.mode,
                  onValueChange: (v) => setDocForm((f) => ({
                    ...f,
                    mode: v
                  })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Email", children: "Email" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "WhatsApp", children: "WhatsApp" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Hardcopy", children: "Hardcopy" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Mix", children: "Mix" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: docForm.status,
                  onValueChange: (v) => setDocForm((f) => ({
                    ...f,
                    status: v
                  })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Complete", children: "Complete" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Partial", children: "Partial" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Remarks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: docForm.remarks,
                  onChange: (e) => setDocForm((f) => ({ ...f, remarks: e.target.value })),
                  placeholder: "Optional notes",
                  className: "mt-1"
                }
              )
            ] })
          ] }),
          docError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-xs mt-2", children: docError }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleAddDoc,
              size: "sm",
              className: "mt-3 text-white",
              style: { background: "var(--theme-primary, #6B1A2B)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
                " Add Entry"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "var(--theme-primary, #6B1A2B)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Mode", "Status", "Remarks", "Action"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "text-left py-2.5 px-4 text-white font-medium",
              children: h
            },
            h
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            docs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "py-6 text-center text-gray-400", children: "No documents yet. Add the first entry above." }) }),
            docs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "border-b last:border-0 hover:bg-gray-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 font-mono text-xs", children: d.date }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: d.mode }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded-full text-xs font-medium ${d.status === "Complete" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`,
                      children: d.status
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-gray-500", children: d.remarks || "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleDeleteDoc(d.id),
                      className: "p-1 rounded hover:bg-red-100 text-red-400",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                    }
                  ) })
                ]
              },
              d.id
            ))
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "work", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-5 max-w-2xl space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h3",
          {
            className: "font-semibold",
            style: { color: "var(--theme-primary, #6B1A2B)" },
            children: "Work Processing"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Work Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: currentWork.status || "Pending",
              onValueChange: (v) => setWorkForm((f) => ({
                ...f,
                status: v
              })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", children: "Pending" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "In Progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Filed", children: "Filed" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ITR Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: currentWork.itrForm || "",
                onValueChange: (v) => setWorkForm((f) => ({ ...f, itrForm: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select ITR Form" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-1", children: "ITR-1" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-2", children: "ITR-2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-3", children: "ITR-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-4", children: "ITR-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-5", children: "ITR-5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-6", children: "ITR-6" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ITR-7", children: "ITR-7" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Return Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: currentWork.returnType || "Original",
                onValueChange: (v) => setWorkForm((f) => ({
                  ...f,
                  returnType: v
                })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Original", children: "Original" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Revised", children: "Revised" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Belated", children: "Belated" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Updated", children: "Updated" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Remark ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: currentWork.remark || "",
              onChange: (e) => setWorkForm((f) => ({ ...f, remark: e.target.value })),
              placeholder: "e.g. Revision reason, notes for future reference...",
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acknowledgement Number (15 digits)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "mt-1",
              style: {
                border: "2px solid var(--theme-primary, #6B1A2B)",
                borderRadius: "8px",
                overflow: "hidden"
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: currentWork.ackNumber || "",
                  onChange: (e) => handleAckNumberChange(e.target.value),
                  placeholder: "15-digit acknowledgement number",
                  maxLength: 15,
                  inputMode: "numeric",
                  className: "font-mono border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  style: { border: "none", outline: "none", boxShadow: "none" }
                }
              )
            }
          ),
          (((_a = currentWork.ackNumber) == null ? void 0 : _a.length) || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1 text-gray-400", children: [
            ((_b = currentWork.ackNumber) == null ? void 0 : _b.length) || 0,
            "/15 digits",
            (((_c = currentWork.ackNumber) == null ? void 0 : _c.length) || 0) === 15 && filingDateLocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-green-600", children: "✓ Filing date auto-filled" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Filing Date (no future date)" }),
          filingDateLocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mt-1 flex items-center gap-2 px-3 bg-gray-50 text-sm text-gray-700",
              style: {
                height: "36px",
                border: "1px solid #d1d5db",
                borderRadius: "6px"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5 text-gray-400 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: currentWork.filingDate || "" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-auto", children: "Auto-filled from Ack No." })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePickerInput,
            {
              value: currentWork.filingDate || "",
              onChange: (v) => setWorkForm((f) => ({ ...f, filingDate: v })),
              placeholder: "DD-MM-YYYY",
              maxDate: today,
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Filing Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: currentWork.filingStatus || "Pending",
              onValueChange: (v) => setWorkForm((f) => ({
                ...f,
                filingStatus: v
              })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", children: "Pending" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending for E-verification", children: "Pending for E-verification" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "E-Verified", children: "E-Verified" })
                ] })
              ]
            }
          ),
          currentWork.filingStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: `text-xs mt-1 ${filingStatusColor(currentWork.filingStatus)}`,
              children: [
                currentWork.filingStatus === "E-Verified" && "✅ Client excluded from deadline alerts",
                currentWork.filingStatus === "Pending for E-verification" && "⚠️ E-verification must be done within 30 days of filing",
                currentWork.filingStatus === "Pending" && "Work is in progress"
              ]
            }
          )
        ] }),
        workError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm bg-red-50 rounded p-2", children: workError }),
        workSaved && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600 text-sm bg-green-50 rounded p-2", children: "\\u2705 Saved successfully!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSaveWork,
            style: { background: "var(--theme-primary, #6B1A2B)" },
            className: "text-white w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
              " Save Work Processing"
            ]
          }
        )
      ] }) })
    ] })
  ] });
}
export {
  ClientDetailPage as default
};
