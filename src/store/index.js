import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './slices/tasksSlice'
import shoppingReducer from './slices/shoppingSlice'
import knowledgeReducer from './slices/knowledgeSlice'
import emailReducer from './slices/emailSlice'
import photosReducer from './slices/photosSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    shopping: shoppingReducer,
    knowledge: knowledgeReducer,
    email: emailReducer,
    photos: photosReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Type definitions for TypeScript support
export const getRootState = () => store.getState()
export const getAppDispatch = () => store.dispatch 