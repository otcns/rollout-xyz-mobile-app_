import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Rocket } from "lucide-react";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrialWelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRIAL_FEATURES = [
  "Unlimited artists & tasks",
  "Add team members",
  "Splits & finance tools",
  "A&R pipeline",
  "Team roles & permissions",
];

const FREE_FEATURES = [
  "3 roster artists",
  "10 tasks/month",
  "2 A&R prospects",
];

function TrialSection({ onStartTrial }: { onStartTrial: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" />
        <h2 className="text-lg font-bold leading-tight">Try Rollout free for 30 days</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Get full access to every feature — no credit card required.
      </p>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What's included
        </p>
        <ul className="space-y-2.5">
          {TRIAL_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <Button onClick={onStartTrial} className="h-12 w-full rounded-full font-medium">
          Start My Free Trial
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          All features. 30 days free. No credit card needed.
        </p>
      </div>
    </div>
  );
}

function FreeSection({ onUseFree }: { onUseFree: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/40 p-4">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 shrink-0 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Or continue with the free plan</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        The Rising plan is free forever, but comes with limitations:
      </p>

      <ul className="space-y-2">
        {FREE_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-border bg-background px-3 py-2.5">
        <p className="mb-1 text-xs font-medium text-foreground">🚫 Not included on free plan</p>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          <li>• Team members & collaboration</li>
          <li>• Splits & finance tracking</li>
          <li>• Advanced permissions</li>
        </ul>
      </div>

      <Button variant="outline" onClick={onUseFree} className="h-11 w-full rounded-full">
        Use Free Version
      </Button>
    </div>
  );
}

export function TrialWelcomeDialog({ open, onOpenChange }: TrialWelcomeDialogProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleStartTrial = () => onOpenChange(false);
  const handleUseFree = () => onOpenChange(false);

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[92dvh]">
            <div className="flex flex-col overflow-y-auto">
              <DrawerHeader className="px-6 pb-2 pt-4 text-left">
                <DrawerTitle className="sr-only">Try Rollout free for 30 days</DrawerTitle>
              </DrawerHeader>

              <div
                className="flex flex-col gap-5 px-6"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                <TrialSection onStartTrial={handleStartTrial} />

                <button
                  onClick={handleUseFree}
                  className="min-h-[44px] w-full py-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground touch-manipulation"
                >
                  Use free version
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-2xl overflow-hidden">
          <div className="flex">
            {/* Left — trial offer */}
            <div className="flex-1 p-8">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Try Rollout free for 30 days
                </DialogTitle>
              </DialogHeader>

              <p className="mb-6 text-sm text-muted-foreground">
                Get full access to every feature — no credit card required. See how Rollout can transform how you manage your roster.
              </p>

              <div className="mb-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What's included
                </p>
                <ul className="space-y-2">
                  {TRIAL_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleStartTrial} className="h-11 w-full rounded-lg font-medium">
                Start My Free Trial
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                All features. 30 days free. No credit card needed.
              </p>
            </div>

            {/* Right — free tier */}
            <div className="flex-1 border-l border-border bg-muted/30 p-8">
              <div className="mb-4 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Or continue with the free plan</h3>
              </div>

              <p className="mb-4 text-xs text-muted-foreground">
                The Rising plan is free forever, but comes with limitations:
              </p>

              <ul className="mb-6 space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-4 rounded-lg border border-border bg-background p-3">
                <p className="mb-1 text-xs font-medium text-foreground">🚫 Not included on free plan</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Team members & collaboration</li>
                  <li>• Splits & finance tracking</li>
                  <li>• Advanced permissions</li>
                </ul>
              </div>

              <Button variant="outline" onClick={handleUseFree} className="w-full rounded-lg" size="sm">
                Use Free Version
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
