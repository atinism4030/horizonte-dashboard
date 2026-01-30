"use client";

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Folder, Image as ImageIcon, Download, ArrowLeft, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { env } from '@/env';

type CloudinaryFolder = { name: string; path: string };
type CloudinaryImage = { public_id: string; secure_url: string; format: string };

const Page = () => {
  const [view, setView] = useState<'folders' | 'gallery'>('folders');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${env.apiurl}/social-media/folders?parent=ads`); 
      const data = await res.json();
      console.log({data});
      
      setFolders(data); 
    } catch (error) {
      console.error("Failed to load folders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folderPath: string, folderName: string) => {
    setLoading(true);
    setSelectedCompany(folderName);
    try {
      const res = await fetch(`${env.apiurl}/social-media/images?folder=${encodeURIComponent(folderPath)}`);
      const data = await res.json();
      setImages(data);
      setView('gallery');
    } catch (error) {
      console.error("Failed to load images", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      console.log({response});
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              {view === 'folders' ? 'Ads Companies' : selectedCompany}
            </h1>
            
            {view === 'gallery' && (
              <Button 
                variant="outline" 
                onClick={() => { setView('folders'); setImages([]); }}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Companies
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {view === 'folders' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {folders?.map((folder) => (
                    <div 
                      key={folder.path}
                      onClick={() => handleFolderClick(folder.path, folder.name)}
                      className="group relative flex flex-col items-center justify-center rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                        <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-center">{folder.name.split("-")[0]}</h3>
                      <p className="text-xs text-muted-foreground mt-1">View Assets</p>
                    </div>
                  ))}
                  
                  {folders.length === 0 && !loading && (
                    <p className="text-muted-foreground col-span-full text-center">No companies found in "ads" folder.</p>
                  )}
                </div>
              )}

              {view === 'gallery' && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((img) => (
                    <div key={img.public_id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                      <img 
                        src={img.secure_url} 
                        alt="Ad Asset" 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(img.secure_url, `${img.public_id}.${img.format}`);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}

                  {images.length === 0 && !loading && (
                    <p className="text-muted-foreground col-span-full text-center">No images found for this company.</p>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Page;