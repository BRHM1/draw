import { useState } from "react"

const Erase = ({ contextRef }) => {
    const [isErasing, setIsErasing] = useState(false);
    const startErasing = (e) => {
        setIsErasing(true)
    }
    const Erasing = (e) => {
        if (!isErasing) return
        contextRef?.current?.clearRect(e.clientX, e.clientY, 20, 20);
    }
    const stopErasing = () => {
        setIsErasing(false)
    }
    return { startErasing, Erasing, stopErasing }
}

export default Erase