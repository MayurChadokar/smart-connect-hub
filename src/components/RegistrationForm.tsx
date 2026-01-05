import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Phone, Mail, Users, Building2, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  registrationSchema,
  RegistrationFormData,
  DEPARTMENTS,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/validations";
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
import { FileUpload } from "@/components/ui/file-upload";

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const validatePhoto = () => {
    if (!photoFile) {
      setPhotoError("Please upload a photo");
      return false;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(photoFile.type)) {
      setPhotoError("Only JPG and PNG files are allowed");
      return false;
    }
    if (photoFile.size > MAX_FILE_SIZE) {
      setPhotoError("File size must be less than 2MB");
      return false;
    }
    setPhotoError("");
    return true;
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `registrations/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("registration-photos")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error("Failed to upload photo");
    }

    const { data } = supabase.storage
      .from("registration-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!validatePhoto()) return;

    setIsSubmitting(true);

    try {
      // Upload photo first
      const photoUrl = await uploadPhoto(photoFile!);

      // Insert registration data
      const { error } = await supabase.from("registrations").insert({
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        email: data.email,
        gender: data.gender,
        department: data.department,
        address: data.address,
        photo_url: photoUrl,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Registration submitted successfully!");
      
      // Reset form after success
      setTimeout(() => {
        reset();
        setPhotoFile(null);
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to submit registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Registration Successful!
        </h2>
        <p className="text-muted-foreground">
          Thank you for registering. We'll be in touch soon.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Full Name
          </Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            {...register("fullName")}
            className="input-focus"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobileNumber" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Mobile Number
          </Label>
          <Input
            id="mobileNumber"
            placeholder="Enter 10-digit mobile number"
            {...register("mobileNumber")}
            className="input-focus"
          />
          {errors.mobileNumber && (
            <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="input-focus"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Gender
          </Label>
          <Select onValueChange={(value) => setValue("gender", value as any)}>
            <SelectTrigger className="input-focus">
              <SelectValue placeholder="Select gender" />
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

        {/* Department */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Department
          </Label>
          <Select onValueChange={(value) => setValue("department", value)}>
            <SelectTrigger className="input-focus">
              <SelectValue placeholder="Select department" />
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

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Address
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            rows={3}
            {...register("address")}
            className="input-focus resize-none"
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 mb-3">
            Upload Photo
          </Label>
          <FileUpload
            value={photoFile}
            onChange={setPhotoFile}
            error={photoError}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full btn-primary h-12 text-base font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Registration"
        )}
      </Button>
    </form>
  );
}
