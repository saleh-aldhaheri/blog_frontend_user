// src/components/user/change-password-form.tsx

import { profileApi } from "@/src/v1/api/profile.api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, X } from "lucide-react";

interface ChangePasswordFormProps {
  open: boolean;
  onClose: () => void;
}

function ChangePasswordForm({ open, onClose }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState({
    current: false,
    password: false,
    confirm: false,
  });
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // handle animation: mount then fade-in, fade-out then unmount
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const toggleShow = (field: keyof typeof show) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClose = () => {
    setForm({ current_password: "", password: "", password_confirmation: "" });
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.current_password) newErrors.current_password = "Required";
    if (form.password.length < 8) newErrors.password = "Min 8 characters";
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await profileApi.changePassword(form);
      toast.success("Password changed successfully.");
      handleClose();
    } catch (err: any) {
      const serverError = err?.response?.data?.errors?.current_password?.[0];
      if (serverError) {
        setErrors({ current_password: serverError });
      } else {
        toast.error("Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "current_password" as const,
      label: "Current Password",
      showKey: "current" as const,
    },
    {
      name: "password" as const,
      label: "New Password",
      showKey: "password" as const,
    },
    {
      name: "password_confirmation" as const,
      label: "Confirm New Password",
      showKey: "confirm" as const,
    },
  ];

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: open
          ? "fadeIn 200ms ease forwards"
          : "fadeOut 300ms ease forwards",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          animation: open
            ? "slideUp 250ms ease forwards"
            : "slideDown 300ms ease forwards",
        }}
        className="w-full max-w-md mx-4 rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="zen-divider" />

        {/* Fields */}
        <div className="flex flex-col gap-5">
          {fields.map(({ name, label, showKey }) => (
            <div key={name}>
              <label className="zen-label">{label}</label>
              <div className="relative">
                <input
                  name={name}
                  type={show[showKey] ? "text" : "password"}
                  value={form[name]}
                  onChange={handleChange}
                  className="zen-input pr-8"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(showKey)}
                  className="absolute right-0 bottom-2 text-muted hover:text-foreground transition-colors"
                >
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[name] && (
                <p className="mt-1 text-xs text-destructive">{errors[name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="zen-button-primary disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(24px) scale(0.97); }
        }
      `}</style>
    </div>
  );
}

export default ChangePasswordForm;
