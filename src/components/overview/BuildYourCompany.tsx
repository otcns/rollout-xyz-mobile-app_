import { useState, useRef } from "react";
import { Check, Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const COMPANY_TYPES = [
  { value: "label", label: "Record Label", description: "Sign, develop, and release music for artists" },
  { value: "distribution", label: "Distribution", description: "Distribute and deliver music to platforms and retailers" },
  { value: "management", label: "Management", description: "Manage careers, bookings, and strategy for artists" },
  { value: "publishing", label: "Publishing", description: "Administer songwriting rights and collect royalties" },
  { value: "multi_service", label: "Multi-Service", description: "Operate across multiple areas of the music business" },
];

const TOTAL_STEPS = 3;

interface BuildYourCompanyProps {
  teamId: string;
  onComplete: () => void;
}

export function BuildYourCompany({ teamId, onComplete }: BuildYourCompanyProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Company type
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Step 3: Details
  const [teamSize, setTeamSize] = useState("1-5");
  const [revenue, setRevenue] = useState("less than $10,000");
  const [artistCount, setArtistCount] = useState("2-5");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${teamId}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    setLogoUrl(url);
    await supabase.from("teams").update({ avatar_url: url }).eq("id", teamId);
    setUploading(false);
  };

  const canGoNext = () => {
    if (step === 1) return !!companyName.trim();
    if (step === 2) return !!selectedType;
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && companyName.trim()) {
      setSaving(true);
      const { error } = await supabase
        .from("teams")
        .update({ name: companyName.trim() } as any)
        .eq("id", teamId);
      setSaving(false);
      if (error) { toast.error(error.message); return; }
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("teams")
      .update({
        company_type: selectedType,
        team_size: teamSize,
        monthly_revenue: revenue,
        artist_count: artistCount,
      } as any)
      .eq("id", teamId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Company setup complete!");
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 w-full">
      {/* Back button */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="self-start flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          {step === 1 && (
            <StepProfile
              companyName={companyName}
              setCompanyName={setCompanyName}
              logoUrl={logoUrl}
              uploading={uploading}
              fileInputRef={fileInputRef}
              onLogoUpload={handleLogoUpload}
            />
          )}
          {step === 2 && (
            <StepType selected={selectedType} setSelected={setSelectedType} />
          )}
          {step === 3 && (
            <StepDetails
              teamSize={teamSize}
              setTeamSize={setTeamSize}
              revenue={revenue}
              setRevenue={setRevenue}
              artistCount={artistCount}
              setArtistCount={setArtistCount}
            />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-8">
            <span className="text-sm text-muted-foreground">{step} of {TOTAL_STEPS}</span>
            {step < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={saving || !canGoNext()}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6"
              >
                {saving ? "Saving..." : "Next"}
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={saving || !canGoNext()}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6"
              >
                {saving ? "Saving..." : "Let's go"}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Step 1: Company Profile ── */
function StepProfile({
  companyName, setCompanyName, logoUrl, uploading, fileInputRef, onLogoUpload,
}: {
  companyName: string; setCompanyName: (v: string) => void;
  logoUrl: string | null; uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">Build Your Company</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Let's set up your company profile so your team and dashboard feel like home.
      </p>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mx-auto mb-2 h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center relative group hover:border-primary/50 transition-colors overflow-hidden"
      >
        {logoUrl ? (
          <>
            <img src={logoUrl} alt="Company logo" className="h-full w-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <Pencil className="h-4 w-4 text-white" />
            </div>
          </>
        ) : (
          <Pencil className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </button>
      <p className="text-xs text-muted-foreground text-center mb-6">
        {uploading ? "Uploading..." : "Add your company logo"}
      </p>

      <div>
        <Label className="font-semibold text-sm mb-2 block">What's your company name?</Label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. My Company"
          autoFocus
        />
      </div>
    </>
  );
}

/* ── Step 2: Company Type ── */
function StepType({ selected, setSelected }: { selected: string | null; setSelected: (v: string) => void }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">What type of company are you?</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        We'll tailor your dashboard and tools to match your workflow.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </>
  );
}

/* ── Step 3: Company Details ── */
function StepDetails({
  teamSize, setTeamSize, revenue, setRevenue, artistCount, setArtistCount,
}: {
  teamSize: string; setTeamSize: (v: string) => void;
  revenue: string; setRevenue: (v: string) => void;
  artistCount: string; setArtistCount: (v: string) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">Tell us more about your company</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        A few more details so we can tailor your experience.
      </p>
      <div className="space-y-5">
        <div>
          <Label className="font-semibold text-sm mb-2 block">What is your team size?</Label>
          <Select value={teamSize} onValueChange={setTeamSize}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1-5">1-5</SelectItem>
              <SelectItem value="6-10">6-10</SelectItem>
              <SelectItem value="11-25">11-25</SelectItem>
              <SelectItem value="25+">25+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-semibold text-sm mb-2 block">What is your company's monthly revenue?</Label>
          <Select value={revenue} onValueChange={setRevenue}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="less than $10,000">less than $10,000</SelectItem>
              <SelectItem value="$10,000 - $50,000">$10,000 - $50,000</SelectItem>
              <SelectItem value="$50,000 - $100,000">$50,000 - $100,000</SelectItem>
              <SelectItem value="$100,000+">$100,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-semibold text-sm mb-2 block">How many artists does your company manage?</Label>
          <Select value={artistCount} onValueChange={setArtistCount}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2-5">2-5</SelectItem>
              <SelectItem value="6-10">6-10</SelectItem>
              <SelectItem value="10+">10+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
