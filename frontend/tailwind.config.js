/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        /* =========================
           PRIMARY
        ========================== */
        primary: "#2563EB",
        "primary-dark": "#1D4ED8",
        "primary-light": "#EFF6FF",
        "primary-container": "#EAF2FF",
        "on-primary": "#FFFFFF",

        /* =========================
           TEXT
        ========================== */
        "on-surface": "#172033",
        "on-surface-variant": "#5B6577",
        "text-secondary": "#667085",
        "text-muted": "#8A94A6",
        "text-light": "#A7AFBD",

        /* =========================
           BACKGROUNDS
        ========================== */
        background: "#F8FAFC",
        surface: "#FFFFFF",
        "surface-bright": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F8FAFC",
        "surface-container": "#F5F7FA",
        "surface-container-high": "#F1F5F9",
        "surface-container-highest": "#E8EDF3",
        "surface-variant": "#F1F5F9",

        /* =========================
           BORDERS
        ========================== */
        outline: "#D8E0EA",
        "outline-variant": "#E3E8EF",
        "border-light": "#EEF1F5",
        "border-medium": "#D5DCE6",

        /* =========================
           SUCCESS
        ========================== */
        success: "#16A34A",
        "success-container": "#ECFDF3",
        "on-success": "#FFFFFF",

        /* =========================
           WARNING
        ========================== */
        warning: "#D97706",
        "warning-container": "#FFF7E6",
        "on-warning": "#FFFFFF",

        /* =========================
           ERROR / CRITICAL
        ========================== */
        error: "#DC2626",
        "error-container": "#FEF2F2",
        "critical": "#B91C1C",
        "critical-container": "#FEE2E2",
        "on-error": "#FFFFFF",

        /* =========================
           INFO
        ========================== */
        info: "#2563EB",
        "info-container": "#EFF6FF",

        /* =========================
           PRIORITY
        ========================== */
        "priority-high": "#C2410C",
        "priority-high-container": "#FFF0E6",

        "priority-medium": "#A16207",
        "priority-medium-container": "#FFF7E6",

        "priority-low": "#15803D",
        "priority-low-container": "#ECFDF3",

        /* =========================
           STATUS
        ========================== */
        "status-active": "#15803D",
        "status-active-container": "#ECFDF3",

        "status-review": "#B45309",
        "status-review-container": "#FFF7E6",

        "status-investigation": "#1D4ED8",
        "status-investigation-container": "#EFF6FF",

        "status-closed": "#64748B",
        "status-closed-container": "#F1F5F9",

        /* =========================
           SPECIAL
        ========================== */
        "inverse-surface": "#172033",
        "inverse-on-surface": "#FFFFFF",
        "inverse-primary": "#93B4FF",
      },

      spacing: {
        /* 8px spacing system */
        "space-2xs": "2px",
        "space-xs": "4px",
        "space-sm": "8px",
        "space-md": "12px",
        "space-base": "16px",
        "space-lg": "20px",
        "space-xl": "24px",
        "space-2xl": "32px",
        "space-3xl": "40px",
        "space-4xl": "48px",

        /* Layout */
        "sidebar-width": "220px",
        "header-height": "64px",
        "content-padding": "32px",

        /* Case workspace */
        "case-sidebar-width": "220px",
        "inspector-width": "360px",

        /* Components */
        "card-padding": "20px",
        "table-cell": "14px",
      },

      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 4px 12px rgba(15, 23, 42, 0.06)",
        dropdown: "0 8px 24px rgba(15, 23, 42, 0.10)",
      },

      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "sans-serif",
        ],
      },

      fontSize: {
        "page-title": [
          "32px",
          {
            lineHeight: "1.2",
            fontWeight: "700",
          },
        ],

        "section-title": [
          "18px",
          {
            lineHeight: "1.4",
            fontWeight: "650",
          },
        ],

        "card-title": [
          "15px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
          },
        ],

        "body-sm": [
          "13px",
          {
            lineHeight: "1.5",
          },
        ],

        "label-sm": [
          "12px",
          {
            lineHeight: "1.4",
            fontWeight: "500",
          },
        ],
      },
    },
  },

  plugins: [],
};