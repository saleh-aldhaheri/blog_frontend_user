
import { Link } from "@/lib/next-compat";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/lib/next-compat";
import { toast } from "sonner";

import PostEditorForm from "@/components/post-editor-form";
import postApi from "@/src/v1/api/post.api";
import BackButton from "@/components/ui/back-button";

export default function CreatePostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (formData: FormData) => {
    try {
      setSubmitting(true);
      const res = await postApi.createPostForm(formData);
      toast.success("Post created successfully.");
      router.push(`/posts/${res.data.data.id}`);
    } catch {
      toast.error("Unable to create post right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <BackButton />
      <h1 className="text-3xl font-semibold text-foreground">Create Post</h1>
      <PostEditorForm
        mode="create"
        submitting={submitting}
        onSubmitCreate={handleCreate}
      />
    </div>
  );
}
