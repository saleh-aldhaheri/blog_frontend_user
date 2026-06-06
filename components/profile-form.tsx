
import { Profile } from "@/src/v1/types/response/profile";
import { profileApi } from "@/src/v1/api/profile.api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Pencil, Check, X, Camera } from "lucide-react";

interface ProfileFormProps {
  profile: Profile;
  onUpdated: (updated: Profile) => void;
}

function ProfileForm({ profile, onUpdated }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarFileRef.current = file;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({ name: profile.name, email: profile.email });
    setAvatarPreview(null);
    avatarFileRef.current = null;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await profileApi.updateProfile({
        name: form.name !== profile.name ? form.name : undefined,
        email: form.email !== profile.email ? form.email : undefined,
        avatar: avatarFileRef.current ?? undefined,
      });
      onUpdated(res.data.data);
      setEditing(false);
      setAvatarPreview(null);
      avatarFileRef.current = null;
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = avatarPreview ?? profile.avatar ?? null;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground tracking-tight">
          Profile Information
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Pencil size={13} />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              <X size={13} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <Check size={13} />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative w-20 h-20 shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center text-2xl font-bold text-muted">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          {editing && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={16} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {profile.name}
          </p>
          <p className="text-xs text-muted capitalize">{profile.role}</p>
        </div>
      </div>

      <div className="zen-divider" />

      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <label className="zen-label">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editing}
            className="zen-input disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="zen-label">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editing}
            className="zen-input disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Your email"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
