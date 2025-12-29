import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const sessionStore = new Map<string, { userId: string }>()

export function createSession(userId: string) {
    const sessionId = uuidv4()
    sessionStore.set(sessionId, { userId })
    return sessionId
}

export function getSession(sessionId: string) {
    return sessionStore.get(sessionId)
}

export function destroySession(sessionId: string) {
    sessionStore.delete(sessionId)
}
