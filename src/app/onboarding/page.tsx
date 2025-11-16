"use client";

import { useOrgModal } from "@/hooks/use-org-modal";
import { useEffect } from "react";

/**
 * Client onboarding page that ensures the organization modal is opened on mount.
 *
 * When mounted (and whenever `isOpen` or `onOpen` change), triggers `onOpen` if the organization modal is not already open.
 *
 * @returns `null` when rendered; the component does not produce any UI.
 */
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