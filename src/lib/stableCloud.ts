import type { StableState } from "@/types/bloodline";
import { createClient } from "@/utils/supabase/client";

type StableRow = {
  id: string;
  data: StableState;
  updated_at: string;
};

const TABLE_NAME = "stables";

export async function loadCloudStable(stableId: string): Promise<StableState | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id,data,updated_at")
    .eq("id", stableId)
    .maybeSingle<StableRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.data;
}

export async function saveCloudStable(stableId: string, state: StableState) {
  const supabase = createClient();
  const { error } = await supabase.from(TABLE_NAME).upsert({
    id: stableId,
    data: state,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
