import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeTab: 'tasks',
  isOnline: navigator.onLine,
  isMobile: window.innerWidth <= 768,
  showOfflineAlert: false,
  notifications: [],
  modals: {
    voiceModal: false,
    settingsModal: false,
    helpModal: false,
  },
  theme: {
    mode: 'light', // 'light' | 'dark' | 'auto'
    primaryColor: '#1a3d2f',
    secondaryColor: '#bfc1c2',
  },
  sidebar: {
    collapsed: false,
    width: 250,
  },
  loading: {
    global: false,
    tasks: false,
    shopping: false,
    knowledge: false,
    email: false,
    photos: false,
  },
  errors: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setIsOnline: (state, action) => {
      state.isOnline = action.payload
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload
    },
    setShowOfflineAlert: (state, action) => {
      state.showOfflineAlert = action.payload
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      }
      state.notifications.unshift(notification)
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10)
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setModal: (state, action) => {
      const { modal, isOpen } = action.payload
      if (Object.prototype.hasOwnProperty.call(state.modals, modal)) {
        state.modals[modal] = isOpen
      }
    },
    setTheme: (state, action) => {
      state.theme = { ...state.theme, ...action.payload }
    },
    toggleSidebar: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed
    },
    setSidebarWidth: (state, action) => {
      state.sidebar.width = action.payload
    },
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload
      if (Object.prototype.hasOwnProperty.call(state.loading, key)) {
        state.loading[key] = isLoading
      }
    },
    addError: (state, action) => {
      const error = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      }
      state.errors.unshift(error)
      
      // Keep only last 20 errors
      if (state.errors.length > 20) {
        state.errors = state.errors.slice(0, 20)
      }
    },
    removeError: (state, action) => {
      state.errors = state.errors.filter(error => error.id !== action.payload)
    },
    clearErrors: (state) => {
      state.errors = []
    },
  },
})

export const {
  setActiveTab,
  setIsOnline,
  setIsMobile,
  setShowOfflineAlert,
  addNotification,
  removeNotification,
  clearNotifications,
  setModal,
  setTheme,
  toggleSidebar,
  setSidebarWidth,
  setLoading,
  addError,
  removeError,
  clearErrors,
} = uiSlice.actions

export default uiSlice.reducer 