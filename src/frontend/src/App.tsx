import { Toaster } from "@/components/ui/sonner";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { seedData, storage } from "./data/storage";
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

export default function App() {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const initialPageSet = useRef(false);

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
