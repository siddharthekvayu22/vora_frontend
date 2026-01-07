import { Toaster } from "react-hot-toast";

/**
 * AppToaster Component - Centralized toast configuration
 *
 * Features:
 * - Theme-aware styling using CSS variables
 * - Proper z-index to appear above modals
 * - Success, error, and loading state styling
 * - Consistent typography and spacing
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerClassName="!z-[99999]"
      containerStyle={{ zIndex: 99999 }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.875rem",
          fontWeight: "500",
          padding: "12px 16px",
          zIndex: 99999,
        },
        success: {
          duration: 3000,
          style: {
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-primary)",
            borderLeft: "4px solid var(--color-primary)",
            zIndex: 99999,
          },
          iconTheme: {
            primary: "var(--color-primary)",
            secondary: "var(--color-card)",
          },
        },
        error: {
          duration: 4000,
          style: {
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-destructive)",
            borderLeft: "4px solid var(--color-destructive)",
            zIndex: 99999,
          },
          iconTheme: {
            primary: "var(--color-destructive)",
            secondary: "var(--color-card)",
          },
        },
        loading: {
          style: {
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
            zIndex: 99999,
          },
          iconTheme: {
            primary: "var(--color-primary)",
            secondary: "var(--color-card)",
          },
        },
      }}
    />
  );
}
