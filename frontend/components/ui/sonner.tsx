"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-purple-500 group-[.toaster]:to-pink-500 group-[.toaster]:text-white group-[.toaster]:border-purple-200/20",
          error:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-500 group-[.toaster]:to-purple-600 group-[.toaster]:text-white group-[.toaster]:border-red-200/20",
          info:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-indigo-500 group-[.toaster]:to-purple-500 group-[.toaster]:text-white group-[.toaster]:border-indigo-200/20",
          warning:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-amber-500 group-[.toaster]:to-purple-500 group-[.toaster]:text-white group-[.toaster]:border-amber-200/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
