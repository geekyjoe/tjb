import * as React from "react"
import { useState, useRef, useEffect } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react"

import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, onSearchChange, searchValue, placeholder, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (props.value === undefined || props.value === null) {
      setIsOpen(false)
      // Clear search input when value is reset
      if (onSearchChange) {
        onSearchChange("")
      }
    }
  }, [props.value, onSearchChange])

  const handleInputClick = (e) => {
    e.stopPropagation()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      onMouseDown={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300",
        className
      )}
      {...props}>
      <div className="flex items-center flex-1 gap-2 pr-2">
        <Search className="h-4 w-4 text-neutral-500 flex-shrink-0" />
        <input
          ref={inputRef}
          name="text"
          type="text"
          placeholder={placeholder || "Search..."}
          className="w-full bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          value={searchValue || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          onClick={handleInputClick}
        />
      </div>
      <SelectPrimitive.Icon asChild>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", onReset, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = useState(props.value)

  // Reset selected value when parent value changes
  useEffect(() => {
    setSelectedValue(props.value)
  }, [props.value])

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      setSelectedValue(null)
    }

    window.addEventListener('selectContentReset', handleReset)
    return () => window.removeEventListener('selectContentReset', handleReset)
  }, [])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return React.cloneElement(child, {
                selected: child.props.value === selectedValue
              })
            }
            return child
          })}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, selected, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-neutral-100 focus:text-neutral-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        {selected && <Check className="h-4 w-4" />}
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-neutral-100 dark:bg-neutral-800", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

const SearchableSelect = ({ onReset, placeholder, ...props }) => {
  const [searchTerm, setSearchTerm] = useState("")

  // Handle external reset
  useEffect(() => {
    if (!props.value) {
      setSearchTerm("")
    }
  }, [props.value])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const wrappedChildren = React.Children.map(props.children, child => {
    if (child.type === SelectTrigger) {
      return React.cloneElement(child, {
        searchValue: searchTerm,
        onSearchChange: handleSearchChange,
        placeholder: placeholder
      })
    }
    if (child.type === SelectContent) {
      return React.cloneElement(child, {
        searchTerm,
        value: props.value
      })
    }
    return child
  })

  return (
    <Select {...props}>
      {wrappedChildren}
    </Select>
  )
}

export {
  SearchableSelect as Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}