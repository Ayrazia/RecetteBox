import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Category {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
}

interface RecipesState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: RecipesState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'recipes/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
            if (!response.ok) {
                throw new Error('Erreur réseau lors de la récupération des catégories');
            }
            const data = await response.json();
            return data.categories as Category[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


const recipesSlice = createSlice({
    name: 'recipes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default recipesSlice.reducer;