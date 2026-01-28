import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 180 : 0,
          scale: 1 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="h-5 w-5 text-accent" />
        ) : (
          <Sun className="h-5 w-5 text-warning" />
        )}
      </motion.div>
    </Button>
  );
}
