import { useState, useEffect } from "react"
import { Target, Plus, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

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

export function HabitsWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayEntries, setTodayEntries] = useState<HabitEntry[]>([])
  const [loading, setLoading] = useState(true)

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
        .limit(4) // Показываем только 4 привычки на главной

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
    } finally {
      setLoading(false)
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
    }
  }

  const completedToday = todayEntries.length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Трекер привычек
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Загрузка привычек...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Трекер привычек
            </CardTitle>
            <CardDescription>
              {completedToday}/{totalHabits} выполнено сегодня
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:bg-primary/10"
            onClick={() => navigate('/habits')}
          >
            Все привычки
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {totalHabits === 0 ? (
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              У вас пока нет привычек для отслеживания
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/habits')}
              className="hover:bg-primary/5 hover:border-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить привычку
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс дня</span>
                <span className="font-medium">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Habits list */}
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = todayEntries.some(entry => entry.habit_id === habit.id)
                
                return (
                  <div 
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-0 rounded-full transition-all",
                          isCompleted 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                        )}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                      <div>
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          isCompleted && "text-muted-foreground"
                        )}>
                          {habit.name}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={isCompleted ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {isCompleted ? "Выполнено" : "В ожидании"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}