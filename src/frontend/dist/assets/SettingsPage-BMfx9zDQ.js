import { c as createLucideIcon, j as jsxRuntimeExports, a5 as Slot, Z as cn, a6 as cva, r as reactExports, F as useComposedRefs, W as useControllableState, y as createContextScope, J as Primitive, G as composeEventHandlers, s as storage, o as onStorageChange, a7 as Settings, L as Label, I as Input, E as EyeOff, a as Eye, B as Button, l as Bell, u as ue } from "./index-DXkbJhX0.js";
import { C as Card, b as CardHeader, M as MessageSquare, c as CardTitle, d as CardDescription, a as CardContent } from "./card-BEC9P83m.js";
import { j as usePrevious, k as useSize, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BVHzMGmp.js";
import { T as Trash2 } from "./trash-2-DfApig-N.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
function Switch({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "switch",
      className: cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Thumb,
        {
          "data-slot": "switch-thumb",
          className: cn(
            "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
          )
        }
      )
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
const DEFAULT_SETTINGS = {
  provider: "Twilio",
  apiKey: "",
  senderPhone: "",
  dueDateAlertEnabled: true,
  filingStatusAlertEnabled: false,
  documentReadyAlertEnabled: false
};
const PROVIDERS = ["Twilio", "Wati", "Interakt", "Other"];
function SettingsPage({ user }) {
  if (user.role !== "Owner") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-20 gap-3",
        "data-ocid": "settings.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-10 h-10 text-red-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-gray-600", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "This page is available to Owners only." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsContent, { user });
}
function SettingsContent({ user: _user }) {
  const [settings, setSettings] = reactExports.useState(
    () => storage.getWhatsAppSettings() ?? { ...DEFAULT_SETTINGS }
  );
  const [showApiKey, setShowApiKey] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [notifLogs, setNotifLogs] = reactExports.useState(
    () => storage.getNotificationLogs()
  );
  const refreshLogs = reactExports.useCallback(() => {
    setNotifLogs(storage.getNotificationLogs());
  }, []);
  reactExports.useEffect(() => {
    const unsub = onStorageChange(refreshLogs);
    return unsub;
  }, [refreshLogs]);
  const handleSaveConfig = () => {
    setIsSaving(true);
    if (settings.senderPhone && !/^\+\d{7,15}$/.test(settings.senderPhone) && !/^\d{10}$/.test(settings.senderPhone)) {
      ue.error("Invalid phone number", {
        description: "Use +91XXXXXXXXXX or 10-digit format."
      });
      setIsSaving(false);
      return;
    }
    storage.saveWhatsAppSettings(settings);
    ue.success("Settings saved", {
      description: "WhatsApp configuration updated successfully."
    });
    setIsSaving(false);
  };
  const handleToggle = (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    storage.saveWhatsAppSettings(updated);
    ue.success("Preference updated");
  };
  const handleClearLogs = () => {
    storage.clearNotificationLogs();
    ue.success("Notification log cleared");
  };
  const hasApiKey = settings.apiKey.trim().length > 0;
  const statusColor = (status) => {
    if (status === "Sent") return "bg-emerald-100 text-emerald-700";
    if (status === "Failed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };
  const formatTimestamp = (ts) => {
    try {
      return new Date(ts).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return ts;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-4xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-10 h-10 rounded-lg flex items-center justify-center",
          style: { background: "rgba(107,26,43,0.1)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Settings,
            {
              className: "w-5 h-5",
              style: { color: "var(--theme-primary, #6B1A2B)" }
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            className: "text-xl font-semibold",
            style: {
              color: "var(--theme-primary, #6B1A2B)",
              fontFamily: "'Playfair Display', Georgia, serif"
            },
            children: "Notification Settings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Configure WhatsApp alerts and notification preferences" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-sm border", "data-ocid": "settings.panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MessageSquare,
              {
                className: "w-5 h-5",
                style: { color: "var(--theme-gold, #C9A44C)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CardTitle,
              {
                className: "text-base",
                style: { color: "var(--theme-primary, #6B1A2B)" },
                children: "WhatsApp Notification Setup"
              }
            )
          ] }),
          hasApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "flex items-center gap-1 text-xs",
              style: {
                background: "#d1fae5",
                color: "#065f46",
                border: "none"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                "API Key Configured"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "flex items-center gap-1 text-xs",
              style: {
                background: "#fef9c3",
                color: "#713f12",
                border: "none"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
                "API Key Not Set — Notifications will queue"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start gap-2 p-3 rounded-md text-sm",
            style: { background: "#fef3c7", color: "#92400e" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No API key yet? Configure your provider details now and add your API key when ready. Notifications will queue automatically and can be sent once the API key is configured." })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "provider", className: "text-sm font-medium", children: "Provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: settings.provider,
                onValueChange: (v) => setSettings((s) => ({ ...s, provider: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      id: "provider",
                      "data-ocid": "settings.provider.select",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select provider" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PROVIDERS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "senderPhone", className: "text-sm font-medium", children: "Sender Phone (WhatsApp Business Number)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "senderPhone",
                type: "tel",
                placeholder: "+91XXXXXXXXXX",
                value: settings.senderPhone,
                onChange: (e) => setSettings((s) => ({ ...s, senderPhone: e.target.value })),
                "data-ocid": "settings.sender_phone.input"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "apiKey", className: "text-sm font-medium", children: "API Key" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "apiKey",
                type: showApiKey ? "text" : "password",
                placeholder: "Enter API key when available",
                value: settings.apiKey,
                onChange: (e) => setSettings((s) => ({ ...s, apiKey: e.target.value })),
                className: "pr-10",
                "data-ocid": "settings.api_key.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowApiKey((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                "data-ocid": "settings.toggle_api_key.button",
                "aria-label": showApiKey ? "Hide API key" : "Show API key",
                children: showApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Keep your API key secure. It will be stored locally in your browser." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSaveConfig,
            disabled: isSaving,
            className: "mt-2",
            style: {
              background: "var(--theme-primary, #6B1A2B)",
              color: "#fff"
            },
            "data-ocid": "settings.save.button",
            children: "Save Configuration"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-sm border", "data-ocid": "settings.preferences.panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bell,
            {
              className: "w-5 h-5",
              style: { color: "var(--theme-gold, #C9A44C)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CardTitle,
            {
              className: "text-base",
              style: { color: "var(--theme-primary, #6B1A2B)" },
              children: "Notification Triggers"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Choose which events trigger a WhatsApp notification" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: "Due Date Alert (≤10 days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Send WhatsApp when client due date is within 10 days" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: settings.dueDateAlertEnabled,
              onCheckedChange: (v) => handleToggle("dueDateAlertEnabled", v),
              "data-ocid": "settings.due_date_alert.switch",
              style: {
                // @ts-ignore
                "--switch-checked-bg": "var(--theme-primary, #6B1A2B)"
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: "Filing Status Update" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Notify when ITR filing status changes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: settings.filingStatusAlertEnabled,
              onCheckedChange: (v) => handleToggle("filingStatusAlertEnabled", v),
              "data-ocid": "settings.filing_status_alert.switch"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: "Document Ready" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Notify when documents are ready for handover" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: settings.documentReadyAlertEnabled,
              onCheckedChange: (v) => handleToggle("documentReadyAlertEnabled", v),
              "data-ocid": "settings.document_ready_alert.switch"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "shadow-sm border",
        "data-ocid": "settings.notification_log.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Bell,
                  {
                    className: "w-5 h-5",
                    style: { color: "var(--theme-gold, #C9A44C)" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardTitle,
                  {
                    className: "text-base",
                    style: { color: "var(--theme-primary, #6B1A2B)" },
                    children: "Notification History"
                  }
                )
              ] }),
              notifLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: handleClearLogs,
                  className: "text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5",
                  "data-ocid": "settings.clear_log.button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                    "Clear Log"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "All queued and sent WhatsApp notifications appear here" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: notifLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-10 text-center gap-2",
              "data-ocid": "settings.notification_log.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-8 h-8 text-gray-300" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No notifications queued yet." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-300", children: "Notifications will appear here when due dates approach." })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { "data-ocid": "settings.notification_log.table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Client" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mobile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Event" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Message" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Timestamp" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: notifLogs.slice().reverse().map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `settings.notification_log.item.${idx + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: log.clientName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-gray-500 font-mono text-xs", children: log.mobile }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-xs px-2 py-0.5 rounded-full font-medium",
                      style: {
                        background: "rgba(201,164,76,0.15)",
                        color: "#92400e"
                      },
                      children: log.event
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TableCell,
                    {
                      className: "max-w-xs truncate text-xs text-gray-600",
                      title: log.message,
                      children: log.message
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(log.status)}`,
                      children: log.status
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-gray-500 whitespace-nowrap", children: formatTimestamp(log.timestamp) })
                ]
              },
              log.id
            )) })
          ] }) }) })
        ]
      }
    )
  ] });
}
export {
  SettingsPage as default
};
