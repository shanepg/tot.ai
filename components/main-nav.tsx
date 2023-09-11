'use client'

import Image from "next/image"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "./ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { sanitizeName } from "@/lib/utils"
import { ExamplesNav } from "./examples-nav"

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}

const redirectUrls = {
  shadcnUi: 'https://ui.shadcn.com/',
  uploadTheme: 'https://github.com/luisFilipePT/shadcn-ui-theme-explorer#-upload-a-theme',
  downloadTheme: (theme: string) => {
    if(theme === 'default') {
      return `https://github.com/luisFilipePT/shadcn-ui-theme-explorer/tree/main/styles/global.css`
    }
    return `https://github.com/luisFilipePT/shadcn-ui-theme-explorer/tree/main/styles/themes/${sanitizeName(theme)}.css`}
}


export function MainNav() {


  const { toast } = useToast()

  const handleCopyURL = () => {
    copyToClipboard(window.location.href)
    toast({
      title: 'URL copied to clipboard'
    })
  }

  return (
    <div className=""style={{background: 'black'}}>
                      <ExamplesNav />

      <Dialog>
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <Link href={redirectUrls.shadcnUi}>shadcn/ui</Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={redirectUrls.uploadTheme}>
                Upload a theme...
              </Link>
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                Download theme
              </DropdownMenuItem> 
            </DialogTrigger>
            <DropdownMenuItem onClick={handleCopyURL}>Copy URL to share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ready to color your website?
            </DialogTitle>
            <DialogDescription>
                 <br /> 2. Replace the content from the classes .root and .dark in your <span className="text-primary">global.css</span> file.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
