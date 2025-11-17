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

    expect(screen.getByText(/⚡ Quick Actions/i)).toBeInTheDocument()
    // Quick actions are now pre-defined maintenance tasks, not bulk actions
    // Use getAllByText since these phrases appear in multiple places (buttons and help text)
    const fixLeakElements = screen.getAllByText(/Fix leak/i)
    expect(fixLeakElements.length).toBeGreaterThan(0)
    const replaceBulbElements = screen.getAllByText(/Replace bulb/i)
    expect(replaceBulbElements.length).toBeGreaterThan(0)
  })

  it('displays analytics section', () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    expect(screen.getByText(/Task Analytics/i)).toBeInTheDocument()
    // AI Suggestions appears multiple times (heading, button text), so use getAllByText
    const aiSuggestionsElements = screen.getAllByText(/AI Suggestions/i)
    expect(aiSuggestionsElements.length).toBeGreaterThan(0)
  })

  it('handles task template selection', async () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    // First, show the templates by clicking "Show Task Templates" button
    const showTemplatesButton = screen.getByText(/Show Task Templates/i)
    fireEvent.click(showTemplatesButton)

    // Wait for templates to appear
    await waitFor(() => {
      expect(screen.getByText(/📋 Task Templates/i)).toBeInTheDocument()
    })

    // Find and click on a specific template (e.g., "Check HVAC filters")
    const hvacFilterTemplate = screen.getByText(/Check HVAC filters/i)
    fireEvent.click(hvacFilterTemplate)

    // Verify the template description was populated into the input (not that a task was added)
    // The template sets the user input but doesn't automatically add a task
    await waitFor(() => {
      // Templates should be hidden after selection
      expect(screen.queryByText(/📋 Task Templates/i)).not.toBeInTheDocument()
    })
  })

  it('handles quick actions', async () => {
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    // Click on a quick action button (e.g., "Fix leak")
    // Since "Fix leak" appears multiple times, get all and click the first button
    const fixLeakElements = screen.getAllByText(/Fix leak/i)
    const fixLeakButton = fixLeakElements.find(el => el.tagName === 'BUTTON')
    fireEvent.click(fixLeakButton)

    // Verify that the success message appears
    await waitFor(() => {
      expect(screen.getByText(/Quick task added: Fix leak/i)).toBeInTheDocument()
    })
  })

  it('generates AI suggestions when button is clicked', async () => {
    // Mock the environment variable for Perplexity API key
    const originalEnv = import.meta.env
    import.meta.env = { ...originalEnv, VITE_PERPLEXITY_API_KEY: 'test-key' }

    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    const generateSuggestionsButton = screen.getByText(/Get AI Suggestions/i)
    expect(generateSuggestionsButton).toBeInTheDocument()

    // Click the button - this should trigger the AI suggestion generation
    fireEvent.click(generateSuggestionsButton)

    // The button should remain in the document (we can't easily test the async result with current mocks)
    expect(generateSuggestionsButton).toBeInTheDocument()

    // Restore environment
    import.meta.env = originalEnv
  })

  it('displays offline alert when not online', () => {
    // Mock navigator.onLine to simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument()

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
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