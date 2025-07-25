import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { aiProcessor, validateInput } from '../../lib/aiProcessor'

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('TASKS')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const validatedTask = {
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('TASKS')
        .insert([validatedTask])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('TASKS')
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

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('TASKS')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return taskId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const generateTaskSuggestions = createAsyncThunk(
  'tasks/generateSuggestions',
  async (tasks, { rejectWithValue }) => {
    try {
      const validatedTasks = validateInput.tasks(tasks)
      const suggestions = await aiProcessor.generateTaskSuggestions(validatedTasks)
      return suggestions
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  tasks: [],
  filteredTasks: [],
  suggestions: [],
  insights: null,
  loading: false,
  error: null,
  filter: 'all',
  searchQuery: '',
  conversationMode: false,
  clarifyingQuestions: [],
  currentQuestion: null,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload
      state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
    },
    toggleTask: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload)
      if (task) {
        task.checked = !task.checked
        task.updated_at = new Date().toISOString()
        state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
      }
    },
    setConversationMode: (state, action) => {
      state.conversationMode = action.payload
    },
    addClarifyingQuestion: (state, action) => {
      state.clarifyingQuestions.push(action.payload)
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload
    },
    clearClarifyingQuestions: (state) => {
      state.clarifyingQuestions = []
      state.currentQuestion = null
    },
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
        state.filteredTasks = filterTasks(action.payload, state.filter, state.searchQuery)
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
        state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
          state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload)
        state.filteredTasks = filterTasks(state.tasks, state.filter, state.searchQuery)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload
      })
      // Generate suggestions
      .addCase(generateTaskSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload
      })
      .addCase(generateTaskSuggestions.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

// Helper function to filter tasks
const filterTasks = (tasks, filter, searchQuery) => {
  let filtered = tasks

  // Apply filter
  switch (filter) {
    case 'completed':
      filtered = filtered.filter(task => task.checked)
      break
    case 'pending':
      filtered = filtered.filter(task => !task.checked)
      break
    case 'high-priority':
      filtered = filtered.filter(task => task.priority === 'high' && !task.checked)
      break
    case 'overdue':
      filtered = filtered.filter(task => {
        const daysElapsed = Math.floor((new Date() - new Date(task.created_at)) / (1000 * 60 * 60 * 24))
        return daysElapsed > 7 && !task.checked
      })
      break
    default:
      break
  }

  // Apply search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(task =>
      task.description.toLowerCase().includes(query) ||
      task.category?.toLowerCase().includes(query)
    )
  }

  // Sort by priority and creation date
  return filtered.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export const {
  setFilter,
  setSearchQuery,
  toggleTask,
  setConversationMode,
  addClarifyingQuestion,
  setCurrentQuestion,
  clearClarifyingQuestions,
  clearSuggestions,
  clearError,
} = tasksSlice.actions

export default tasksSlice.reducer 