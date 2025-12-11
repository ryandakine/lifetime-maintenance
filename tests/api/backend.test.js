import { describe, test, expect, beforeAll, afterAll } from 'vitest'

/**
 * API Integration Tests - Backend Rust Server
 * Tests the actual HTTP endpoints to ensure they work correctly
 */

const API_BASE_URL = 'http://localhost:3001'

describe('Equipment API', () => {
    test('GET /equipment - should return paginated equipment list', async () => {
        const response = await fetch(`${API_BASE_URL}/equipment?limit=10&offset=0`)

        expect(response.ok).toBe(true)
        expect(response.status).toBe(200)

        const data = await response.json()

        // Check response structure
        expect(data).toHaveProperty('data')
        expect(data).toHaveProperty('pagination')
        expect(Array.isArray(data.data)).toBe(true)

        // Check pagination metadata
        expect(data.pagination).toHaveProperty('limit')
        expect(data.pagination).toHaveProperty('offset')
        expect(data.pagination).toHaveProperty('total')
        expect(data.pagination.limit).toBe(10)
        expect(data.pagination.offset).toBe(0)
    })

    test('GET /equipment - should handle custom pagination', async () => {
        const response = await fetch(`${API_BASE_URL}/equipment?limit=5&offset=10`)
        const data = await response.json()

        expect(data.pagination.limit).toBe(5)
        expect(data.pagination.offset).toBe(10)
    })

    test('GET /equipment - should use default limit when not specified', async () => {
        const response = await fetch(`${API_BASE_URL}/equipment`)
        const data = await response.json()

        expect(data.pagination.limit).toBe(20) // Default limit
        expect(data.pagination.offset).toBe(0)
    })
})

describe('Tasks API', () => {
    test('GET /tasks - should return paginated tasks list', async () => {
        const response = await fetch(`${API_BASE_URL}/tasks?limit=10&offset=0`)

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data).toHaveProperty('data')
        expect(data).toHaveProperty('pagination')
        expect(Array.isArray(data.data)).toBe(true)
    })

    test('GET /tasks - should respect pagination parameters', async () => {
        const response = await fetch(`${API_BASE_URL}/tasks?limit=15&offset=5`)
        const data = await response.json()

        expect(data.pagination.limit).toBe(15)
        expect(data.pagination.offset).toBe(5)
    })
})

describe('AI Analysis API', () => {
    test('POST /analyze - should analyze equipment description', async () => {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Treadmill belt is worn and fraying',
                context: 'Equipment ID: 123, Location: Gym Floor 2'
            })
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data).toHaveProperty('analysis')
        expect(data).toHaveProperty('priority')
        expect(typeof data.analysis).toBe('string')
        expect(['low', 'medium', 'high', 'critical']).toContain(data.priority)
    })

    test('POST /analyze - should handle missing context', async () => {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Equipment malfunction',
                context: ''
            })
        })

        expect(response.ok).toBe(true)
    })
})

describe('Health Check', () => {
    test('GET / - should return server status', async () => {
        const response = await fetch(`${API_BASE_URL}/`)

        expect(response.ok).toBe(true)
        const text = await response.text()

        expect(text).toContain('Rust Agent')
        expect(text).toContain('DB Connected')
    })
})

describe('CORS Configuration', () => {
    test('should allow cross-origin requests', async () => {
        const response = await fetch(`${API_BASE_URL}/equipment`, {
            headers: {
                'Origin': 'http://localhost:3000'
            }
        })

        expect(response.headers.get('access-control-allow-origin')).toBeTruthy()
    })
})

describe('Error Handling', () => {
    test('should handle invalid pagination parameters gracefully', async () => {
        const response = await fetch(`${API_BASE_URL}/equipment?limit=-1&offset=-1`)

        // Should either return 400 or handle gracefully with defaults
        if (!response.ok) {
            expect(response.status).toBe(400)
        } else {
            const data = await response.json()
            expect(data.pagination.limit).toBeGreaterThan(0)
            expect(data.pagination.offset).toBeGreaterThanOrEqual(0)
        }
    })

    test('should return 404 for non-existent endpoints', async () => {
        const response = await fetch(`${API_BASE_URL}/nonexistent`)
        expect(response.status).toBe(404)
    })
})
