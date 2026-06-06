// src/components/user/user-profile.tsx

import { Profile } from "@/src/v1/types/response/profile";

interface UserProfileProps {
  profile: Profile;
}

function UserProfile({ profile }: UserProfileProps) {
  const avatarSrc = profile.avatar ?? null;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <h2 className="text-base font-bold text-foreground tracking-tight">
        Profile
      </h2>

      {/* Avatar + name centered */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 shrink-0">
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
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{profile.name}</p>
          <p className="text-xs text-muted capitalize">{profile.role}</p>
        </div>
      </div>

      <div className="zen-divider" />

      {/* Info rows */}
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Name
          </span>
          <span className="text-sm text-foreground font-medium">
            {profile.name}
          </span>
        </div>
        <div className="zen-divider" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Email
          </span>
          <span className="text-sm text-foreground font-medium">
            {profile.email}
          </span>
        </div>
        <div className="zen-divider" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Member since
          </span>
          <span className="text-sm text-foreground font-medium">
            {new Date(profile.email_verified_at ?? "").toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
