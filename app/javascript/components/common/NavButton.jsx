import React from "react";
import { Link, useLocation } from "react-router-dom";

const baseStyles = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.55rem 1.2rem",
  borderRadius: "999px",
  fontWeight: 600,
  fontSize: "0.95rem",
  textDecoration: "none",
  transition: "all 0.2s ease",
  border: "1px solid transparent",
  cursor: "pointer",
};

const variantStyles = {
  default: {
    backgroundColor: "#ffffff",
    color: "#172133",
    borderColor: "#e2e8f0",
  },
  primary: {
    backgroundColor: "#e60000",
    color: "#ffffff",
    borderColor: "transparent",
  },
};

const NavButton = ({ to, label, icon: Icon, variant = "default" }) => {
  const location = useLocation();
  const normalizePath = (value) => (value === "/" ? "/" : value.replace(/\/+$|^\s+|\s+$/g, ""));
  const normalizedTarget = normalizePath(to);
  const normalizedLocation = normalizePath(location.pathname);
  const isActive =
    normalizedTarget === "/"
      ? normalizedLocation === "/"
      : normalizedLocation.startsWith(normalizedTarget);

  const computedStyles = {
    ...baseStyles,
    ...(variantStyles[variant] || variantStyles.default),
    ...(isActive
      ? {
          borderColor: variant === "primary" ? "transparent" : "#94a3b8",
          backgroundColor: variant === "primary" ? "#c20000" : "#f8fafc",
          color: variant === "primary" ? "#fff" : "#102027",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
        }
      : {}),
  };

  return (
    <Link to={to} aria-current={isActive ? "page" : undefined} style={computedStyles}>
      {Icon && (
        <span
          aria-hidden="true"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon style={{ fontSize: "1.08rem" }} />
        </span>
      )}
      {label}
    </Link>
  );
};

export default NavButton;
