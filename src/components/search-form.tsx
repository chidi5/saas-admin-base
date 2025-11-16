import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

/**
 * Render a form containing an accessible search input with an inline search icon.
 *
 * The component forwards any received form element props to the root <form>.
 *
 * @param props - Props applied to the root form element (e.g., action, method, className, onSubmit)
 * @returns The form element that contains a visually hidden label, a styled search input, and a positioned search icon
 */
export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Type to search..."
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}