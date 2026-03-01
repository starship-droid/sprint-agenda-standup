import { useEffect, useRef, useCallback } from 'react'
import Ably from 'ably'

const CHANNEL_NAME = 'lightning-ladder-notes__' +
  (window.location.hostname + window.location.pathname)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

export function useAblyNotes({ onNotesUpdate }) {
  const clientRef  = useRef(null)
  const channelRef = useRef(null)
  const isMounted  = useRef(true)
  const timerRef   = useRef(null)

  useEffect(() => {
    isMounted.current = true

    const apiKey = import.meta.env.VITE_ABLY_API_KEY
    if (!apiKey) return

    let client
    try {
      client = new Ably.Realtime({
        key: apiKey,
        clientId: 'notes-' + Math.random().toString(36).slice(2),
      })
    } catch {
      return
    }
    clientRef.current = client

    const channel = client.channels.get(CHANNEL_NAME, { params: { rewind: '1' } })
    channelRef.current = channel

    channel.subscribe('notes', (message) => {
      if (isMounted.current && message.data != null) {
        onNotesUpdate?.(message.data)
      }
    })

    return () => {
      isMounted.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      channel.unsubscribe()
      client.close()
    }
  }, []) // eslint-disable-line

  // Debounced publish — waits 300ms after last keystroke to avoid flooding
  const publish = useCallback((text) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      channelRef.current?.publish('notes', text)
    }, 300)
  }, [])

  return { publish }
}
