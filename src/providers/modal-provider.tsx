"use client";

import { OrgModal } from "@/components/modal/org-modal";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <OrgModal />
    </>
  );
};

export default ModalProvider;
