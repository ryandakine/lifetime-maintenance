
import { describe, it, expect } from 'vitest'
import { analyzeTaskInput, analyzeSingleTask, TASK_TEMPLATES } from '../services/TaskAnalysisService'

describe('TaskAnalysisService', () => {
    describe('analyzeSingleTask', () => {
        it('should parse simple tasks', () => {
            const input = "Fix the sink"
            const result = analyzeSingleTask(input)
            expect(result.taskDescription).toBe("Fix the sink")
            expect(result.category).toBe("Plumbing")
        })

        it('should detect high priority urgent tasks', () => {
            const input = "Fix leak urgent"
            const result = analyzeSingleTask(input)
            expect(result.priority).toBe(1)
            expect(result.taskDescription).toBe("Fix leak")
        })

        it('should detect timing words', () => {
            const input = "Check HVAC tomorrow morning"
            const result = analyzeSingleTask(input)
            expect(result.timing).toBe("tomorrow")
            expect(result.timeOfDay).toBe("morning")
            expect(result.category).toBe("HVAC")
        })

        it('should flag clarification needed for vague tasks', () => {
            const input = "Paint wall"
            const result = analyzeSingleTask(input)
            expect(result.needsClarification).toBe(true) // Missing priority/timing
            expect(result.category).toBe("Painting")
        })
    })

    describe('analyzeTaskInput', () => {
        it('should handle single task', () => {
            const result = analyzeTaskInput("Fix light")
            expect(Array.isArray(result)).toBe(false)
            expect(result.category).toBe("Electrical")
        })

        it('should split multiple tasks', () => {
            const result = analyzeTaskInput("Fix light and clean vents")
            expect(Array.isArray(result)).toBe(true)
            expect(result.length).toBe(2)
            expect(result[0].taskDescription).toBe("Fix light")
            expect(result[1].taskDescription).toBe("clean vents")
        })
    })
})
