"use client"

import { Search, MessageCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import { useStore } from "@/components/store/store-context"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const { query, setQuery } = useStore()
  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <MobileNav />

          <div className="relative flex-1 max-w-md">
            <Search className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتج أو زبون"
              className="pe-9 ps-3 h-9 text-sm bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 end-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
          </Button>

          <div className="flex items-center gap-2 pe-2 md:pe-3 border-e border-border">
            <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarImage src="/profile.jpg" alt="أبو أحمد" />
              <AvatarFallback className="text-xs">أح</AvatarFallback>
            </Avatar>
            <div className="text-xs hidden sm:block">
              <p className="font-semibold text-foreground">أبو أحمد</p>
              <p className="text-muted-foreground text-[10px]">متجر النور</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">{title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
    </header>
  )
}
