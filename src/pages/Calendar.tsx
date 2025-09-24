import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types"

type Task = Tables<"tasks">

type ViewMode = "month" | "week" | "day"

export default function Calendar() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (user) {
      fetchMonthTasks()
    }
  }, [user, currentDate])

  const fetchMonthTasks = async () => {
    if (!user) return
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", startOfMonth.toISOString())
        .lte("due_date", endOfMonth.toISOString())

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const formatDate = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
    } else if (viewMode === "week") {
      return `Неделя ${currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
    } else {
      return currentDate.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // Mock cycle data - в будущем можно подключить к реальной таблице циклов
  const cycleData = [
    { date: 12, type: "period" },
    { date: 13, type: "period" },
    { date: 14, type: "period" },
    { date: 22, type: "fertile" },
    { date: 23, type: "fertile" },
    { date: 24, type: "ovulation" },
  ]

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getDayData = (day: number) => {
    const dayTasks = tasks.filter(task => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return taskDate.getDate() === day &&
             taskDate.getMonth() === currentDate.getMonth() &&
             taskDate.getFullYear() === currentDate.getFullYear()
    })
    const cycle = cycleData.find(c => c.date === day)
    return { tasks: dayTasks, cycle }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Календарь</h1>
          <p className="text-sm text-muted-foreground">
            Планируйте события и отслеживайте циклы
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/50 bg-card/50 p-1">
            {[
              { mode: "month" as ViewMode, icon: Grid, label: "Месяц" },
              { mode: "week" as ViewMode, icon: List, label: "Неделя" },
              { mode: "day" as ViewMode, icon: CalendarIcon, label: "День" },
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "gap-2 transition-all",
                  viewMode === mode ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateDate('prev')}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-lg text-center">
              {formatDate()}
            </CardTitle>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateDate('next')}
              className="hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      {viewMode === "month" && (
        <Card className="glass-card">
          <CardContent className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />
                }

                const { tasks, cycle } = getDayData(day)
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() &&
                               new Date().getFullYear() === currentDate.getFullYear()

                return (
                  <div 
                    key={day}
                    className={cn(
                      "aspect-square p-2 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer relative",
                      isToday && "ring-2 ring-primary ring-offset-2 bg-primary/5"
                    )}
                  >
                    <div className="text-sm font-medium">
                      {day}
                    </div>
                    
                    {/* Cycle indicators */}
                    {cycle && (
                      <div className={cn(
                        "absolute top-1 right-1 h-2 w-2 rounded-full",
                        cycle.type === "period" && "bg-[hsl(var(--cycle-period))]",
                        cycle.type === "fertile" && "bg-[hsl(var(--cycle-fertile))]",
                        cycle.type === "ovulation" && "bg-[hsl(var(--cycle-ovulation))]"
                      )} />
                    )}
                    
                    {/* Task indicators */}
                    {tasks.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 space-y-0.5">
                        {tasks.slice(0, 2).map((task, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "h-1 rounded-full",
                              task.priority === "high" && "bg-[hsl(var(--priority-high))]",
                              task.priority === "medium" && "bg-[hsl(var(--priority-medium))]",
                              task.priority === "low" && "bg-[hsl(var(--priority-low))]"
                            )}
                          />
                        ))}
                        {tasks.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{tasks.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Легенда</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--cycle-period))]" />
              <span>Менструация</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--cycle-fertile))]" />
              <span>Фертильный период</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--cycle-ovulation))]" />
              <span>Овуляция</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--priority-high))]" />
              <span>Важные задачи</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}