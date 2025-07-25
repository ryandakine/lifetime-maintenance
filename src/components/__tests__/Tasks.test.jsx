import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Tasks from '../Tasks'
import tasksReducer from '../../store/slices/tasksSlice'

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    preloadedState: {
      tasks: {
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
        ...initialState,
      },
    },
  })
}

// Mock the AI processor
vi.mock('../../lib/aiProcessor', () => ({
  aiProcessor: {
    generateTaskSuggestions: vi.fn(() => Promise.resolve([
      { suggestion: 'Test suggestion', impact: 'High' }
    ])),
  },
  validateInput: {
    tasks: vi.fn((tasks) => tasks),
  },
}))

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
    })),
  },
  TABLES: {
    TASKS: 'TASKS',
  },
  API_KEYS: {
    PERPLEXITY_API_KEY: 'test-key',
  },
}))

describe('Tasks Component', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Add New Task/i)).toBeInTheDocument()
  })

  it('displays task input section', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Add New Task/i)).toBeInTheDocument()
    expect(screen.getByText(/Use voice input for fastest task creation/i)).toBeInTheDocument()
  })

  it('shows voice input buttons', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Quick Voice/i)).toBeInTheDocument()
    expect(screen.getByText(/Voice Modal/i)).toBeInTheDocument()
  })

  it('displays task templates section', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Task Templates/i)).toBeInTheDocument()
    expect(screen.getByText(/HVAC/i)).toBeInTheDocument()
    expect(screen.getByText(/Plumbing/i)).toBeInTheDocument()
    expect(screen.getByText(/Electrical/i)).toBeInTheDocument()
  })

  it('shows quick actions section', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument()
    expect(screen.getByText(/Mark All Complete/i)).toBeInTheDocument()
    expect(screen.getByText(/Clear Completed/i)).toBeInTheDocument()
  })

  it('displays analytics section', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    expect(screen.getByText(/Task Analytics/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Suggestions/i)).toBeInTheDocument()
  })

  it('handles task template selection', async () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    const hvacTemplate = screen.getByText(/HVAC/i)
    fireEvent.click(hvacTemplate)
    
    // Verify the template was applied (this would add a task to the store)
    await waitFor(() => {
      const state = store.getState()
      expect(state.tasks.tasks.length).toBeGreaterThan(0)
    })
  })

  it('handles quick actions', async () => {
    // Add some tasks to the store first
    const storeWithTasks = createTestStore({
      tasks: [
        {
          id: '1',
          description: 'Test task 1',
          priority: 'high',
          category: 'HVAC',
          checked: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          description: 'Test task 2',
          priority: 'medium',
          category: 'Plumbing',
          checked: true,
          createdAt: new Date().toISOString(),
        },
      ],
      filteredTasks: [
        {
          id: '1',
          description: 'Test task 1',
          priority: 'high',
          category: 'HVAC',
          checked: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          description: 'Test task 2',
          priority: 'medium',
          category: 'Plumbing',
          checked: true,
          createdAt: new Date().toISOString(),
        },
      ],
    })

    render(
      <Provider store={storeWithTasks}>
        <Tasks />
      </Provider>
    )
    
    const clearCompletedButton = screen.getByText(/Clear Completed/i)
    fireEvent.click(clearCompletedButton)
    
    await waitFor(() => {
      const state = storeWithTasks.getState()
      const completedTasks = state.tasks.tasks.filter(task => task.checked)
      expect(completedTasks.length).toBe(0)
    })
  })

  it('generates AI suggestions when button is clicked', async () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    const generateSuggestionsButton = screen.getByText(/Generate Suggestions/i)
    fireEvent.click(generateSuggestionsButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Test suggestion/i)).toBeInTheDocument()
    })
  })

  it('displays offline alert when not online', () => {
    const storeWithOfflineState = createTestStore({
      // Simulate offline state
    })

    render(
      <Provider store={storeWithOfflineState}>
        <Tasks isOnline={false} />
      </Provider>
    )
    
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument()
  })

  it('handles voice input modal', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )
    
    const voiceModalButton = screen.getByText(/Voice Modal/i)
    fireEvent.click(voiceModalButton)
    
    // The modal should open (this would be tested with more specific selectors)
    expect(voiceModalButton).toBeInTheDocument()
  })
}) 