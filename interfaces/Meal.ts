import {FavoriteMeal} from "@/features/favoritesSlice";

export interface Meal {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
}

export interface MealDetail {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strYoutube?: string;
    [key: string]: string | null | undefined;
}

export interface MealCardProps {
    meal: FavoriteMeal;
    onPress?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}