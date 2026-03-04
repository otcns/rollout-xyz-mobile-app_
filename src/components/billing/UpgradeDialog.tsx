import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PLAN_TIERS, ICON_TIERS } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";
import { useSelectedTeam } from "@/contexts/TeamContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { toast } from "sonner";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function UpgradeDialog({ open, onOpenChange, feature }: UpgradeDialogProps) {
  const { selectedTeamId } = useSelectedTeam();
  const [loading, setLoading] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleUpgrade = async (tier: string) => {
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier, team_id: selectedTeamId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  const description = feature
    ? `${feature} is available on the Icon plan. Upgrade to unlock all features including team collaboration.`
    : "Unlock unlimited artists, tasks, team members, splits, and more with Icon.";

  const planCards = (
    <div className="space-y-3">
      {ICON_TIERS.map((tierKey) => {
        const tier = PLAN_TIERS[tierKey];
        return (
          <div
            key={tierKey}
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-foreground/20 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {tier.name} {tier.seats}
              </p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-base font-semibold text-foreground whitespace-nowrap">
                ${tier.price}/mo
              </span>
              <Button
                size="sm"
                className="shrink-0"
                onClick={() => handleUpgrade(tierKey)}
                disabled={loading !== null}
              >
                {loading === tierKey ? "Loading…" : "Start Trial"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left px-5 pt-5 pb-2">
            <DrawerTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 shrink-0" />
              Upgrade to Icon
            </DrawerTitle>
            <DrawerDescription className="text-sm mt-1">
              {description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-5 pb-2 space-y-3">
            {planCards}
          </div>

          <p className="text-xs text-muted-foreground text-center px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            All plans include a 30-day free trial. Cancel anytime.
          </p>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Upgrade to Icon
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {planCards}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          All plans include a 30-day free trial. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
