import { ReactNode } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { LogOut, User } from "lucide-react"
import { ReminderSystem } from "@/components/reminders/ReminderSystem"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выйти из системы',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы'
      });
    }
  };

  return (
    <SidebarProvider 
      defaultOpen={true}
    >
      <div className="flex min-h-screen w-full bg-gradient-soft">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Добро пожаловать
                </h1>
                <p className="text-sm text-muted-foreground">
                  Планируйте свою жизнь с заботой о себе
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ReminderSystem />
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-soft"></div>
                Сегодня отличный день!
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Выйти</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}