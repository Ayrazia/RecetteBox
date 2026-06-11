import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recipesReducer from '../features/recipesSlice';
import favoritesReducer from '../features/favoritesSlice';
import historyReducer from '../features/historySlice';

const rootReducer = combineReducers({
    recipes: recipesReducer,
    favorites: favoritesReducer,
    history: historyReducer
});

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['favorites','history'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
