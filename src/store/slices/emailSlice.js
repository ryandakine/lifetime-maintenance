import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  emails: [],
  loading: false,
  error: null,
}

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    setEmails: (state, action) => {
      state.emails = action.payload
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
  setEmails,
  setLoading,
  setError,
} = emailSlice.actions

export default emailSlice.reducer 