import { useState, useEffect } from "react"
import { Calendar, Heart, CheckCircle, Smile, Plus, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Tables } from "@/integrations/supabase/types"

type Task = Tables<"tasks">

const moodEmojis = {
  happy: "😊",
  calm: "😌", 
  energetic: "⚡",
  sad: "😢",
  anxious: "😰"
}

export function TodayOverview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTodayTasks()
    }
  }, [user])

  const fetchTodayTasks = async () => {
    if (!user) return
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", startOfDay.toISOString())
        .lt("due_date", endOfDay.toISOString())
        .order("due_date", { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const todayStats = {
    date: new Date().toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    tasksCompleted: tasks.filter(task => task.completed).length,
    totalTasks: tasks.length,
    currentMood: "happy",
    cycleDay: 14,
    cyclePhase: "fertile"
  }

  const taskProgress = todayStats.totalTasks > 0 ? (todayStats.tasksCompleted / todayStats.totalTasks) * 100 : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          {todayStats.date}
        </h1>
        <p className="text-muted-foreground">
          Прекрасный день для новых достижений ✨
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Progress */}
        <Card className="glass-card hover:soft-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {todayStats.tasksCompleted}/{todayStats.totalTasks}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Задачи</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {taskProgress.toFixed(0)}% выполнено
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Mood */}
        <Card className="glass-card hover:soft-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Smile className="h-5 w-5 text-primary" />
              <div className="text-2xl">
                {moodEmojis[todayStats.currentMood as keyof typeof moodEmojis]}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Настроение</p>
              <Badge className={cn("mood-happy text-xs")}>
                Счастливая
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Day */}
        <Card className="glass-card hover:soft-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Heart className="h-5 w-5 text-primary" />
              <Badge className="cycle-fertile text-xs">
                Фертильная фаза
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Цикл</p>
              <p className="text-2xl font-bold text-primary">
                {todayStats.cycleDay} день
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add */}
        <Card className="glass-card hover:soft-glow transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Быстрое добавление</p>
              <p className="text-xs text-muted-foreground">
                Новая задача или запись
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Сегодня запланировано</CardTitle>
              <CardDescription>Ваши задачи и события</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10"
              onClick={() => navigate('/tasks')}
            >
              Все задачи
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Загрузка задач...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>На сегодня задач нет</p>
              <p className="text-xs">Добавьте новую задачу для планирования дня</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task, index) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      task.completed ? "bg-primary/50" : "bg-primary animate-pulse-soft"
                    )} />
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.due_date).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(`priority-${task.priority}`, "text-xs")}>
                      {task.priority === "high" ? "Высокий" : 
                       task.priority === "medium" ? "Средний" : "Низкий"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => navigate('/calendar')}
        >
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm">Календарь</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => navigate('/cycle')}
        >
          <Heart className="h-5 w-5 text-primary" />
          <span className="text-sm">Цикл</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => navigate('/mood')}
        >
          <Smile className="h-5 w-5 text-primary" />
          <span className="text-sm">Настроение</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => navigate('/tasks')}
        >
          <Plus className="h-5 w-5 text-primary" />
          <span className="text-sm">Добавить</span>
        </Button>
      </div>
    </div>
  )
}