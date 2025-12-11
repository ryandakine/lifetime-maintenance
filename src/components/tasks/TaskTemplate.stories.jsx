
import TaskTemplate from './TaskTemplate';

export default {
    title: 'Tasks/TaskTemplate',
    component: TaskTemplate,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export const Default = {
    args: {
        template: {
            name: 'Check Filters',
            description: 'Replace HVAC filters',
            icon: '🌬️',
        },
        onSelect: (t) => console.log('Selected', t),
    },
};

export const MobileView = {
    args: {
        ...Default.args,
        isMobile: true,
    },
};
