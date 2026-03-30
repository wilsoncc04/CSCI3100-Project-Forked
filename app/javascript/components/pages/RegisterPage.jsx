import React, { useState } from "react";
import { registerUser } from "../../common/register";

const RegisterPage = () => {
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: "",
    hostel: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "0.9rem",
    marginBottom: "0.9rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.9rem",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#e60000",
    color: "#ffffff",
    fontWeight: 600,
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontSize: "1rem",
    transition: "transform 0.2s ease",
  };

    //   Handle input changes for all form fields
    //  (...pre: is a placeholder for the previous state,
    //  [field]: event.target.value updates the specific field that changed)
  const handleChange = (field) => (event) => {
    setFormFields((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      const response = await registerUser(formFields);
      setStatus({
        message: response?.email
          ? `Registered ${response.email}. Check your email for the verification OTP.`
          : "Registered successfully. Check your email for the verification OTP.",
        type: "success",
      });
      setFormFields({ name: "", email: "", password: "", hostel: "" });
    } catch (error) {
      console.error("Register failed", error);
      const errorText =
        error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
      setStatus({ message: errorText, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "40px auto",
        padding: "2rem",
        borderRadius: "20px",
        boxShadow: "0 25px 40px rgba(15, 23, 42, 0.12)",
        background: "#ffffff",
      }}
    >
      <h2 style={{ marginBottom: "0.4rem" }}>Create an Account</h2>
      <p style={{ marginTop: 0, color: "#475569", fontSize: "0.95rem" }}>
        Register with your CUHK email and we will send you an OTP to finish the verification.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Your full name"
          value={formFields.name}
          onChange={handleChange("name")}
          required
        />
        <input
          style={inputStyle}
          type="email"
          placeholder="CUHK email"
          value={formFields.email}
          onChange={handleChange("email")}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={formFields.password}
          onChange={handleChange("password")}
          minLength={6}
          required
        />
        <input
          style={inputStyle}
          type="text"
          placeholder="Hostel (optional)"
          value={formFields.hostel}
          onChange={handleChange("hostel")}
        />
        <button type="submit" style={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      {status.message && (
        <div
          style={{
            marginTop: "1.1rem",
            color: status.type === "error" ? "#b91c1c" : "#047857",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;