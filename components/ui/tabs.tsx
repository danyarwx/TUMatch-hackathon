import * as React from "react"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  value: '',
  onValueChange: () => {}
})

export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsTrigger({ value: triggerValue, children, className = '' }: TabsTriggerProps) {
  const { value, onValueChange } = React.useContext(TabsContext)
  const isActive = value === triggerValue

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all ${className}`}
      onClick={() => onValueChange(triggerValue)}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  )
}
