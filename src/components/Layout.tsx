// Add this import at the top
import { useTheme } from "next-themes"

// Inside the Layout component, add this after the state declarations
const { theme } = useTheme()
const [mounted, setMounted] = React.useState(false)

React.useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return null
}

// Update the main div className to:
<div className={`min-h-screen flex flex-col bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>