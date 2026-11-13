"use client";

import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { AdminProvider } from "../../context/AdminContext";

export function AdminAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminProvider>{children}</AdminProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

