import { twMerge } from "tailwind-merge"

const ShortcutMessage = ({message, className}) => {
  return (
    <p className={
        twMerge(
            "text-xs text-gray-500 z-[11000] absolute xl:block hidden",
            className
        )
    }>{message}</p>
  )
}

export default ShortcutMessage