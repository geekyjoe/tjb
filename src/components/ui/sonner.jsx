import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      // duration={Infinity}
      theme={theme}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-950 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-950 dark:group-[.toaster]:text-neutral-50 dark:group-[.toaster]:border-neutral-800 group-[.toaster]:max-w-[320px] group-[.toaster]:p-2",
          description: "group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900 group-[.toast]:text-sm group-[.toast]:px-2 group-[.toast]:py-1",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400 group-[.toast]:text-sm group-[.toast]:px-2 group-[.toast]:py-1",
        },
      }}
      {...props} />)
  );
}

export { Toaster }