"use client";

import { useOrgModal } from "@/hooks/use-org-modal";
import { useEffect } from "react";

export default function Page() {
  const onOpen = useOrgModal((state) => state.onOpen);
  const isOpen = useOrgModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  return null;
}
