import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "@/layouts/public-layout";
import AuthLayout from "@/layouts/auth-layout";
import PrivateLayout from "@/layouts/private-layout";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import HomePage from "@/pages/home";
import LibraryPage from "@/pages/library";
import PostCreatePage from "@/pages/post-create";
import PostDetailPage from "@/pages/post-detail";
import PostEditPage from "@/pages/post-edit";
import ProfilePage from "@/pages/profile";
import UserProfilePage from "@/pages/user-profile";

// Mirrors the old Next route groups:
//   (public) -> PublicLayout, (auth) -> AuthLayout, (private) -> PrivateLayout.
// The auth/guest guards live inside the layouts, exactly as before.
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateLayout />,
    children: [
      { path: "home", element: <HomePage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "posts/create", element: <PostCreatePage /> },
      { path: "posts/:id", element: <PostDetailPage /> },
      { path: "posts/:id/edit", element: <PostEditPage /> },
      { path: "profile/:id", element: <ProfilePage /> },
      { path: "users/:id", element: <UserProfilePage /> },
    ],
  },
]);
