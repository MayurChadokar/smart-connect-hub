import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/admin/StatsCards";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { ViewModal } from "@/components/admin/ViewModal";
import { EditModal } from "@/components/admin/EditModal";
import type { Registration } from "@/types/registration";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewRegistration, setViewRegistration] = useState<Registration | null>(null);
  const [editRegistration, setEditRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchRegistrations();
    }
  }, [user, isAdmin]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data as Registration[]);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split("/");
      const filePath = urlParts.slice(-2).join("/");

      // Delete from storage
      await supabase.storage.from("registration-photos").remove([filePath]);

      // Delete from database
      const { error } = await supabase.from("registrations").delete().eq("id", id);

      if (error) throw error;

      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Registration deleted successfully");
    } catch (error: any) {
      console.error("Error deleting registration:", error);
      toast.error("Failed to delete registration");
    }
  };

  const handleUpdate = async (id: string, data: Partial<Registration>) => {
    try {
      const { error } = await supabase.from("registrations").update(data).eq("id", id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      toast.success("Registration updated successfully");
    } catch (error: any) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration");
    }
  };

  const handleExport = () => {
    const exportData = registrations.map((reg) => ({
      Name: reg.full_name,
      Mobile: reg.mobile_number,
      Email: reg.email,
      Gender: reg.gender,
      Department: reg.department,
      Address: reg.address,
      "Registered Date": new Date(reg.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `registrations-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Export completed");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  // Calculate stats
  const today = new Date().toDateString();
  const todaySubmissions = registrations.filter(
    (r) => new Date(r.created_at).toDateString() === today
  ).length;
  const uniqueDepartments = new Set(registrations.map((r) => r.department)).size;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">SmartReg</span>
              <span className="text-sm text-muted-foreground ml-2">Admin</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and view all registration submissions
          </p>
        </motion.div>

        <StatsCards
          totalSubmissions={registrations.length}
          todaySubmissions={todaySubmissions}
          departments={uniqueDepartments}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            All Registrations
          </h2>
          <RegistrationsTable
            registrations={registrations}
            isLoading={isLoading}
            onView={setViewRegistration}
            onEdit={setEditRegistration}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        </motion.div>
      </main>

      {/* Modals */}
      <ViewModal
        registration={viewRegistration}
        isOpen={!!viewRegistration}
        onClose={() => setViewRegistration(null)}
      />
      <EditModal
        registration={editRegistration}
        isOpen={!!editRegistration}
        onClose={() => setEditRegistration(null)}
        onSave={handleUpdate}
      />
    </div>
  );
}
