"use client";

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Image, CheckSquare } from 'lucide-react'
import React from 'react'

const page = () => {

  const handleNagivate = (url: string) => {
    try {
      if(typeof window != "undefined") {
        window.location.href = url
      }      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            
            <div onClick={() => handleNagivate("/social-media/iamges")} className="aspect-video rounded-xl bg-muted/50 border flex flex-col items-center justify-center gap-2 hover:bg-muted/70 transition-colors cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
                <Image className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Fotot</h3>
              <p className="text-sm text-muted-foreground">Shiko galerinë</p>
            </div>

            <div onClick={() => handleNagivate("/social-media/tasks")} className="aspect-video rounded-xl bg-muted/50 border flex flex-col items-center justify-center gap-2 hover:bg-muted/70 transition-colors cursor-pointer">
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
                <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Detyrat</h3>
              <p className="text-sm text-muted-foreground">Menaxho taskat</p>
            </div>

          </div>
          
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default page