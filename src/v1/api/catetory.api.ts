import { ListCategorySuccess } from "../types/response/success";
import apiClient from "./api-client";

export const categoryApi = {
  getCategories: () => apiClient.get<ListCategorySuccess>("/categories"),
};
