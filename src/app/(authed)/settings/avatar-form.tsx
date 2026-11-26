"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user";
import type { User } from "@/db/zod";
import { AVATAR_ACCEPT, AVATAR_MAX_BYTES } from "@/lib/avatar-limits";
import { LoaderIcon } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { removeAvatarAction, uploadAvatarAction } from "./actions";

export function AvatarForm({ user }: { user: User }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Image must be under 8MB");
      return;
    }
    const formData = new FormData();
    formData.set("image", file);
    startTransition(async () => {
      const res = await uploadAvatarAction(formData);
      if (res.error) toast.error(res.error);
      else toast.success("Profile photo updated");
    });
  }

  function onRemove() {
    startTransition(async () => {
      await removeAvatarAction();
      toast.success("Profile photo removed");
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar user={user} className="size-20 text-xl" />
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
            <LoaderIcon className="animate-spin" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPT.join(",")}
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {user.image ? "Change photo" : "Upload photo"}
        </Button>
        {user.image && (
          <Button type="button" variant="ghost" disabled={pending} onClick={onRemove}>
            Remove photo
          </Button>
        )}
        <p className="text-muted-foreground text-xs">JPEG, PNG, WebP or HEIC, up to 8MB</p>
      </div>
    </div>
  );
}
