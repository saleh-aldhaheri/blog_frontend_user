import { ProfileApi } from "@/src/v1/api/profile.api";
import { Profile } from "@/src/v1/types/response/profile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FullPageLoader from "@/components/full-page-loader";
import InfoCards from "@/components/info-cards";
import { useParams, useRouter } from "@/lib/next-compat";
import UserProfile from "@/components/user-profile";
import BackButton from "@/components/ui/back-button";

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const userId = params.id;
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!userId) {
          router.push("/home");
          return;
        }
        const profileRes = await ProfileApi.getUserProfile(Number(userId));
        setProfile(profileRes.data.data);
      } catch {
        toast.error("Unable to load profile right now.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader label="Loading your Profile..." />;
  }

  if (!profile) {
    return <FullPageLoader label="Loading your Profile..." />;
  }

  return (
    <div className="space-y-6">
      <BackButton />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoCards
          title="Posts"
          value={profile.posts_count}
          description="Total posts"
        />
        <InfoCards
          title="Viewed posts"
          value={profile.viewed_posts_count}
          description="Total viewed posts"
        />
        <InfoCards
          title="Followers"
          value={profile.followers_count}
          description="Total followers"
        />
        <InfoCards
          title="Following"
          value={profile.followings_count}
          description="Total following"
        />
      </div>

      <UserProfile profile={profile} />
    </div>
  );
}

export default ProfilePage;
