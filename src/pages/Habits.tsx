import { useState, useEffect } from "react"
import { Target, Plus, CheckCircle2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Habit = {
  id: string
  name: string
  user_id: string
  created_at: string
}

type HabitEntry = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  entry_date: string
}

export default function Habits() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayEntries, setTodayEntries] = useState<HabitEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")

  useEffect(() => {
    if (user) {
      fetchHabitsData()
    }
  }, [user])

  const fetchHabitsData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    try {
      // Получаем привычки пользователя
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (habitsError) throw habitsError

      // Получаем записи за сегодня
      const { data: entriesData, error: entriesError } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", today)

      if (entriesError) throw entriesError

      setHabits(habitsData || [])
      setTodayEntries(entriesData || [])
    } catch (error) {
      console.error("Error fetching habits:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить привычки",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addHabit = async () => {
    if (!user || !newHabitName.trim()) return

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          name: newHabitName.trim(),
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setHabits(prev => [...prev, data])
      setNewHabitName("")
      setIsAddDialogOpen(false)
      
      toast({
        title: "Привычка добавлена",
        description: `"${data.name}" добавлена в ваш трекер`,
      })
    } catch (error) {
      console.error("Error adding habit:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить привычку",
        variant: "destructive",
      })
    }
  }

  const deleteHabit = async (habitId: string, habitName: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId)

      if (error) throw error

      setHabits(prev => prev.filter(habit => habit.id !== habitId))
      setTodayEntries(prev => prev.filter(entry => entry.habit_id !== habitId))
      
      toast({
        title: "Привычка удалена",
        description: `"${habitName}" удалена из трекера`,
      })
    } catch (error) {
      console.error("Error deleting habit:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить привычку",
        variant: "destructive",
      })
    }
  }

  const toggleHabit = async (habitId: string) => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const existingEntry = todayEntries.find(entry => entry.habit_id === habitId)

    try {
      if (existingEntry) {
        // Удаляем запись (отмечаем как невыполненную)
        const { error } = await supabase
          .from("habit_entries")
          .delete()
          .eq("id", existingEntry.id)

        if (error) throw error

        setTodayEntries(prev => prev.filter(entry => entry.id !== existingEntry.id))
      } else {
        // Добавляем запись (отмечаем как выполненную)
        const { data, error } = await supabase
          .from("habit_entries")
          .insert({
            habit_id: habitId,
            user_id: user.id,
            entry_date: today,
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        setTodayEntries(prev => [...prev, data])
      }
    } catch (error) {
      console.error("Error toggling habit:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус привычки",
        variant: "destructive",
      })
    }
  }

  const completedToday = todayEntries.length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Трекер привычек
          </h1>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Трекер привычек
        </h1>
        <p className="text-muted-foreground">
          Отслеживайте свои ежедневные привычки и достигайте целей
        </p>
      </div>

      {/* Stats Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Статистика за сегодня
          </CardTitle>
          <CardDescription>
            {completedToday} из {totalHabits} привычек выполнено
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Прогресс</span>
              <span className="text-lg font-bold text-primary">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Habit Dialog */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Добавить привычку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая привычка</DialogTitle>
              <DialogDescription>
                Добавьте новую привычку для ежедневного отслеживания
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="habit-name">Название привычки</Label>
                <Input
                  id="habit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Например: Выпить 8 стаканов воды"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addHabit()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setNewHabitName("")
                }}
              >
                Отмена
              </Button>
              <Button onClick={addHabit} disabled={!newHabitName.trim()}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits List */}
      {totalHabits === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-lg font-semibold mb-2">Нет привычек для отслеживания</h3>
            <p className="text-muted-foreground mb-6">
              Начните с добавления первой привычки, которую хотите отслеживать ежедневно
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить первую привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const isCompleted = todayEntries.some(entry => entry.habit_id === habit.id)
            
            return (
              <Card key={habit.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="lg"
                        variant="ghost"
                        className={cn(
                          "h-12 w-12 p-0 rounded-full transition-all",
                          isCompleted 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                        )}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        {isCompleted && <CheckCircle2 className="h-6 w-6" />}
                      </Button>
                      <div>
                        <h3 className={cn(
                          "text-lg font-medium transition-colors",
                          isCompleted && "text-muted-foreground"
                        )}>
                          {habit.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Создана {new Date(habit.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {isCompleted ? "Выполнено" : "В ожидании"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteHabit(habit.id, habit.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}