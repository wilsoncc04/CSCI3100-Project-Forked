import React, { useState } from "react";
import { loginUser, requestPasswordResetOtp, resetPasswordWithOtp } from "../../common/loginauth";
import { useNavigate } from "react-router-dom";
import { notify } from "../../common/notify";
import {
  BrandTitle,
  FooterRow,
  FormLabel,
  InlineForm,
  InputField,
  PageWrapper,
  PrimaryButton,
  RegisterLink,
  ResetDescription,
  ResetPanel,
  ResetTitle,
  Subtitle,
  TextButton,
  ToggleRow
} from "./LoginPage.styles";

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState(""); 
  const [resetError, setResetError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("trying login", { email, password });
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      console.log("backend data:", data);
      if (data.message === 'logged_in') {
        notify.success("Login Success!");
        
        if (setUser) setUser(data.user);
        
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        
        navigate("/Account"); 
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      const errorMsg = error.response?.data?.error || "Invalid email or password";
      
      if (errorMsg === 'email_not_verified') {
        notify.error("Your email is not verified. Please check your inbox for the OTP.");
      } else {
        notify.error("Login Failed: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleResetPanel = () => {
    setShowResetPanel((prev) => !prev);
    setResetMessage("");
    setResetError("");
    if (!showResetPanel && email) {
      setResetEmail(email);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      notify.error("Please enter your CUHK email first.");
      return;
    }

    setSendingOtp(true);
    setResetError("");
    setResetMessage("");

    try {
      await requestPasswordResetOtp(resetEmail);
      notify.success("If this account is eligible, an OTP has been sent to your inbox.");
    } catch (error) {
      console.error("Send OTP Error:", error.response?.data);
      notify.error("Unable to send OTP right now. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (!resetEmail.trim() || !resetOtp.trim()) {
      notify.error("Please enter both email and OTP.");
      return;
    }

    if (!newPassword) {
      notify.error("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error ("New password and confirmation do not match.");
      return;
    }

    setResettingPassword(true);
    try {
      await resetPasswordWithOtp(resetEmail, resetOtp, newPassword);
      notify.success("Password reset successful. Please log in with your new password.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetOtp("");
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data);
      const errorMsg = error.response?.data?.error || "Unable to reset password";
      notify.error(errorMsg);
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <PageWrapper>
      <BrandTitle>CUHK Marketplace</BrandTitle>
      <Subtitle>Sign in to continue</Subtitle>
      
      <form onSubmit={handleLogin}>
        <FormLabel>CUHK Email</FormLabel>
        <InputField
          type="email"
          placeholder="1155xxxxxx@link.cuhk.edu.hk"
          value={email}
          required
          pattern="1155[0-9]{6}@link.cuhk.edu.hk"
          onChange={(e) => {
            setEmail(e.target.value);
            
            e.target.setCustomValidity("");
            
            if (e.target.validity.valueMissing) {
              e.target.setCustomValidity("Please enter your CUHK email address");
            } else if (e.target.validity.patternMismatch) {
              e.target.setCustomValidity(" ");
            }
          }}
          
          onInvalid={(e) => {
            e.target.setCustomValidity("");
            if (e.target.validity.valueMissing) {
              e.target.setCustomValidity("Please enter your CUHK email address");
            } else if (e.target.validity.patternMismatch) {
              e.target.setCustomValidity("Please use your CUHK ID (e.g., 1155123456@link.cuhk.edu.hk)");
            }
          }}
        />

        <FormLabel withTopSpace>Password</FormLabel>
        <InputField
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          onInvalid={(e) => e.target.setCustomValidity("Please enter your password")}
          onInput={(e) => e.target.setCustomValidity("")}
        />

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </PrimaryButton>
      </form>

      <ToggleRow>
        <TextButton
          type="button"
          onClick={toggleResetPanel}
        >
          {showResetPanel ? "Hide password reset" : "Forgot password?"}
        </TextButton>
      </ToggleRow>

      {showResetPanel && (
        <ResetPanel>
          <ResetTitle>Reset Password</ResetTitle>
          <ResetDescription>
            Step 1: Request an OTP. Step 2: Enter OTP and your new password.
          </ResetDescription>

          <InlineForm onSubmit={handleSendOtp}>
            <FormLabel>CUHK Email</FormLabel>
            <InputField
              type="email"
              placeholder="1155xxxxxx@link.cuhk.edu.hk"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              onInvalid={(e) => e.target.setCustomValidity("Please enter a valid CUHK email address")}
              onInput={(e) => e.target.setCustomValidity("")}
            />
            <PrimaryButton type="submit" variant="secondary" compact disabled={sendingOtp}>
              {sendingOtp ? "Sending OTP..." : "Send Reset OTP"}
            </PrimaryButton>
          </InlineForm>

          <InlineForm onSubmit={handleResetPassword} withTopSpace>
            <FormLabel>OTP Code</FormLabel>
            <InputField
              type="text"
              placeholder="Enter OTP from email"
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value)}
              required
              onInvalid={(e) => e.target.setCustomValidity("Please enter the OTP sent to your email")}
              onInput={(e) => e.target.setCustomValidity("")}

            />

            <FormLabel>New Password</FormLabel>
            <InputField
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              onInvalid={(e) => e.target.setCustomValidity("Please enter a new password")}
              onInput={(e) => e.target.setCustomValidity("")}
            />

            <FormLabel>Confirm New Password</FormLabel>
            <InputField
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              onInvalid={(e) => e.target.setCustomValidity("Please confirm your new password")}
              onInput={(e) => e.target.setCustomValidity("")}
            />

            <PrimaryButton type="submit" compact disabled={resettingPassword}>
              {resettingPassword ? "Resetting..." : "Reset Password"}
            </PrimaryButton>
          </InlineForm>
        </ResetPanel>
      )}

      <FooterRow>
        <span>New student? </span>
        <RegisterLink href="/register">Create an account</RegisterLink>
      </FooterRow>
    </PageWrapper>
  );
};

export default LoginPage;