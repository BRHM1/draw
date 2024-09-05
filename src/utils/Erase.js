import { useStore } from '../store'
const Erase = () => {
    const elements = useStore((state) => state.elements);
    const setElements = useStore((state) => state.setElements);
    const elementFormula = {
        rectangle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2) ? element : null
        },
        line: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const a = { x: x1, y: y1 }
            const b = { x: x2, y: y2 }
            const c = { x, y }
            const offset = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
            const a1 = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2))
            const a2 = Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2))
            return a1 + a2 >= offset - 0.5 && a1 + a2 <= offset + 0.5 ? element : null
        },
        circle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const center = { x: x1 , y: y1 }
            const distance = Math.hypot(Math.abs(x - center.x), Math.abs(y - center.y))
            return distance <= Math.abs(x2 - x1) * 1.5 ? element : null
        },
        ellipse: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const ellipseCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            const a = Math.abs(x2 - x1) / 2
            const b = Math.abs(y2 - y1) / 2
            const c = Math.sqrt(Math.pow(x - ellipseCenter.x, 2) / Math.pow(a, 2) + Math.pow(y - ellipseCenter.y, 2) / Math.pow(b, 2))
            return c <= 1 ? element : null
        },
        path: (x, y, element) => {
            const { path } = element
            const ctx = document.createElement("canvas").getContext("2d")
            ctx.beginPath()
            ctx.stroke(path)
            ctx.closePath()
            return ctx.isPointInPath(path, x, y) ? element : null
        },
        text: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1 - 20, y2) && y <= Math.max(y1 - 20, y2 - 20) ? element : null
        }
    }
    const startErasing = (e) => {
    }
    const Erasing = (e) => {
        if(!e.buttons) return
        const getElementAtPos = (x, y, elements) => {
            if (elements?.length === 0) return null
            for (let i = elements?.length - 1; i >= 0; i--) {
                const element = elements[i]
                if (elementFormula[element?.roughElement?.shape] && elementFormula[element?.roughElement?.shape](x, y, element)) return i
                if (element?.type === "path") {
                    if (elementFormula[element?.type](x, y, element)) return i
                }
                if (element?.type === "text") {
                    if (elementFormula[element?.type](x, y, element)) return i
                }
            }
            return null
        }
        
        console.log(getElementAtPos(e.pageX, e.pageY, elements))
        const newElements = elements.filter((_, idx) => idx !== getElementAtPos(e.pageX, e.pageY, elements))
        setElements(newElements)
    }
    const stopErasing = () => {}
    return { startErasing, Erasing, stopErasing }
}

export default Erase