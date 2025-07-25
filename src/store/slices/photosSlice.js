import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  photos: [],
  loading: false,
  error: null,
}

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setPhotos: (state, action) => {
      state.photos = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setPhotos,
  setLoading,
  setError,
} = photosSlice.actions

export default photosSlice.reducer 