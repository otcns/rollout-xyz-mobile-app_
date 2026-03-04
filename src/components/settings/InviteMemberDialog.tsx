import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedTeam } from "@/contexts/TeamContext";
import { useTeamPlan } from "@/hooks/useTeamPlan";
import { useIsMobile } from "@/hooks/use-mobile";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobTitleSelect } from "@/components/ui/JobTitleSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

const roleLabelMap: Record<string, string> = {
  team_owner: "Team Owner",
  manager: "Manager",
  artist: "Artist",
  guest: "Guest",
};

const roleDescriptions: Record<string, string> = {
  manager: "Can view and edit all artists on the team.",
  artist: "Limited access to assigned artists only.",
  guest: "View-only. Ideal for PR, videographers, and collaborators.",
};

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const { user } = useAuth();
  const { selectedTeamId: teamId } = useSelectedTeam();
  const { limits, seatLimit } = useTeamPlan();
  const isMobile = useIsMobile();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: memberCount = 0 } = useQuery({
    queryKey: ["team-member-count", teamId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("team_memberships")
        .select("*", { count: "exact", head: true })
        .eq("team_id", teamId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!teamId,
  });

  const [inviteRole, setInviteRole] = useState<string>("manager");
  const [addToStaff, setAddToStaff] = useState(false);
  const [staffEmploymentType, setStaffEmploymentType] = useState("w2");
  const [jobTitle, setJobTitle] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createInvite = useMutation({
    mutationFn: async (role: string) => {
      const { data, error } = await (supabase as any)
        .from("invite_links")
        .insert({
          team_id: teamId!,
          invited_by: user!.id,
          role: role as any,
          add_to_staff: addToStaff,
          staff_employment_type: addToStaff ? staffEmploymentType : null,
          invitee_job_title: jobTitle || null,
        })
        .select("token")
        .single();
      if (error) throw error;
      return data.token;
    },
    onSuccess: (token) => {
      const link = `https://app.rollout.cc/join/${token}`;
      setGeneratedLink(link);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create invite"),
  });

  const handleCreateInvite = () => {
    if (!limits.canInviteMembers) { setUpgradeOpen(true); return; }
    if (memberCount >= seatLimit) {
      toast.error(`You've reached your seat limit (${seatLimit}). Upgrade for more seats.`);
      setUpgradeOpen(true);
      return;
    }
    setCopied(false);
    setGeneratedLink(null);
    createInvite.mutate(inviteRole);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedLink(null);
    setCopied(false);
    setInviteRole("manager");
    setAddToStaff(false);
    setStaffEmploymentType("w2");
    setJobTitle("");
  };

  // ── Shared form content ──────────────────────────────────────────────────
  const formContent = !generatedLink ? (
    <div className="space-y-4">
      {/* Role */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Role</Label>
        <Select value={inviteRole} onValueChange={setInviteRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="artist">Artist</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{roleDescriptions[inviteRole]}</p>
      </div>

      {/* Job Title */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Job Title</Label>
        <JobTitleSelect value={jobTitle} onChange={setJobTitle} />
      </div>

      {/* Add to Staff */}
      <div className="rounded-lg border border-border p-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Add to Staff</p>
            <p className="text-xs text-muted-foreground">Track employment &amp; payroll info</p>
          </div>
          <Switch checked={addToStaff} onCheckedChange={setAddToStaff} />
        </div>
        {addToStaff && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs text-muted-foreground">Employment Type</Label>
            <Select value={staffEmploymentType} onValueChange={setStaffEmploymentType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w2">W-2 Employee</SelectItem>
                <SelectItem value="1099">1099 Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button
        className="w-full"
        onClick={handleCreateInvite}
        disabled={createInvite.isPending}
      >
        {createInvite.isPending ? "Generating…" : "Generate Link"}
      </Button>
    </div>
  ) : (
    // ── Generated link step ──────────────────────────────────────────────
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-normal truncate">{generatedLink}</span>
        </div>
        <Button className="w-full gap-2" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Invite Link"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Will be added as{" "}
        <span className="font-semibold text-foreground">{roleLabelMap[inviteRole] ?? inviteRole}</span>.
        {" "}Link expires in 7 days.
      </p>
      <Button variant="outline" className="w-full" onClick={handleClose}>
        Done
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
          <DrawerContent>
            <DrawerHeader className="text-left px-5 pt-5 pb-3">
              <DrawerTitle className="text-xl">Invite a team member</DrawerTitle>
              <DrawerDescription className="text-sm mt-0.5">
                Generate a shareable invite link. It expires in 7 days.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-0">
              {formContent}
            </div>
          </DrawerContent>
        </Drawer>
        <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Team invites" />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              Generate a shareable invite link. It expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">{formContent}</div>
        </DialogContent>
      </Dialog>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Team invites" />
    </>
  );
}
