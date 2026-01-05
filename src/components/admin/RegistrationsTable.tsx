import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DEPARTMENTS } from "@/lib/validations";
import type { Registration } from "@/types/registration";

interface RegistrationsTableProps {
  registrations: Registration[];
  isLoading: boolean;
  onView: (registration: Registration) => void;
  onEdit: (registration: Registration) => void;
  onDelete: (id: string, photoUrl: string) => void;
  onExport: () => void;
}

const ITEMS_PER_PAGE = 10;

export function RegistrationsTable({
  registrations,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onExport,
}: RegistrationsTableProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePhotoUrl, setDeletePhotoUrl] = useState<string>("");

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.full_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.mobile_number.includes(search) ||
      reg.email.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || reg.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRegistrations = filteredRegistrations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleDeleteClick = (id: string, photoUrl: string) => {
    setDeleteId(id);
    setDeletePhotoUrl(photoUrl);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId, deletePhotoUrl);
      setDeleteId(null);
      setDeletePhotoUrl("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 input-focus"
            />
          </div>
          <Select
            value={departmentFilter}
            onValueChange={(value) => {
              setDepartmentFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || departmentFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <Button onClick={onExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="form-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Mobile</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRegistrations.map((reg, index) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row-hover border-b"
                    >
                      <TableCell>
                        <img
                          src={reg.photo_url}
                          alt={reg.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{reg.mobile_number}</TableCell>
                      <TableCell className="hidden lg:table-cell">{reg.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                          {reg.department}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(reg.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(reg)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(reg)}
                            className="hover:bg-warning/10 hover:text-warning"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(reg.id, reg.photo_url)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredRegistrations.length)} of{" "}
              {filteredRegistrations.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this registration? This action cannot be undone
              and will also remove the associated photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
