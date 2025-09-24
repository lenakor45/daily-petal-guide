import { useState, useEffect } from "react"
import { Bell, X, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/integrations/supabase/types"
import { cn } from "@/lib/utils"

type Task = Tables<"tasks">

interface ReminderSystemProps {
  className?: string
}

export function ReminderSystem({ className }: ReminderSystemProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [showReminders, setShowReminders] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReminders()
      // Запрашиваем разрешение на уведомления
      requestNotificationPermission()
      
      // Проверяем напоминания каждую минуту
      const interval = setInterval(checkReminders, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  const fetchReminders = async () => {
    if (!user) return

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    
    try {
      // Получаем просроченные задачи
      const { data: overdue, error: overdueError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .lt("due_date", now.toISOString())

      if (overdueError) throw overdueError
      setOverdueTasks(overdue || [])

      // Получаем предстоящие задачи (в течение часа)
      const { data: upcoming, error: upcomingError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .gte("due_date", now.toISOString())
        .lte("due_date", oneHourFromNow.toISOString())

      if (upcomingError) throw upcomingError
      setUpcomingTasks(upcoming || [])
      
    } catch (error) {
      console.error("Error fetching reminders:", error)
    }
  }

  const checkReminders = () => {
    const now = new Date()
    
    upcomingTasks.forEach(task => {
      if (!task.due_date) return
      
      const taskTime = new Date(task.due_date)
      const timeDiff = taskTime.getTime() - now.getTime()
      
      // Уведомление за 15 минут
      if (timeDiff <= 15 * 60 * 1000 && timeDiff > 14 * 60 * 1000) {
        showNotification(task, "15 минут")
      }
      // Уведомление за 5 минут
      else if (timeDiff <= 5 * 60 * 1000 && timeDiff > 4 * 60 * 1000) {
        showNotification(task, "5 минут")
      }
      // Уведомление в момент срока
      else if (timeDiff <= 0 && timeDiff > -60 * 1000) {
        showNotification(task, "сейчас")
      }
    })
  }

  const showNotification = (task: Task, timeLeft: string) => {
    // Браузерное уведомление
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Напоминание: ${task.title}`, {
        body: `Задача должна быть выполнена ${timeLeft}`,
        icon: "/favicon.ico"
      })
    }

    // Toast уведомление
    toast({
      title: "🔔 Напоминание",
      description: `${task.title} - ${timeLeft}`,
      duration: 5000
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  const totalReminders = overdueTasks.length + upcomingTasks.length

  if (totalReminders === 0) return null

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReminders(!showReminders)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {totalReminders > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
            {totalReminders}
          </Badge>
        )}
      </Button>

      {showReminders && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Напоминания</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReminders(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 max-h-80 overflow-y-auto">
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Просрочено ({overdueTasks.length})
                </div>
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(task.due_date!)} в {formatTime(task.due_date!)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" />
                  Скоро ({upcomingTasks.length})
                </div>
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg border border-primary/20 bg-primary/5"
                  >
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(task.due_date!)} в {formatTime(task.due_date!)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}