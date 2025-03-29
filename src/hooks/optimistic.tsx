import { invariant } from "@/lib/invariant";
import { createContext, useContext, useOptimistic } from "react";

export function createOptimisticContext<T>() {
  type ContextType = {
    optimistic: T[];
    addOptimistic: (_: T) => void;
  };

  const Context = createContext<ContextType | undefined>(undefined);

  function OptimisticProvider({ children, items }: { children: React.ReactNode; items: T[] }) {
    const [optimistic, addOptimistic] = useOptimistic(items, (state: T[], newItem: T) => {
      return [...state, newItem];
    });

    return <Context value={{ optimistic, addOptimistic }}>{children}</Context>;
  }

  function useOptimisticContext() {
    const context = useContext(Context);
    invariant(context, "Context must be used within provider");
    return context;
  }

  return { OptimisticProvider, useOptimisticContext };
}
