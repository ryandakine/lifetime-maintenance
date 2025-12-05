import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { aiProcessor, validateInput } from '../../lib/aiProcessor'

// Async thunks
export const fetchShoppingLists = createAsyncThunk(
  'shopping/fetchLists',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('SHOPPING_LISTS')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addShoppingItem = createAsyncThunk(
  'shopping/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const validatedItem = {
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('SHOPPING_LISTS')
        .insert([validatedItem])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateShoppingItem = createAsyncThunk(
  'shopping/updateItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('SHOPPING_LISTS')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteShoppingItem = createAsyncThunk(
  'shopping/deleteItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('SHOPPING_LISTS')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return itemId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const parseShoppingInput = createAsyncThunk(
  'shopping/parseInput',
  async (input, { rejectWithValue }) => {
    try {
      const validatedInput = validateInput.shopping(input)
      const parsedItems = await aiProcessor.parseShopping(validatedInput)
      return parsedItems
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  mainList: [],
  miscList: [],
  activeList: 'main',
  suggestedItems: [],
  analytics: {
    total: 0,
    completed: 0,
    byCategory: {}
  },
  reminder: '',
  aiQuery: '',
  aiResponse: '',
  aiProcessing: false,
  loading: false,
  error: null,
  processing: false,
  message: { type: '', text: '' },
  // Voice input states
  isListening: false,
  transcript: '',
  listeningTimeout: null,
  showVoiceModal: false,
  voiceModalText: '',
  voiceModalListening: false,
  voiceModalRecognitionRef: null,
}

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setActiveList: (state, action) => {
      state.activeList = action.payload
    },
    addItemToMainList: (state, action) => {
      state.mainList.push(action.payload)
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    addItemToMiscList: (state, action) => {
      state.miscList.push(action.payload)
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    toggleItem: (state, action) => {
      const { listType, index } = action.payload
      const list = listType === 'main' ? state.mainList : state.miscList
      if (list[index]) {
        list[index].checked = !list[index].checked
        state.analytics = calculateAnalytics(state.mainList, state.miscList)
      }
    },
    moveToMisc: (state, action) => {
      const { listType, index } = action.payload
      if (listType === 'main') {
        const item = state.mainList[index]
        state.mainList.splice(index, 1)
        state.miscList.push(item)
      } else {
        const item = state.miscList[index]
        state.miscList.splice(index, 1)
        state.mainList.push(item)
      }
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    markAllAsGot: (state, action) => {
      const listType = action.payload || state.activeList
      const list = listType === 'main' ? state.mainList : state.miscList
      list.forEach(item => item.checked = true)
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    clearChecked: (state, action) => {
      const listType = action.payload || state.activeList
      if (listType === 'main') {
        state.mainList = state.mainList.filter(item => !item.checked)
      } else {
        state.miscList = state.miscList.filter(item => !item.checked)
      }
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    duplicateList: (state, action) => {
      const listType = action.payload || state.activeList
      const sourceList = listType === 'main' ? state.mainList : state.miscList
      const duplicatedItems = sourceList.map(item => ({
        ...item,
        id: Date.now() + Math.random(),
        checked: false,
        created_at: new Date().toISOString()
      }))
      
      if (listType === 'main') {
        state.mainList.push(...duplicatedItems)
      } else {
        state.miscList.push(...duplicatedItems)
      }
      state.analytics = calculateAnalytics(state.mainList, state.miscList)
    },
    setSuggestedItems: (state, action) => {
      state.suggestedItems = action.payload
    },
    setReminder: (state, action) => {
      state.reminder = action.payload
    },
    setAiQuery: (state, action) => {
      state.aiQuery = action.payload
    },
    setAiResponse: (state, action) => {
      state.aiResponse = action.payload
    },
    setAiProcessing: (state, action) => {
      state.aiProcessing = action.payload
    },
    setMessage: (state, action) => {
      state.message = action.payload
    },
    clearMessage: (state) => {
      state.message = { type: '', text: '' }
    },
    // Voice input actions
    setIsListening: (state, action) => {
      state.isListening = action.payload
    },
    setTranscript: (state, action) => {
      state.transcript = action.payload
    },
    setListeningTimeout: (state, action) => {
      state.listeningTimeout = action.payload
    },
    setShowVoiceModal: (state, action) => {
      state.showVoiceModal = action.payload
    },
    setVoiceModalText: (state, action) => {
      state.voiceModalText = action.payload
    },
    setVoiceModalListening: (state, action) => {
      state.voiceModalListening = action.payload
    },
    setVoiceModalRecognitionRef: (state, action) => {
      state.voiceModalRecognitionRef = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shopping lists
      .addCase(fetchShoppingLists.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShoppingLists.fulfilled, (state, action) => {
        state.loading = false
        // Separate main and misc items
        state.mainList = action.payload.filter(item => !item.is_misc)
        state.miscList = action.payload.filter(item => item.is_misc)
        state.analytics = calculateAnalytics(state.mainList, state.miscList)
      })
      .addCase(fetchShoppingLists.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add shopping item
      .addCase(addShoppingItem.fulfilled, (state, action) => {
        const item = action.payload
        if (item.is_misc) {
          state.miscList.unshift(item)
        } else {
          state.mainList.unshift(item)
        }
        state.analytics = calculateAnalytics(state.mainList, state.miscList)
      })
      .addCase(addShoppingItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update shopping item
      .addCase(updateShoppingItem.fulfilled, (state, action) => {
        const updatedItem = action.payload
        const mainIndex = state.mainList.findIndex(item => item.id === updatedItem.id)
        const miscIndex = state.miscList.findIndex(item => item.id === updatedItem.id)
        
        if (mainIndex !== -1) {
          state.mainList[mainIndex] = updatedItem
        } else if (miscIndex !== -1) {
          state.miscList[miscIndex] = updatedItem
        }
        state.analytics = calculateAnalytics(state.mainList, state.miscList)
      })
      .addCase(updateShoppingItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete shopping item
      .addCase(deleteShoppingItem.fulfilled, (state, action) => {
        const itemId = action.payload
        state.mainList = state.mainList.filter(item => item.id !== itemId)
        state.miscList = state.miscList.filter(item => item.id !== itemId)
        state.analytics = calculateAnalytics(state.mainList, state.miscList)
      })
      .addCase(deleteShoppingItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Parse shopping input
      .addCase(parseShoppingInput.fulfilled, (state, action) => {
        // Items will be added to the appropriate list by the component
        state.processing = false
      })
      .addCase(parseShoppingInput.pending, (state) => {
        state.processing = true
      })
      .addCase(parseShoppingInput.rejected, (state, action) => {
        state.processing = false
        state.error = action.payload
      })
  },
})

// Helper function to calculate analytics
const calculateAnalytics = (mainList, miscList) => {
  const allItems = [...mainList, ...miscList]
  const total = allItems.length
  const completed = allItems.filter(item => item.checked).length
  const byCategory = {}
  
  allItems.forEach(item => {
    const category = item.category || 'Misc'
    byCategory[category] = (byCategory[category] || 0) + 1
  })
  
  return { total, completed, byCategory }
}

export const {
  setActiveList,
  addItemToMainList,
  addItemToMiscList,
  toggleItem,
  moveToMisc,
  markAllAsGot,
  clearChecked,
  duplicateList,
  setSuggestedItems,
  setReminder,
  setAiQuery,
  setAiResponse,
  setAiProcessing,
  setMessage,
  clearMessage,
  setIsListening,
  setTranscript,
  setListeningTimeout,
  setShowVoiceModal,
  setVoiceModalText,
  setVoiceModalListening,
  setVoiceModalRecognitionRef,
  clearError,
} = shoppingSlice.actions

export default shoppingSlice.reducer 