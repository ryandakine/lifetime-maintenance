import { useDispatch, useSelector } from 'react-redux'

// Custom hooks for each slice
export const useTasks = () => {
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks)
  
  return {
    ...tasks,
    dispatch,
  }
}

export const useShopping = () => {
  const dispatch = useDispatch()
  const shopping = useSelector(state => state.shopping)
  
  return {
    ...shopping,
    dispatch,
  }
}

export const useKnowledge = () => {
  const dispatch = useDispatch()
  const knowledge = useSelector(state => state.knowledge)
  
  return {
    ...knowledge,
    dispatch,
  }
}

export const useEmail = () => {
  const dispatch = useDispatch()
  const email = useSelector(state => state.email)
  
  return {
    ...email,
    dispatch,
  }
}

export const usePhotos = () => {
  const dispatch = useDispatch()
  const photos = useSelector(state => state.photos)
  
  return {
    ...photos,
    dispatch,
  }
}

export const useUI = () => {
  const dispatch = useDispatch()
  const ui = useSelector(state => state.ui)
  
  return {
    ...ui,
    dispatch,
  }
}

// Global app state hook
export const useAppState = () => {
  const dispatch = useDispatch()
  const state = useSelector(state => state)
  
  return {
    ...state,
    dispatch,
  }
}

// Selector hooks for specific data
export const useTasksList = () => useSelector(state => state.tasks.filteredTasks)
export const useTasksLoading = () => useSelector(state => state.tasks.loading)
export const useTasksError = () => useSelector(state => state.tasks.error)

export const useShoppingLists = () => ({
  mainList: useSelector(state => state.shopping.mainList),
  miscList: useSelector(state => state.shopping.miscList),
  activeList: useSelector(state => state.shopping.activeList),
})

export const useShoppingLoading = () => useSelector(state => state.shopping.loading)
export const useShoppingError = () => useSelector(state => state.shopping.error)

export const useActiveTab = () => useSelector(state => state.ui.activeTab)
export const useIsOnline = () => useSelector(state => state.ui.isOnline)
export const useIsMobile = () => useSelector(state => state.ui.isMobile)
export const useNotifications = () => useSelector(state => state.ui.notifications)
export const useErrors = () => useSelector(state => state.ui.errors) 