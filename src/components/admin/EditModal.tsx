import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrationSchema, RegistrationFormData, DEPARTMENTS } from "@/lib/validations";
import type { Registration } from "@/types/registration";

interface EditModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Registration>) => Promise<void>;
}

export function EditModal({ registration, isOpen, onClose, onSave }: EditModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  useEffect(() => {
    if (registration) {
      reset({
        fullName: registration.full_name,
        mobileNumber: registration.mobile_number,
        email: registration.email,
        gender: registration.gender,
        department: registration.department,
        address: registration.address,
      });
    }
  }, [registration, reset]);

  const onSubmit = async (data: RegistrationFormData) => {
    if (!registration) return;

    setIsSaving(true);
    try {
      await onSave(registration.id, {
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        email: data.email,
        gender: data.gender,
        department: data.department,
        address: data.address,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!registration) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-card rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Edit Registration</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register("fullName")} className="input-focus" />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input id="mobileNumber" {...register("mobileNumber")} className="input-focus" />
                    {errors.mobileNumber && (
                      <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      defaultValue={registration.gender}
                      onValueChange={(value) => setValue("gender", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-destructive">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} className="input-focus" />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    defaultValue={registration.department}
                    onValueChange={(value) => setValue("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-destructive">{errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    {...register("address")}
                    className="input-focus resize-none"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
