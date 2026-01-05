import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ClipboardList } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SmartReg</span>
          </div>
          <Link to="/admin/login">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Quick & Easy{" "}
              <span className="text-primary">Registration</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Complete your registration in minutes. Fill in your details below
              and upload your photo to get started.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="form-card p-6 md:p-10">
              <RegistrationForm />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SmartReg. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
