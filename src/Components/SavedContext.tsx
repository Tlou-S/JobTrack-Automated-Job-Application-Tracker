import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";

export type SavedItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  location: string;
};

type SavedContextType = {
  savedItems: SavedItem[];
  loading: boolean;
  toggleSaved: (productId: string | number) => Promise<void>;
  removeSaved: (productId: string | number) => Promise<void>;
  isSaved: (productId: string | number) => boolean;
  refresh: () => Promise<void>;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export { SavedContext };

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the current user's favorites + their product details
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSavedItems([]);
        return;
      }

      // 1. Get favorite rows
      const { data: favRows, error: favError } = await supabase
        .from("Favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (favError) throw favError;

      const productIds = (favRows ?? []).map((r) => r.product_id);
      if (productIds.length === 0) {
        setSavedItems([]);
        return;
      }

      // 2. Fetch the matching products
      const { data: productRows, error: prodError } = await supabase
        .from("Products")
        .select("id, name, price, image_url, city, province")
        .in("id", productIds);

      if (prodError) throw prodError;

      const mapped: SavedItem[] = (productRows ?? []).map((p: any) => ({
        id: String(p.id),
        name: p.name ?? "",
        price: Number(p.price ?? 0),
        imageUrl: p.image_url ?? "",
        location: [p.city, p.province].filter(Boolean).join(", "),
      }));

      setSavedItems(mapped);
    } catch (err) {
      console.error("Failed to load saved items:", err);
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once on mount + whenever auth state changes
  useEffect(() => {
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const isSaved = useCallback(
    (productId: string | number) =>
      savedItems.some((i) => i.id === String(productId)),
    [savedItems]
  );

  const toggleSaved = useCallback(
    async (productId: string | number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const pid = String(productId);

      if (isSaved(pid)) {
        await removeSaved(pid);
      } else {
        const { error } = await supabase
          .from("Favorites")
          .insert({ user_id: user.id, product_id: pid });
        if (error) {
          console.error("Failed to save:", error);
          return;
        }
        await refresh();
      }
    },
    [isSaved, refresh]
  );

  const removeSaved = useCallback(
    async (productId: string | number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const pid = String(productId);

      const { error } = await supabase
        .from("Favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", pid);

      if (error) {
        console.error("Failed to remove:", error);
        return;
      }

      setSavedItems((prev) => prev.filter((i) => i.id !== pid));
    },
    []
  );

  return (
    <SavedContext.Provider
      value={{ savedItems, loading, toggleSaved, removeSaved, isSaved, refresh }}
    >
      {children}
    </SavedContext.Provider>
  );
}