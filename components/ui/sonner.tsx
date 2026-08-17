"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border-border !bg-popover !text-popover-foreground !shadow-elevated",
          description: "!text-muted-foreground",
          actionButton: "!rounded-md !bg-primary !text-primary-foreground",
          cancelButton: "!rounded-md !bg-secondary !text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
