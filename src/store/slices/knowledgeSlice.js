import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  knowledgeBase: [],
  searchQuery: '',
  filteredKnowledge: [],
  loading: false,
  error: null,
}

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    setKnowledgeBase: (state, action) => {
      state.knowledgeBase = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilteredKnowledge: (state, action) => {
      state.filteredKnowledge = action.payload
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
  setKnowledgeBase,
  setSearchQuery,
  setFilteredKnowledge,
  setLoading,
  setError,
} = knowledgeSlice.actions

export default knowledgeSlice.reducer 