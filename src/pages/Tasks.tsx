import { useState, useEffect } from "react"
import { Plus, Filter, Search, CheckCircle, Circle, Star, Heart, Briefcase, User, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog"
import { Tables } from "@/integrations/supabase/types"

type Priority = "high" | "medium" | "low"
type Task = Tables<"tasks">


const priorityLabels = {
  high: "Высокий",
  medium: "Средний", 
  low: "Низкий"
}

export default function Tasks() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">("all")
  const [showCompleted, setShowCompleted] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить задачи",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ))

      toast({
        title: task.completed ? "Задача не выполнена" : "Задача выполнена",
        description: task.completed ? "Задача отмечена как невыполненная" : "Поздравляем с выполнением задачи!"
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive"
      })
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority
    const matchesCompleted = showCompleted || !task.completed

    return matchesSearch && matchesPriority && matchesCompleted
  })

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои задачи</h1>
          <p className="text-sm text-muted-foreground">
            Управляйте делами по сферам жизни
          </p>
        </div>

        <Button 
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить задачу
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Прогресс сегодня</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} из {totalCount} задач выполнено
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>


            {/* Priority Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedPriority === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriority("all")}
                className={cn(selectedPriority === "all" && "bg-primary")}
              >
                Все приоритеты
              </Button>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedPriority === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriority(key as Priority)}
                  className={cn(selectedPriority === key && "bg-primary")}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Show Completed Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked === true)}
              />
              <label htmlFor="show-completed" className="text-sm text-muted-foreground">
                Показать выполненные
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                <p className="text-lg font-medium mb-2">Загрузка задач...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Задачи не найдены</p>
                <p className="text-sm">Попробуйте изменить фильтры или добавить новую задачу</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <Card 
              key={task.id}
              className={cn(
                "glass-card hover:soft-glow transition-all duration-300 cursor-pointer",
                task.completed && "opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Completion Checkbox */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6 rounded-full hover:bg-primary/10"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Task Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {task.due_date && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(task.due_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <Badge className={cn(`priority-${task.priority}`, "text-xs gap-1")}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddTaskDialog 
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onTaskAdded={fetchTasks}
      />
    </div>
  )
}