"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertCircle, Info } from "lucide-react"
import { Button } from "./button"

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationProps {
  notification: Notification
  onDismiss: (id: string) => void
}

const icons = {
  success: Check,
  error: X,
  warning: AlertCircle,
  info: Info,
}

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
}

export function NotificationItem({ notification, onDismiss }: NotificationProps) {
  const Icon = icons[notification.type]

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onDismiss(notification.id)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onDismiss])

  return (
    <div
      className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      border rounded-lg shadow-lg p-4
      transform transition-all duration-300 ease-in-out
      ${styles[notification.type]}
    `}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          {notification.message && <p className="text-sm opacity-90 mt-1">{notification.message}</p>}
          {notification.action && (
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={notification.action.onClick}>
              {notification.action.label}
            </Button>
          )}
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={removeNotification} />
      ))}
    </div>
  )

  return {
    addNotification,
    removeNotification,
    NotificationContainer,
  }
}
