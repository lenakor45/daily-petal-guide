import { useState } from "react"
import { 
  Calendar, 
  Heart, 
  ListTodo, 
  Smile, 
  BarChart3, 
  Settings,
  Menu,
  X
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { 
    title: "Главная", 
    url: "/", 
    icon: Calendar,
    description: "Обзор дня" 
  },
  { 
    title: "Календарь", 
    url: "/calendar", 
    icon: Calendar,
    description: "Планирование и циклы" 
  },
  { 
    title: "Задачи", 
    url: "/tasks", 
    icon: ListTodo,
    description: "Управление делами" 
  },
  { 
    title: "Цикл", 
    url: "/cycle", 
    icon: Heart,
    description: "Менструальный календарь" 
  },
  { 
    title: "Настроение", 
    url: "/mood", 
    icon: Smile,
    description: "Трекер самочувствия" 
  },
  { 
    title: "Аналитика", 
    url: "/analytics", 
    icon: BarChart3,
    description: "Статистика и тренды" 
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const isExpanded = items.some((i) => isActive(i.url))
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
      "hover:bg-primary/20 hover:text-primary hover:shadow-sm border",
      isActive ? 
        "bg-gradient-primary text-primary-foreground shadow-soft border-primary/50" : 
        "text-slate-800 dark:text-slate-200 border-border/30 hover:border-primary/30"
    )

  return (
    <Sidebar
      className={cn(
        "border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Планировщик</span>
              <span className="text-xs text-muted-foreground">для женщин</span>
            </div>
          </div>
        )}
        <SidebarTrigger className="h-8 w-8 shrink-0" />
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("mb-3 text-xs font-medium text-muted-foreground/80", collapsed && "sr-only")}>
            Навигация
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs opacity-75">{item.description}</span>
                        </div>
                      )}
                      {isActive(item.url) && (
                        <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/settings" 
                    className={getNavCls}
                    title={collapsed ? "Настройки" : undefined}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Настройки</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}