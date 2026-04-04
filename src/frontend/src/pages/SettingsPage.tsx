import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageSquare,
  Settings,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { onStorageChange, storage } from "../data/storage";
import type { NotificationLog, User, WhatsAppSettings } from "../types";

const DEFAULT_SETTINGS: WhatsAppSettings = {
  provider: "Twilio",
  apiKey: "",
  senderPhone: "",
  dueDateAlertEnabled: true,
  filingStatusAlertEnabled: false,
  documentReadyAlertEnabled: false,
};

const PROVIDERS = ["Twilio", "Wati", "Interakt", "Other"];

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  // Access guard
  if (user.role !== "Owner") {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-3"
        data-ocid="settings.error_state"
      >
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-lg font-semibold text-gray-600">Access Denied</p>
        <p className="text-sm text-gray-400">
          This page is available to Owners only.
        </p>
      </div>
    );
  }

  return <SettingsContent user={user} />;
}

function SettingsContent({ user: _user }: SettingsPageProps) {
  const [settings, setSettings] = useState<WhatsAppSettings>(
    () => storage.getWhatsAppSettings() ?? { ...DEFAULT_SETTINGS },
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifLogs, setNotifLogs] = useState<NotificationLog[]>(() =>
    storage.getNotificationLogs(),
  );

  const refreshLogs = useCallback(() => {
    setNotifLogs(storage.getNotificationLogs());
  }, []);

  useEffect(() => {
    const unsub = onStorageChange(refreshLogs);
    return unsub;
  }, [refreshLogs]);

  const handleSaveConfig = () => {
    setIsSaving(true);
    // Validate phone
    if (
      settings.senderPhone &&
      !/^\+\d{7,15}$/.test(settings.senderPhone) &&
      !/^\d{10}$/.test(settings.senderPhone)
    ) {
      toast.error("Invalid phone number", {
        description: "Use +91XXXXXXXXXX or 10-digit format.",
      });
      setIsSaving(false);
      return;
    }
    storage.saveWhatsAppSettings(settings);
    toast.success("Settings saved", {
      description: "WhatsApp configuration updated successfully.",
    });
    setIsSaving(false);
  };

  const handleToggle = (
    field: keyof Pick<
      WhatsAppSettings,
      | "dueDateAlertEnabled"
      | "filingStatusAlertEnabled"
      | "documentReadyAlertEnabled"
    >,
    value: boolean,
  ) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    storage.saveWhatsAppSettings(updated);
    toast.success("Preference updated");
  };

  const handleClearLogs = () => {
    storage.clearNotificationLogs();
    toast.success("Notification log cleared");
  };

  const hasApiKey = settings.apiKey.trim().length > 0;

  const statusColor = (status: NotificationLog["status"]) => {
    if (status === "Sent") return "bg-emerald-100 text-emerald-700";
    if (status === "Failed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(107,26,43,0.1)" }}
        >
          <Settings className="w-5 h-5" style={{ color: "#6B1A2B" }} />
        </div>
        <div>
          <h2
            className="text-xl font-semibold"
            style={{
              color: "#6B1A2B",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Notification Settings
          </h2>
          <p className="text-sm text-gray-500">
            Configure WhatsApp alerts and notification preferences
          </p>
        </div>
      </div>

      {/* Section 1: WhatsApp API Configuration */}
      <Card className="shadow-sm border" data-ocid="settings.panel">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: "#C9A44C" }} />
              <CardTitle className="text-base" style={{ color: "#6B1A2B" }}>
                WhatsApp Notification Setup
              </CardTitle>
            </div>
            {hasApiKey ? (
              <Badge
                className="flex items-center gap-1 text-xs"
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                  border: "none",
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                API Key Configured
              </Badge>
            ) : (
              <Badge
                className="flex items-center gap-1 text-xs"
                style={{
                  background: "#fef9c3",
                  color: "#713f12",
                  border: "none",
                }}
              >
                <AlertCircle className="w-3 h-3" />
                API Key Not Set — Notifications will queue
              </Badge>
            )}
          </div>
          <CardDescription className="mt-2">
            <div
              className="flex items-start gap-2 p-3 rounded-md text-sm"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                No API key yet? Configure your provider details now and add your
                API key when ready. Notifications will queue automatically and
                can be sent once the API key is configured.
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-sm font-medium">
                Provider
              </Label>
              <Select
                value={settings.provider}
                onValueChange={(v) =>
                  setSettings((s) => ({ ...s, provider: v }))
                }
              >
                <SelectTrigger
                  id="provider"
                  data-ocid="settings.provider.select"
                >
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sender Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="senderPhone" className="text-sm font-medium">
                Sender Phone (WhatsApp Business Number)
              </Label>
              <Input
                id="senderPhone"
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={settings.senderPhone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, senderPhone: e.target.value }))
                }
                data-ocid="settings.sender_phone.input"
              />
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter API key when available"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, apiKey: e.target.value }))
                }
                className="pr-10"
                data-ocid="settings.api_key.input"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-ocid="settings.toggle_api_key.button"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Keep your API key secure. It will be stored locally in your
              browser.
            </p>
          </div>

          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="mt-2"
            style={{ background: "#6B1A2B", color: "#fff" }}
            data-ocid="settings.save.button"
          >
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Notification Preferences */}
      <Card className="shadow-sm border" data-ocid="settings.preferences.panel">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: "#C9A44C" }} />
            <CardTitle className="text-base" style={{ color: "#6B1A2B" }}>
              Notification Triggers
            </CardTitle>
          </div>
          <CardDescription>
            Choose which events trigger a WhatsApp notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Due Date Alert */}
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Due Date Alert (≤10 days)
              </p>
              <p className="text-xs text-gray-500">
                Send WhatsApp when client due date is within 10 days
              </p>
            </div>
            <Switch
              checked={settings.dueDateAlertEnabled}
              onCheckedChange={(v) => handleToggle("dueDateAlertEnabled", v)}
              data-ocid="settings.due_date_alert.switch"
              style={{
                // @ts-ignore
                "--switch-checked-bg": "#6B1A2B",
              }}
            />
          </div>

          {/* Filing Status Alert */}
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Filing Status Update
              </p>
              <p className="text-xs text-gray-500">
                Notify when ITR filing status changes
              </p>
            </div>
            <Switch
              checked={settings.filingStatusAlertEnabled}
              onCheckedChange={(v) =>
                handleToggle("filingStatusAlertEnabled", v)
              }
              data-ocid="settings.filing_status_alert.switch"
            />
          </div>

          {/* Document Ready Alert */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Document Ready
              </p>
              <p className="text-xs text-gray-500">
                Notify when documents are ready for handover
              </p>
            </div>
            <Switch
              checked={settings.documentReadyAlertEnabled}
              onCheckedChange={(v) =>
                handleToggle("documentReadyAlertEnabled", v)
              }
              data-ocid="settings.document_ready_alert.switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Notification Log */}
      <Card
        className="shadow-sm border"
        data-ocid="settings.notification_log.panel"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: "#C9A44C" }} />
              <CardTitle className="text-base" style={{ color: "#6B1A2B" }}>
                Notification History
              </CardTitle>
            </div>
            {notifLogs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLogs}
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
                data-ocid="settings.clear_log.button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Log
              </Button>
            )}
          </div>
          <CardDescription>
            All queued and sent WhatsApp notifications appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifLogs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center gap-2"
              data-ocid="settings.notification_log.empty_state"
            >
              <MessageSquare className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">
                No notifications queued yet.
              </p>
              <p className="text-xs text-gray-300">
                Notifications will appear here when due dates approach.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="settings.notification_log.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifLogs
                    .slice()
                    .reverse()
                    .map((log, idx) => (
                      <TableRow
                        key={log.id}
                        data-ocid={`settings.notification_log.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {log.clientName}
                        </TableCell>
                        <TableCell className="text-gray-500 font-mono text-xs">
                          {log.mobile}
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: "rgba(201,164,76,0.15)",
                              color: "#92400e",
                            }}
                          >
                            {log.event}
                          </span>
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate text-xs text-gray-600"
                          title={log.message}
                        >
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
