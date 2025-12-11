/**
 * TaskAnalysisService.js
 * 
 * Contains business logic for Task NLP parsing, prioritization, and analysis.
 * Extracted from Tasks.jsx to decouple logic from view.
 */

export const TASK_PRIORITY = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
}

export const PRIORITY_LABELS = {
    [TASK_PRIORITY.HIGH]: 'Daily',
    [TASK_PRIORITY.MEDIUM]: 'Weekly',
    [TASK_PRIORITY.LOW]: 'Monthly'
}

export const PRIORITY_DESCRIPTIONS = {
    [TASK_PRIORITY.HIGH]: 'High Priority - Do Today',
    [TASK_PRIORITY.MEDIUM]: 'Medium Priority - This Week',
    [TASK_PRIORITY.LOW]: 'Low Priority - When Possible'
}

export const TASK_TEMPLATES = {
    HVAC: [
        { name: 'Check HVAC filters', description: 'Inspect and replace HVAC air filters', priority: 2, time: 30, complexity: 'low' },
        { name: 'Clean HVAC vents', description: 'Clean and dust HVAC vents and registers', priority: 2, time: 60, complexity: 'low' },
        { name: 'Test thermostat', description: 'Test thermostat functionality and calibration', priority: 1, time: 45, complexity: 'medium' },
        { name: 'HVAC maintenance', description: 'Schedule professional HVAC maintenance', priority: 2, time: 120, complexity: 'medium' },
        { name: 'Fix HVAC unit', description: 'Repair HVAC unit issues', priority: 1, time: 180, complexity: 'high' }
    ],
    Plumbing: [
        { name: 'Fix leaky faucet', description: 'Repair or replace leaky faucet', priority: 1, time: 90, complexity: 'medium' },
        { name: 'Unclog drain', description: 'Clear clogged drain or pipe', priority: 1, time: 60, complexity: 'medium' },
        { name: 'Replace toilet parts', description: 'Replace toilet flapper, handle, or other parts', priority: 2, time: 45, complexity: 'low' },
        { name: 'Fix running toilet', description: 'Repair toilet that keeps running', priority: 1, time: 30, complexity: 'low' },
        { name: 'Check water pressure', description: 'Test and adjust water pressure', priority: 2, time: 30, complexity: 'low' }
    ],
    Electrical: [
        { name: 'Replace light bulb', description: 'Replace burned out light bulbs', priority: 2, time: 15, complexity: 'low' },
        { name: 'Fix outlet', description: 'Repair or replace electrical outlet', priority: 1, time: 60, complexity: 'medium' },
        { name: 'Test circuit breaker', description: 'Test and reset circuit breakers', priority: 1, time: 30, complexity: 'low' },
        { name: 'Install light fixture', description: 'Install new light fixture', priority: 2, time: 120, complexity: 'medium' },
        { name: 'Check electrical panel', description: 'Inspect electrical panel for issues', priority: 1, time: 45, complexity: 'medium' }
    ],
    SpecialProject: [
        { name: 'Remodel Locker Room', description: 'Full remodel of the locker room area', priority: 1, time: 1440, complexity: 'high' },
        { name: 'Install New Equipment', description: 'Install and set up new gym equipment', priority: 2, time: 240, complexity: 'medium' },
        { name: 'Renovate Office', description: 'Renovate and update office space', priority: 2, time: 480, complexity: 'high' },
        { name: 'Paint Facility Exterior', description: 'Paint the exterior of the facility', priority: 3, time: 720, complexity: 'medium' }
    ]
}

export const QUICK_ACTIONS = [
    { name: 'Fix leak', description: 'Fix water leak', category: 'Plumbing', priority: 1, time: 60, complexity: 'medium' },
    { name: 'Replace bulb', description: 'Replace light bulb', category: 'Electrical', priority: 2, time: 15, complexity: 'low' },
    { name: 'Unclog drain', description: 'Unclog drain', category: 'Plumbing', priority: 1, time: 60, complexity: 'medium' },
    { name: 'Check equipment', description: 'Check equipment', category: 'Equipment', priority: 2, time: 30, complexity: 'low' }
]

/**
 * Analyzes a raw input string and extracts task details.
 * Handles multiple tasks if separators are present.
 * @param {string} input 
 * @returns {Object|Array} Analysis object or array of analysis objects
 */
export const analyzeTaskInput = (input) => {
    // First, detect if there are multiple tasks in the input
    const taskSeparators = [
        ' and ', ' also ', ' plus ', ' furthermore ', ' additionally ', ' moreover ',
        ' as well as ', ' along with ', ' in addition ', ' besides ', ' not to mention ',
        ' on top of that ', ' what\'s more ', ' to add ', ' to include '
    ]

    // Check if input contains task separators
    for (const separator of taskSeparators) {
        if (input.toLowerCase().includes(separator.toLowerCase())) {
            // Split on the separator and clean up each part
            const tasks = input.split(new RegExp(separator, 'gi'))
                .map(task => task.trim())
                .filter(task => task.length > 0)

            if (tasks.length > 1) {
                return tasks.map(task => analyzeSingleTask(task))
            }
        }
    }

    // Otherwise, analyze as a single task
    return analyzeSingleTask(input)
}

/**
 * analyzes a single task string
 * @param {string} input 
 * @returns {Object} Analysis result
 */
export const analyzeSingleTask = (input) => {
    const analysis = {
        taskDescription: '',
        priority: null,
        timing: null,
        weekOfMonth: null,
        dayOfWeek: null,
        timeOfDay: null,
        category: null,
        estimatedTime: null,
        dependencies: [],
        complexity: null,
        needsClarification: false,
        questions: []
    }

    const lowerInput = input.toLowerCase()

    // Extract task description (remove timing/priority words)
    let description = input
    const timingWords = ['today', 'tomorrow', 'this week', 'next week', 'this month', 'next month', 'urgent', 'asap', 'immediate', 'soon', 'eventually', 'high priority', 'low priority', 'medium priority']
    timingWords.forEach(word => {
        description = description.replace(new RegExp(word, 'gi'), '').trim()
    })
    analysis.taskDescription = description

    // Auto-categorize tasks based on keywords
    // (Simplified for brevity, logic copied from Tasks.jsx)
    if (lowerInput.match(/hvac|air|heating|cooling|thermostat/)) analysis.category = 'HVAC'
    else if (lowerInput.match(/plumbing|pipe|toilet|sink|drain|faucet/)) analysis.category = 'Plumbing'
    else if (lowerInput.match(/electrical|outlet|switch|light|breaker|wiring/)) analysis.category = 'Electrical'
    else if (lowerInput.match(/carpentry|wood|door|cabinet|shelf|trim/)) analysis.category = 'Carpentry'
    else if (lowerInput.match(/cleaning|clean|dust|vacuum|wipe/)) analysis.category = 'Cleaning'
    else if (lowerInput.match(/painting|paint|touch up|color/)) analysis.category = 'Painting'
    else if (lowerInput.match(/landscaping|yard|garden|plant|grass|tree/)) analysis.category = 'Landscaping'
    else if (lowerInput.match(/equipment|machine|treadmill|bike|weight|fitness/)) analysis.category = 'Equipment'
    else if (lowerInput.match(/safety|emergency|fire|alarm|exit|security/)) analysis.category = 'Safety'
    else analysis.category = 'General'

    // Estimate time based on task complexity
    if (lowerInput.match(/quick|simple|minor|small/)) {
        analysis.estimatedTime = 30
        analysis.complexity = 'low'
    } else if (lowerInput.match(/major|big|complex|extensive|complete/)) {
        analysis.estimatedTime = 240
        analysis.complexity = 'high'
    } else if (lowerInput.match(/replace|install|repair/)) {
        analysis.estimatedTime = 120
        analysis.complexity = 'medium'
    } else {
        analysis.estimatedTime = 60
        analysis.complexity = 'medium'
    }

    // Detect dependencies
    if (lowerInput.match(/after|once|when|then/)) {
        analysis.dependencies = ['other_task']
    }

    // Detect priority
    if (lowerInput.match(/urgent|asap|immediate|critical|emergency|high priority/)) analysis.priority = 1
    else if (lowerInput.match(/important|need to|should|medium priority/)) analysis.priority = 2
    else if (lowerInput.match(/eventually|when possible|low priority/)) analysis.priority = 3

    // Detect timing
    if (lowerInput.includes('today')) analysis.timing = 'today'
    else if (lowerInput.includes('tomorrow')) analysis.timing = 'tomorrow'
    else if (lowerInput.includes('this week')) analysis.timing = 'this_week'
    else if (lowerInput.includes('next week')) analysis.timing = 'next_week'
    else if (lowerInput.includes('this month')) analysis.timing = 'this_month'
    else if (lowerInput.includes('next month')) analysis.timing = 'next_month'

    // Detect specific timing details
    if (lowerInput.match(/morning|am/)) analysis.timeOfDay = 'morning'
    else if (lowerInput.match(/afternoon|pm/)) analysis.timeOfDay = 'afternoon'
    else if (lowerInput.match(/evening|night/)) analysis.timeOfDay = 'evening'

    // Detect day of week
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days.forEach(day => {
        if (lowerInput.includes(day)) analysis.dayOfWeek = day
    })

    // Detect week of month
    if (lowerInput.match(/first week|1st week/)) analysis.weekOfMonth = 1
    else if (lowerInput.match(/second week|2nd week/)) analysis.weekOfMonth = 2
    else if (lowerInput.match(/third week|3rd week/)) analysis.weekOfMonth = 3
    else if (lowerInput.match(/fourth week|4th week/)) analysis.weekOfMonth = 4

    // Generate clarifying questions triggers
    if (!analysis.priority) analysis.needsClarification = true
    if (analysis.timing === 'today' && !analysis.timeOfDay) analysis.needsClarification = true
    if (analysis.timing === 'this_week' && !analysis.dayOfWeek) analysis.needsClarification = true
    if (analysis.timing === 'this_month' && !analysis.weekOfMonth) analysis.needsClarification = true

    return analysis
}

/**
 * Generates clarifying questions objects based on analysis gaps
 * @param {Object} analysis 
 * @returns {Array} Array of question objects
 */
export const generateClarifyingQuestions = (analysis) => {
    const questions = []

    if (!analysis.priority) {
        questions.push({
            id: 'priority',
            question: 'What is the priority level for this task?',
            type: 'select',
            options: [
                { value: 1, label: PRIORITY_DESCRIPTIONS[1] },
                { value: 2, label: PRIORITY_DESCRIPTIONS[2] },
                { value: 3, label: PRIORITY_DESCRIPTIONS[3] }
            ]
        })
    }

    if (analysis.timing === 'today' && !analysis.timeOfDay) {
        questions.push({
            id: 'timeOfDay',
            question: 'What time of day should this be done?',
            type: 'select',
            options: [
                { value: 'morning', label: 'Morning' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening' },
                { value: 'anytime', label: 'Anytime' }
            ]
        })
    }

    if (analysis.timing === 'this_week' && !analysis.dayOfWeek) {
        questions.push({
            id: 'dayOfWeek',
            question: 'Which day of the week should this be done?',
            type: 'select',
            options: [
                { value: 'monday', label: 'Monday' },
                { value: 'tuesday', label: 'Tuesday' },
                { value: 'wednesday', label: 'Wednesday' },
                { value: 'thursday', label: 'Thursday' },
                { value: 'friday', label: 'Friday' },
                { value: 'saturday', label: 'Saturday' },
                { value: 'sunday', label: 'Sunday' },
                { value: 'anyday', label: 'Any day' }
            ]
        })
    }

    if (analysis.timing === 'this_month' && !analysis.weekOfMonth) {
        questions.push({
            id: 'weekOfMonth',
            question: 'Which week of the month should this be done?',
            type: 'select',
            options: [
                { value: 1, label: '1st week of the month' },
                { value: 2, label: '2nd week of the month' },
                { value: 3, label: '3rd week of the month' },
                { value: 4, label: '4th week of the month' },
                { value: 0, label: 'Any week' }
            ]
        })
    }

    return questions
}

/**
 * @param {string} createdAt ISO Date string
 * @returns {number} Days elapsed
 */
export const getDaysElapsed = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

/**
 * Generates smart suggestions based on task list state
 * @param {Array} tasks List of task objects
 * @returns {Array} List of suggestion objects
 */
export const generateSmartSuggestions = (tasks) => {
    const suggestions = []

    // Analyze task patterns
    const highPriorityTasks = tasks.filter(task => task.priority === 1)
    const oldTasks = tasks.filter(task => getDaysElapsed(task.created_at) > 7)
    const completedToday = tasks.filter(task =>
        task.status === 'completed' &&
        getDaysElapsed(task.created_at) === 0
    )

    // Suggest based on patterns
    if (highPriorityTasks.length > 3) {
        suggestions.push({
            type: 'warning',
            message: `You have ${highPriorityTasks.length} high-priority tasks. Consider delegating some or adjusting priorities.`,
            action: 'review_priorities'
        })
    }

    if (oldTasks.length > 5) {
        suggestions.push({
            type: 'urgent',
            message: `You have ${oldTasks.length} tasks older than a week. Focus on completing the oldest ones first.`,
            action: 'focus_old_tasks'
        })
    }

    if (completedToday.length === 0) {
        suggestions.push({
            type: 'info',
            message: 'No tasks completed today. Start with a quick win to build momentum!',
            action: 'suggest_quick_tasks'
        })
    }

    // Suggest based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
        suggestions.push({
            type: 'tip',
            message: 'Morning is perfect for complex tasks. Tackle your most challenging work now.',
            action: 'morning_optimization'
        })
    } else if (hour > 16) {
        suggestions.push({
            type: 'tip',
            message: 'End of day approaching. Focus on quick wins and preparation for tomorrow.',
            action: 'evening_optimization'
        })
    }

    return suggestions
}
