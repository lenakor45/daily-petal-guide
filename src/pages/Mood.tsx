import { useState } from "react"
import { Smile, Heart, Zap, Frown, AlertTriangle, Plus, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type MoodType = "happy" | "calm" | "energetic" | "sad" | "anxious"

interface MoodEntry {
  id: number
  mood: MoodType
  note?: string
  date: string
  time: string
}

const moodOptions = [
  { type: "happy" as MoodType, label: "Счастливая", emoji: "😊", color: "mood-happy", icon: Smile },
  { type: "calm" as MoodType, label: "Спокойная", emoji: "😌", color: "mood-calm", icon: Heart },
  { type: "energetic" as MoodType, label: "Энергичная", emoji: "⚡", color: "mood-energetic", icon: Zap },
  { type: "sad" as MoodType, label: "Грустная", emoji: "😢", color: "mood-sad", icon: Frown },
  { type: "anxious" as MoodType, label: "Тревожная", emoji: "😰", color: "mood-anxious", icon: AlertTriangle },
]

// Mock data
const mockMoodEntries: MoodEntry[] = [
  {
    id: 1,
    mood: "happy",
    note: "Отличный день! Удалось закончить все важные дела",
    date: "2024-01-15",
    time: "20:30"
  },
  {
    id: 2,
    mood: "calm",
    note: "Медитация помогла расслабиться после работы",
    date: "2024-01-14",
    time: "22:15"
  },
  {
    id: 3,
    mood: "energetic",
    note: "Утренняя тренировка зарядила энергией на весь день",
    date: "2024-01-14",
    time: "07:45"
  },
  {
    id: 4,
    mood: "anxious",
    note: "Беспокоюсь по поводу завтрашней презентации",
    date: "2024-01-13",
    time: "23:00"
  }
]

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState("")
  const [moodEntries, setMoodEntries] = useState(mockMoodEntries)

  const handleMoodSubmit = () => {
    if (!selectedMood) return

    const newEntry: MoodEntry = {
      id: Date.now(),
      mood: selectedMood,
      note: note.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    setMoodEntries([newEntry, ...moodEntries])
    setSelectedMood(null)
    setNote("")
  }

  const getMoodStats = () => {
    const recentEntries = moodEntries.slice(0, 7) // Last 7 entries
    const moodCounts = recentEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<MoodType, number>)

    const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0] as MoodType] > moodCounts[b[0] as MoodType] ? a : b
    )?.[0] as MoodType

    return { moodCounts, dominantMood, total: recentEntries.length }
  }

  const stats = getMoodStats()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Трекер настроения</h1>
        <p className="text-muted-foreground">
          Отслеживайте свое эмоциональное состояние и находите паттерны
        </p>
      </div>

      {/* Current Mood Selector */}
      <Card className="glass-card soft-glow">
        <CardHeader>
          <CardTitle className="text-center">Как вы себя чувствуете сейчас?</CardTitle>
          <CardDescription className="text-center">
            Выберите настроение, которое лучше всего описывает ваше состояние
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Options */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.type}
                  variant="outline"
                  className={cn(
                    "h-auto p-4 flex flex-col gap-2 transition-all duration-200",
                    selectedMood === option.type 
                      ? "ring-2 ring-primary bg-primary/10 border-primary" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedMood(option.type)}
                >
                  <div className="text-2xl">{option.emoji}</div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Note Input */}
          {selectedMood && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium">
                Добавить заметку (необязательно)
              </label>
              <Textarea
                placeholder="Опишите что повлияло на ваше настроение..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <Button 
                onClick={handleMoodSubmit}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Сохранить запись
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Статистика недели
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.dominantMood && (
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl mb-2">
                  {moodOptions.find(m => m.type === stats.dominantMood)?.emoji}
                </div>
                <p className="text-sm font-medium">
                  Преобладающее настроение
                </p>
                <p className="text-xs text-muted-foreground">
                  {moodOptions.find(m => m.type === stats.dominantMood)?.label}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {moodOptions.map((option) => {
                const count = stats.moodCounts[option.type] || 0
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={option.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {option.emoji} {option.label}
                      </span>
                      <span>{count} раз</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all duration-500", option.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Инсайты и советы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm font-medium text-primary mb-1">💡 Совет дня</p>
                <p className="text-xs text-muted-foreground">
                  Попробуйте 5-минутную медитацию для улучшения настроения
                </p>
              </div>
              
              <div className="p-3 rounded-lg border border-muted bg-muted/20">
                <p className="text-sm font-medium mb-1">📊 Заметили ли вы?</p>
                <p className="text-xs text-muted-foreground">
                  Ваше настроение лучше в дни, когда вы делаете записи утром
                </p>
              </div>
              
              <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
                <p className="text-sm font-medium mb-1">🎯 Рекомендация</p>
                <p className="text-xs text-muted-foreground">
                  Добавьте практику благодарности - записывайте 3 хорошие вещи каждый день
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Последние записи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodEntries.slice(0, 5).map((entry, index) => {
              const moodOption = moodOptions.find(m => m.type === entry.mood)!
              return (
                <div 
                  key={entry.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-xl">{moodOption.emoji}</div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(moodOption.color, "text-xs")}>
                        {moodOption.label}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short'
                        })} в {entry.time}
                      </div>
                    </div>
                    
                    {entry.note && (
                      <p className="text-sm text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {moodEntries.length > 5 && (
            <Button variant="ghost" className="w-full mt-4">
              Показать все записи
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}