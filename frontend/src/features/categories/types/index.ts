export interface Category {
  id: string;
  name: string;
  colorHex: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  colorHex: string;
}

export interface UpdateCategoryDto {
  name?: string;
  colorHex?: string;
}
