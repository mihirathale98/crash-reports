import { Bell, Settings, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function AppHeader() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
    console.log(`Theme toggled to ${!darkMode ? 'dark' : 'light'} mode`);
  };

  return (
    <header className="flex items-center justify-between p-3 sm:p-4 border-b bg-card">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">MA</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Policy Insights</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate">Massachusetts State Government</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
        >
          {darkMode ? "Light" : "Dark"} Mode
        </Button>
        
        {/* Mobile theme toggle - icon only */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle-mobile"
          className="sm:hidden"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-notifications"
          onClick={() => console.log('Notifications clicked')}
          className="relative"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs bg-destructive text-destructive-foreground p-0 flex items-center justify-center">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-user-menu">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => console.log('Profile clicked')} className="text-sm">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Settings clicked')} className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Logout clicked')} className="text-sm">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}