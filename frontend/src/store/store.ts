import { configureStore } from '@reduxjs/toolkit';
import pipelineReducer from './pipelineSlice';

export const store = configureStore({
  reducer: {
    pipeline: pipelineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['pipeline/addToPipeline/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

