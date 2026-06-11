import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteMeal {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
}

interface FavoritesState {
    items: FavoriteMeal[];
}

const initialState: FavoritesState = {
    items: [],
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite(state, action: PayloadAction<FavoriteMeal>) {
            const exists = state.items.some(m => m.idMeal === action.payload.idMeal);
            if (!exists) state.items.push(action.payload);
        },
        removeFavorite(state, action: PayloadAction<string>) {
            state.items = state.items.filter(m => m.idMeal !== action.payload);
        },
    },
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
