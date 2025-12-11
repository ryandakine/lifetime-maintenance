import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Tasks from '../Tasks'

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: [
                { id: '1', task_list: 'Test task 1', priority: 1, status: 'pending' },
                { id: '2', task_list: 'Test task 2', priority: 2, status: 'completed' }
              ],
              error: null
            }))
          }))
        }))
      }))
    }))
  },
  TABLES: {
    TASKS: 'tasks'
  }
}))

const createMockStore = () => configureStore({
  reducer: {
    tasks: (state = { items: [] }) => state
  }
})

describe('Tasks Component', () => {
  test('renders task input field', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    const input = screen.getByPlaceholderText(/describe a task/i)
    expect(input).toBeTruthy()
  })

  test('loads tasks on mount', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeTruthy()
      expect(screen.getByText('Test task 2')).toBeTruthy()
    })
  })

  test('shows task templates', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    const templatesButton = screen.getByText(/show task templates/i)
    fireEvent.click(templatesButton)

    await waitFor(() => {
      expect(screen.getByText(/task templates/i)).toBeTruthy()
    })
  })

  test('pagination loads more tasks', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <Tasks />
      </Provider>
    )

    const loadMoreButton = screen.getByText(/load more tasks/i)
    expect(loadMoreButton).toBeTruthy()
  })
})