import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/src/v1/types/request/profile";
import type {
  GetProfileSuccess,
  UpdateProfileSuccess,
} from "@/src/v1/types/response/success";
import apiClient from "./api-client";

export const profileApi = {
  getUserProfile: (userId: number) =>
    apiClient.get<GetProfileSuccess>(`/profile/${userId}`),

  updateProfile: (data: UpdateProfileRequest) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.avatar) formData.append("avatar", data.avatar);
    return apiClient.put<UpdateProfileSuccess>("/profile", formData);
  },

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put("/profile/password", data),
};

export const ProfileApi = profileApi;
