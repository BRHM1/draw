import { useState } from 'react'

const Select = (contextRef, elements) => {
    const [isMoving , setIsMoving] = useState(false)
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
            console.log(x, y , x1, y1, x2, y2)
            const center = { x: (x1 + x2) / 2 , y: (y1 + y2) / 2 }
            const distance = Math.hypot(Math.abs(x - center.x),Math.abs(y - center.y))
            console.log(center , distance, Math.abs(x2 - x1))
            return distance <= Math.abs(x2 - x1) * 1.3? element : null
        },
        ellipse: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const ellipseCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            const a = Math.abs(x2 - x1) / 2
            const b = Math.abs(y2 - y1) / 2
            const c = Math.sqrt(Math.pow(x - ellipseCenter.x, 2) / Math.pow(a, 2) + Math.pow(y - ellipseCenter.y, 2) / Math.pow(b, 2))
            return c <= 1 ? element : null
        }
    }

    const getElementAtPos = (x, y, elements) => {
        if (elements?.length === 0) return null
        for (let i = elements?.length - 1; i >= 0; i--) {
            const element = elements[i]
            return elementFormula[element?.roughElement?.shape](x, y, element)
        }
        return null
    }

    const moveMouseDown = (e) => {
        const { clientX, clientY } = e
        const element = getElementAtPos(clientX, clientY, elements)
        if (element) setIsMoving(true)
    }
    const moveMouseMove = (e) => {
        if (!isMoving) return
    }
    const moveMouseUp = () => {
        setIsMoving()
    }
    return { moveMouseDown, moveMouseMove, moveMouseUp }
}

export default Select