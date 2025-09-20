import { useState } from "react"
import { Plus, Filter, Search, CheckCircle, Circle, Star, Heart, Briefcase, User, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type Priority = "high" | "medium" | "low"
type Sphere = "work" | "health" | "relationships" | "personal" | "finance"

interface Task {
  id: number
  title: string
  description?: string
  priority: Priority
  sphere: Sphere
  completed: boolean
  dueDate?: string
}

// Mock data
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Записаться к гинекологу",
    description: "Ежегодная проверка здоровья",
    priority: "high",
    sphere: "health",
    completed: false,
    dueDate: "2024-01-20"
  },
  {
    id: 2,
    title: "Купить подарок маме",
    description: "День рождения приближается",
    priority: "medium",
    sphere: "relationships",
    completed: false,
    dueDate: "2024-01-18"
  },
  {
    id: 3,
    title: "Йога утром",
    description: "15 минут растяжки",
    priority: "medium",
    sphere: "health",
    completed: true
  },
  {
    id: 4,
    title: "Обзвонить банки по кредиту",
    priority: "high",
    sphere: "finance",
    completed: false
  },
  {
    id: 5,
    title: "Медитация перед сном",
    priority: "low",
    sphere: "personal",
    completed: true
  }
]

const priorityLabels = {
  high: "Высокий",
  medium: "Средний", 
  low: "Низкий"
}

const sphereLabels = {
  work: "Работа",
  health: "Здоровье",
  relationships: "Отношения",
  personal: "Личное",
  finance: "Финансы"
}

const sphereIcons = {
  work: Briefcase,
  health: Heart,
  relationships: User,
  personal: Star,
  finance: DollarSign
}

export default function Tasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSphere, setSelectedSphere] = useState<Sphere | "all">("all")
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">("all")
  const [showCompleted, setShowCompleted] = useState(true)

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSphere = selectedSphere === "all" || task.sphere === selectedSphere
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority
    const matchesCompleted = showCompleted || !task.completed

    return matchesSearch && matchesSphere && matchesPriority && matchesCompleted
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

        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
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

            {/* Sphere Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSphere === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSphere("all")}
                className={cn(selectedSphere === "all" && "bg-primary")}
              >
                Все сферы
              </Button>
              {Object.entries(sphereLabels).map(([key, label]) => {
                const Icon = sphereIcons[key as Sphere]
                return (
                  <Button
                    key={key}
                    variant={selectedSphere === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSphere(key as Sphere)}
                    className={cn("gap-2", selectedSphere === key && "bg-primary")}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Button>
                )
              })}
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
        {filteredTasks.length === 0 ? (
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
          filteredTasks.map((task, index) => {
            const SphereIcon = sphereIcons[task.sphere]
            return (
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

                        {task.dueDate && (
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(task.dueDate).toLocaleDateString('ru-RU', {
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
                        <Badge className={cn(`sphere-${task.sphere}`, "text-xs gap-1")}>
                          <SphereIcon className="h-3 w-3" />
                          {sphereLabels[task.sphere]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}