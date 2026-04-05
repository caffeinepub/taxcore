import { Toaster } from "@/components/ui/sonner";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initialize, seedData, storage } from "./data/storage";
import type { Client, Page, User } from "./types";

// Lazy load all pages for faster initial load
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ClientMasterPage = lazy(() => import("./pages/ClientMasterPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const WorkProcessingPage = lazy(() => import("./pages/WorkProcessingPage"));
const OutwardBillingPage = lazy(() => import("./pages/OutwardBillingPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const ExportPage = lazy(() => import("./pages/ExportPage"));
const SuperAdminPage = lazy(() => import("./pages/SuperAdminPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 rounded-full border-2 border-[#6B1A2B] border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Full-screen loading state shown while data is being loaded from canister.
 */
function AppLoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: "#F7F4EE" }}
      data-ocid="app.loading_state"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "#8B1A1A", color: "#C9A84C" }}
        >
          📊
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            color: "#8B1A1A",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          TaxCore
        </h1>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "#C9A84C", letterSpacing: "0.18em" }}
        >
          ITR Workflow &amp; Status Tracker
        </p>
        {/* Spinner */}
        <div className="flex items-center gap-2 mt-2">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#8B1A1A", borderTopColor: "transparent" }}
          />
          <span className="text-sm text-gray-500">Loading your data…</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  const initialPageSet = useRef(false);

  // Initialize storage from canister on mount
  useEffect(() => {
    initialize()
      .then(() => {
        // After canister load, refresh current user from storage
        // (in case users array was updated from canister)
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
          // Verify user still exists in the canister-loaded users list
          const users = storage.getUsers();
          const freshUser = users.find((u) => u.id === currentUser.id);
          if (freshUser) {
            setUser(freshUser);
            storage.setCurrentUser(freshUser);
          }
        }
        setStorageReady(true);
      })
      .catch(() => {
        // Even if canister load fails, show app with localStorage data
        setStorageReady(true);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      initialPageSet.current = false;
      return;
    }
    if (initialPageSet.current) return;
    initialPageSet.current = true;

    if (user.role === "Super Admin") {
      setCurrentPage("super-admin");
    } else if (user.role === "Staff") {
      setCurrentPage("clients");
    } else {
      setCurrentPage("dashboard");
      seedData();
    }
  }, [user]);

  const handleLogin = (u: User) => {
    setUser(u);
    initialPageSet.current = false;
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    setCurrentPage("dashboard");
    setSelectedClient(null);
  };

  const handleNavigate = (page: Page) => {
    if (user?.role === "Super Admin" && page !== "super-admin") return;
    if (
      user?.role === "Staff" &&
      (page === "dashboard" ||
        page === "billing" ||
        page === "user-management" ||
        page === "settings")
    )
      return;
    setCurrentPage(page);
    if (page !== "client-detail") setSelectedClient(null);
  };

  // Show loading screen until canister data is loaded
  if (!storageReady) {
    return (
      <ThemeProvider>
        <AppLoadingScreen />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Suspense fallback={<PageFallback />}>
          <LoginPage onLogin={handleLogin} />
        </Suspense>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    if (user.role === "Super Admin") {
      return <SuperAdminPage />;
    }

    if (currentPage === "client-detail" && selectedClient) {
      return (
        <ClientDetailPage
          client={selectedClient}
          onBack={() => setCurrentPage("clients")}
        />
      );
    }
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage user={user} />;
      case "clients":
        return (
          <ClientMasterPage
            onViewClient={handleViewClient}
            currentUserId={user.id}
          />
        );
      case "work-processing":
        return <WorkProcessingPage user={user} />;
      case "billing":
        return user.role === "Owner" ? (
          <OutwardBillingPage />
        ) : (
          <div className="text-center py-10 text-gray-400">
            Access denied. Owner only.
          </div>
        );
      case "user-management":
        return user.role === "Owner" ? (
          <UserManagementPage />
        ) : (
          <div className="text-center py-10 text-gray-400">
            Access denied. Owner only.
          </div>
        );
      case "export":
        return <ExportPage />;
      case "audit-log":
        return <AuditLogPage user={user} />;
      case "settings":
        return user.role === "Owner" ? (
          <SettingsPage user={user} />
        ) : (
          <div className="text-center py-10 text-gray-400">
            Access denied. Owner only.
          </div>
        );
      default:
        return <DashboardPage user={user} />;
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setCurrentPage("client-detail");
  };

  return (
    <ThemeProvider>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
      </Layout>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
