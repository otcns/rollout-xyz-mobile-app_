import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedTeam } from "@/contexts/TeamContext";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isToday, isTomorrow, isPast, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Plus, Music2, Wallet } from "lucide-react";
import { cn, parseDateFromText } from "@/lib/utils";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useCallback, useState, useMemo } from "react";
import { toast } from "sonner";
import { ItemEditor } from "@/components/ui/ItemEditor";
import { useArtists } from "@/hooks/useArtists";

export default function MyWork() {
  const { user } = useAuth();
  const { selectedTeamId: teamId } = useSelectedTeam();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [expenseAmount, setExpenseAmount] = useState<number | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);

  const { data: artists = [] } = useArtists(teamId);

  // Fetch budgets for the selected artist
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", selectedArtistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("artist_id", selectedArtistId!);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedArtistId,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["my-work", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, artists(id, name), initiatives(name)")
        .eq("assigned_to", user!.id)
        .eq("is_completed", false)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const toggleComplete = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-work"] }),
  });

  const createTask = useMutation({
    mutationFn: async (params: {
      title: string;
      due_date?: string;
      artist_id?: string;
      expense_amount?: number;
      budget_id?: string;
    }) => {
      if (!teamId || !user?.id) throw new Error("Missing team or user");
      const { error } = await supabase.from("tasks").insert({
        title: params.title,
        team_id: teamId,
        assigned_to: user.id,
        ...(params.due_date ? { due_date: params.due_date } : {}),
        ...(params.artist_id ? { artist_id: params.artist_id } : {}),
        ...(params.expense_amount ? { expense_amount: params.expense_amount } : {}),
      });
      if (error) throw error;

      // If there's an expense and a budget, also create a transaction
      if (params.expense_amount && params.artist_id && params.budget_id) {
        await supabase.from("transactions").insert({
          artist_id: params.artist_id,
          budget_id: params.budget_id,
          amount: params.expense_amount,
          description: params.title,
          type: "expense",
          status: "pending",
          transaction_date: params.due_date || new Date().toISOString().split("T")[0],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-work"] });
      setNewTitle("");
      setSelectedArtistId(null);
      setExpenseAmount(null);
      setBudgetId(null);
      toast.success("Task added");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAddSubmit = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const parsed = parseDateFromText(trimmed);
    createTask.mutate({
      title: parsed.title,
      due_date: parsed.date ? format(parsed.date, "yyyy-MM-dd") : undefined,
      artist_id: selectedArtistId || undefined,
      expense_amount: expenseAmount || undefined,
      budget_id: budgetId || undefined,
    });
  };

  // Build triggers for ItemEditor
  const triggers = useMemo(() => {
    const artistTrigger = {
      char: "@",
      items: artists.map((a: any) => ({
        id: a.id,
        label: a.name,
        icon: <Music2 className="h-3.5 w-3.5 text-muted-foreground" />,
      })),
      onSelect: (item: { id: string; label: string }, currentValue: string) => {
        setSelectedArtistId(item.id);
        // Remove the @query from the text
        return currentValue.replace(/@\S*$/, "").trim();
      },
    };

    const budgetTrigger = {
      char: "$",
      items: selectedArtistId
        ? budgets.map((b: any) => ({
            id: b.id,
            label: `${b.label} — $${b.amount.toLocaleString()}`,
            icon: <Wallet className="h-3.5 w-3.5 text-muted-foreground" />,
          }))
        : [],
      onSelect: (item: { id: string; label: string }, currentValue: string) => {
        // Extract a dollar amount if the user typed $500 etc., otherwise use budget
        const dollarMatch = currentValue.match(/\$(\d[\d,]*\.?\d*)$/);
        if (dollarMatch) {
          const amount = parseFloat(dollarMatch[1].replace(/,/g, ""));
          setExpenseAmount(amount);
          setBudgetId(item.id);
          return currentValue.replace(/\$[\d,]*\.?\d*$/, "").trim();
        }
        // Selected a budget from the list — no amount yet, but link the budget
        setBudgetId(item.id);
        return currentValue.replace(/\$\S*$/, "").trim();
      },
    };

    return [artistTrigger, budgetTrigger];
  }, [artists, budgets, selectedArtistId]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-work"] });
  }, [queryClient]);

  const formatDue = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  const isDueOverdue = (date: string) => {
    const d = new Date(date);
    return isPast(d) && !isToday(d);
  };

  // Find the selected artist name for the pill
  const selectedArtist = artists.find((a: any) => a.id === selectedArtistId);
  const selectedBudget = budgets.find((b: any) => b.id === budgetId);

  return (
    <AppLayout title="My Work">
      <div className="max-w-2xl mx-auto pb-20">
        <h1 className="text-foreground mb-6">My Work</h1>

        <PullToRefresh onRefresh={handleRefresh}>
          {/* Smart task input */}
          <div className="mb-1">
            <div className="flex items-center gap-3">
              <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              <ItemEditor
                value={newTitle}
                onChange={setNewTitle}
                onSubmit={handleAddSubmit}
                onCancel={() => { setNewTitle(""); setSelectedArtistId(null); setExpenseAmount(null); setBudgetId(null); }}
                placeholder="Add a task… use @ for artist, $ for expense"
                autoFocus={false}
                triggers={triggers}
                singleLine
              />
            </div>

            {/* Metadata pills showing parsed context */}
            {(selectedArtist || expenseAmount || budgetId) && (
              <div className="flex items-center gap-2 ml-7 mt-1.5 flex-wrap">
                {selectedArtist && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Music2 className="h-3 w-3" />
                    {selectedArtist.name}
                    <button
                      onClick={() => { setSelectedArtistId(null); setBudgetId(null); setExpenseAmount(null); }}
                      className="ml-0.5 hover:text-foreground"
                    >×</button>
                  </span>
                )}
                {expenseAmount != null && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    ${expenseAmount.toLocaleString()}
                    {selectedBudget && <span className="text-muted-foreground/60">· {selectedBudget.label}</span>}
                    <button
                      onClick={() => { setExpenseAmount(null); setBudgetId(null); }}
                      className="ml-0.5 hover:text-foreground"
                    >×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hint text */}
          {!selectedArtistId && newTitle.includes("$") && (
            <p className="text-[11px] text-muted-foreground/50 ml-7 mt-1">
              Tip: Type @ first to select an artist, then $ to pick from their budgets
            </p>
          )}

          <div className="border-t border-border mt-4" />

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-1">
              <p className="text-base font-medium">All clear</p>
              <p className="text-sm">No tasks right now. Type above to add one.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 py-3 group"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => toggleComplete.mutate(task.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {task.artists && (
                        <button
                          onClick={() => navigate(`/roster/${task.artists.id}`)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {task.artists.name}
                        </button>
                      )}
                      {task.initiatives && (
                        <span className="text-xs text-muted-foreground">
                          {task.artists ? "· " : ""}{task.initiatives.name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={cn(
                          "text-xs",
                          isDueOverdue(task.due_date) ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {task.artists || task.initiatives ? "· " : ""}{formatDue(task.due_date)}
                        </span>
                      )}
                      {task.expense_amount != null && task.expense_amount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          · ${task.expense_amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PullToRefresh>
      </div>
    </AppLayout>
  );
}
