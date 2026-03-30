import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePoster = (title: string, year: number) => {
  return useQuery({
    queryKey: ["poster", title, year],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("omdb-poster", {
        body: { title, year },
      });
      if (error) throw error;
      return data?.poster as string | null;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
