import { twMerge } from "tailwind-merge"

const ShortcutMessage = ({message, className}) => {
  return (
    <p className={
        twMerge(
            "text-xs text-gray-500 z-[11000] absolute",
            className
        )
    }>{message}</p>
  )
}

export default ShortcutMessage