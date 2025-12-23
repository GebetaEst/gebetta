export interface Food {
  _id: string;
  id?: string;
  foodName: string;
  price: number;
  ingredients: string;
  cookingTimeMinutes: number;
  rating: number;
  imageCover: string;
  isFeatured?: boolean;
  menuId: {
    _id: string;
    restaurantId:
      | string
      | {
          _id?: string;
          id?: string;
          restaurantId?: string;
        };
    menuType: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  restaurantId?: string | { _id?: string; id?: string };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodApiResponse {
  status: string;
  results: number;
  data: Food[];
}

