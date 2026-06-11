import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface HistoryRecipes {
    idRecipes: string;
    strRecipes: string;
    strRecipesThumb: string;
}

export interface HistoryState {
    items: HistoryRecipes[];
}

const initialState : HistoryState = {
    items : []
}


const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers : {
        addHistory(state, action: PayloadAction<HistoryRecipes>) {
            const exists = state.items.some(m => m.idRecipes === action.payload.idRecipes);
            if (!exists) state.items.push(action.payload);
        },
        removeHistory(state, action: PayloadAction<HistoryRecipes>) {
            state.items = state.items.filter(m => m.idRecipes !== action.payload.idRecipes);
        }

    },
})

export const {addHistory, removeHistory} = historySlice.actions;

export default historySlice.reducer;