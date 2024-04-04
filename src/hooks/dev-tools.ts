import { useEffect, useState } from 'react'

export type PublisherDefinition = {
  type: 'publisher'
  id: string
  exchange?: string
  routingKey?: string
}

export type RecorderDefinition = {
  type: 'recorder'
  id: string
  exchange?: string
  routingKey?: string
}

export type DevToolDefinition = PublisherDefinition | RecorderDefinition

export type DevToolType = DevToolDefinition['type']

const LOCAL_STORAGE_KEY = 'dev-tools'

export function useDevTools() {
  const storedDevTools = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  const [devTools, setDevTools] = useState<DevToolDefinition[]>(
    storedDevTools ? JSON.parse(storedDevTools) : [],
  )

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(devTools))
  }, [devTools])

  const addDevTool = (data: Omit<DevToolDefinition, 'id'>) => {
    setDevTools([...devTools, { ...data, id: Date.now().toString() }])
  }

  const removeDevTool = (id: string) => {
    setDevTools(devTools.filter((tool) => tool.id != id))
  }

  const updateDevTool = (data: DevToolDefinition) => {
    setDevTools(
      devTools.map((existing) => (existing.id === data.id ? data : existing)),
    )
  }

  return { devTools, addDevTool, removeDevTool, updateDevTool }
}
