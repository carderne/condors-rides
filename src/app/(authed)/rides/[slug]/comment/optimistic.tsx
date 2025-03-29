"use client";

import type { CommentHydrated } from "@/dal/comments";
import { createOptimisticContext } from "@/hooks/optimistic";

export const { OptimisticProvider, useOptimisticContext } =
  createOptimisticContext<CommentHydrated>();
