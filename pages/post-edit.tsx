
import { useParams, useRouter } from "@/lib/next-compat";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import FullPageLoader from "@/components/full-page-loader";
import PostEditorForm from "@/components/post-editor-form";
import postApi from "@/src/v1/api/post.api";
import type { PostDetail } from "@/src/v1/types/response/post";
import BackButton from "@/components/ui/back-button";

function parsePostId(id: string | string[] | undefined) {
  const raw = Array.isArray(id) ? id[0] : id;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = useMemo(() => parsePostId(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    const start = window.setTimeout(async () => {
      try {
        if (!postId) throw new Error("Invalid post id");
        const res = await postApi.getPost(postId);
        setPost(res.data.data);
      } catch {
        toast.error("Unable to load post for editing.");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(start);
  }, [postId]);

  const handleUpdate = async (formData: FormData) => {
    if (!postId) return;
    try {
      setSubmitting(true);
      await postApi.updatePostForm(postId, formData);
      toast.success("Post updated successfully.");
      router.push(`/posts/${postId}`);
    } catch {
      toast.error("Unable to update post right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullPageLoader label="Loading post editor..." />;
  }

  if (!post || !postId) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        Post not found.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <BackButton />
      <h1 className="text-3xl font-semibold text-foreground">Edit Post</h1>
      <PostEditorForm
        mode="edit"
        initialPost={post}
        submitting={submitting}
        onSubmitEdit={handleUpdate}
      />
    </div>
  );
}
