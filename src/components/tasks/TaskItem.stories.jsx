
import TaskItem from './TaskItem';

export default {
    title: 'Tasks/TaskItem',
    component: TaskItem,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

const baseTask = {
    id: '1',
    description: 'Sample Task Description',
    priority: 2, // Medium
    category: 'General',
    checked: false,
    daysElapsed: 0,
};

export const Default = {
    args: {
        task: baseTask,
        onToggle: () => console.log('Toggled'),
        onDelete: () => console.log('Deleted'),
        onEdit: () => console.log('Edit'),
    },
};

export const HighPriority = {
    args: {
        task: { ...baseTask, priority: 1, description: 'Fix Gas Leak ASAP' },
    },
};

export const LowPriority = {
    args: {
        task: { ...baseTask, priority: 3, description: 'Paint Shed Eventually' },
    },
};

export const Completed = {
    args: {
        task: { ...baseTask, checked: true },
    },
};

export const Editing = {
    args: {
        ...Default.args,
        editingId: '1',
        editText: 'Sample Task Description',
    },
};
