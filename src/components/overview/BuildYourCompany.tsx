import { useState } from "react";
import { Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COMPANY_TYPES = [
  {
    value: "label",
    label: "Record Label",
    description: "Sign, develop, and release music for artists",
  },
  {
    value: "distribution",
    label: "Distribution",
    description: "Distribute and deliver music to platforms and retailers",
  },
  {
    value: "management",
    label: "Management",
    description: "Manage careers, bookings, and strategy for artists",
  },
  {
    value: "publishing",
    label: "Publishing",
    description: "Administer songwriting rights and collect royalties",
  },
  {
    value: "multi_service",
    label: "Multi-Service",
    description: "Operate across multiple areas of the music business",
  },
];

interface BuildYourCompanyProps {
  teamId: string;
  onComplete: () => void;
}

export function BuildYourCompany({ teamId, onComplete }: BuildYourCompanyProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("teams")
      .update({ company_type: selected } as any)
      .eq("id", teamId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Company type saved!");
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-lg"
      >
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Build Your Company</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tell us what kind of company you are so we can tailor your dashboard and tools to match your workflow.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
      >
        {COMPANY_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelected(type.value)}
            className={cn(
              "relative text-left rounded-xl border-2 p-4 transition-all duration-200",
              "hover:border-primary/50 hover:bg-accent/50",
              selected === type.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            {selected === type.value && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <p className="font-semibold text-sm text-foreground">{type.label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{type.description}</p>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!selected || saving}
          className="px-8"
        >
          {saving ? "Saving..." : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
}
