import React, { useMemo } from 'react'
import {
    CheckCircle,
    Circle,
    AlertTriangle,
    Clock,
    Save,
    X,
    Edit,
    Trash2
} from 'lucide-react'

// Memoized Task Item Component
const TaskItem = React.memo(({
    task,
    onToggle,
    onDelete,
    onEdit,
    onSaveEdit,
    editingId,
    editText,
    setEditText,
    isMobile
}) => {
    const priorityColors = useMemo(() => ({
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
    }), [])

    const priorityIcons = useMemo(() => ({
        high: <AlertTriangle size={16} />,
        medium: <Clock size={16} />,
        low: <Circle size={16} />
    }), [])

    const isEditing = editingId === task.id

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: task.checked ? '#f8f9fa' : 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            opacity: task.checked ? 0.7 : 1,
            transition: 'all 0.2s ease'
        }}>
            {/* Priority Indicator */}
            <div style={{
                color: priorityColors[task.priority] || '#6c757d',
                display: 'flex',
                alignItems: 'center'
            }}>
                {priorityIcons[task.priority] || <Circle size={16} />}
            </div>

            {/* Checkbox */}
            <button
                onClick={() => onToggle(task.id)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: task.checked ? '#10b981' : '#6c757d',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {task.checked ? <CheckCircle size={20} /> : <Circle size={20} />}
            </button>

            {/* Task Content */}
            <div style={{ flex: 1 }}>
                {isEditing ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                ) : (
                    <div>
                        <div style={{
                            textDecoration: task.checked ? 'line-through' : 'none',
                            color: task.checked ? '#6c757d' : '#212529',
                            fontSize: '1rem',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            {task.description}
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.8rem',
                            color: '#6c757d',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                backgroundColor: priorityColors[task.priority] || '#6c757d',
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase'
                            }}>
                                {task.priority || 'medium'}
                            </span>
                            {task.category && (
                                <span style={{
                                    backgroundColor: '#e9ecef',
                                    color: '#495057',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem'
                                }}>
                                    {task.category}
                                </span>
                            )}
                            {task.daysElapsed > 0 && (
                                <span style={{
                                    backgroundColor: task.daysElapsed > 7 ? '#fff3cd' : '#d1ecf1',
                                    color: task.daysElapsed > 7 ? '#856404' : '#0c5460',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem'
                                }}>
                                    {task.daysElapsed} day{task.daysElapsed !== 1 ? 's' : ''} old
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                opacity: isEditing ? 0 : 1,
                transition: 'opacity 0.2s ease'
            }}>
                {isEditing ? (
                    <>
                        <button
                            onClick={() => onSaveEdit(task.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#10b981',
                                padding: '0.25rem'
                            }}
                        >
                            <Save size={16} />
                        </button>
                        <button
                            onClick={() => onEdit(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6c757d',
                                padding: '0.25rem'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onEdit(task.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#007bff',
                                padding: '0.25rem'
                            }}
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#dc3545',
                                padding: '0.25rem'
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
})

TaskItem.displayName = 'TaskItem'

export default TaskItem
