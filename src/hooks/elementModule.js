import { getSvgPathFromStroke } from "../utils/utils"
import { getStroke } from "perfect-freehand";
import { wrappedLines, isValidNumber } from "../utils/utils";
import { useStore } from "../store";
export class Shape {
    constructor(x1, y1, width, height, options, rotation) {
        this.x1 = x1
        this.y1 = y1
        this.width = width
        this.height = height
        this.options = options
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.hidden = false
    }

    draw() {
        return null
    }

    updateDimensions() {
        return null
    }

    Move() {
        return null
    }

    Resize() {
        return null
    }

    saveLastState() {
        return null
    }

    Duplicate() {
        return null
    }

    Refine() {
        return null
    }
}


export class Circle extends Shape {
    constructor(x1, y1, radius, options, roughElement, centerX, centerY, rotation) {
        super(x1, y1, radius * 2, radius * 2, options, rotation)
        this.roughElement = roughElement
        this.centerX = centerX
        this.centerY = centerY
        this.radius = radius
        this.type = "circle"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    // x1 = centerX - radius
    // y1 = centerY - radius
    updateDimensions(x2, y2, generator) {
        this.radius = Math.floor(Math.sqrt((this.centerX - x2) ** 2 + (this.centerY - y2) ** 2))
        this.x1 = (this.centerX - this.radius)
        this.y1 = (this.centerY - this.radius)
        this.width = this.radius * 2
        this.height = this.radius * 2
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.centerX += dx
        this.centerY += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.circle(this.centerX, this.centerY, this.radius * 2, this.options)
    }

    setType(type) {
        this.type = type
    }

    Resize(dx, dy, generator, resizingPoint, mouseDir, gizmoRef) {
        let scaleX = 1, scaleY = 1, origin = { x: 0, y: 0 }
        switch (resizingPoint) {
            case "topLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width / 2, y: gizmoRef.y1 + gizmoRef.height / 2 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                this.radius = this.width / 2
                break
            case "topRight":
                origin = { x: gizmoRef.x1 + gizmoRef.width / 2, y: gizmoRef.y1 + gizmoRef.height / 2 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                this.radius = this.width / 2
                break
            case "bottomLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width / 2, y: gizmoRef.y1 + gizmoRef.height / 2 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                this.radius = this.width / 2
                break
            case "bottomRight":
                origin = { x: gizmoRef.x1 + gizmoRef.width / 2, y: gizmoRef.y1 + gizmoRef.height / 2 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                this.radius = this.width / 2
                break
            default:
                break
        }
        this.centerY += dy / 2
        this.centerX += dx / 2
        this.x1 = this.centerX - this.radius
        this.y1 = this.centerY - this.radius
        this.width = this.radius * 2
        this.height = this.radius * 2
        this.#updateRoughElement(generator)
    }

    Duplicate(generator) {
        const options = { ...this.options }
        const roughElement = generator.circle(this.centerX + 10, this.centerY + 10, this.radius * 2, options)
        return new Circle(this.x1 + 10, this.y1 + 10, this.radius, options, roughElement, this.centerX + 10, this.centerY + 10, this.rotation)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, width: this.width, height: this.height }
        this.x1 = Math.min(capture.x1, capture.x1 + capture.width)
        this.y1 = Math.min(capture.y1, capture.y1 + capture.height)
        this.width = Math.abs(capture.width)
        this.height = Math.abs(capture.height)
        this.centerX = this.x1 + this.width / 2
        this.centerY = this.y1 + this.height / 2
        this.radius = this.width / 2
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, width: this.width, height: this.height, radius: this.radius, options: this.options, roughElement: this.roughElement, centerX: this.centerX, centerY: this.centerY, rotation: this.rotation }
    }
}

export class Ellipse extends Shape {
    constructor(x1, y1, width, height, options, roughElement, rotation, centerX, centerY) {
        super(x1, y1, width, height, options, rotation)
        this.roughElement = roughElement
        this.centerX = this.x1 + this.width / 2
        this.centerY = this.y1 + this.height / 2
        this.type = "ellipse"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    updateDimensions(x2, y2, generator) {
        this.centerX = Math.floor(this.x1 + this.width / 2)
        this.centerY = Math.floor(this.y1 + this.height / 2)
        this.width = x2 - this.x1
        this.height = y2 - this.y1
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.centerX += dx
        this.centerY += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.ellipse(this.centerX, this.centerY, this.width, this.height, this.options)
    }

    Resize(dx, dy, generator, resizingPoint, _, gizmoRef) {
        let scaleX = 1, scaleY = 1, origin = { x: 0, y: 0 }
        switch (resizingPoint) {
            case "topLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "topRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "bottomLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "bottomRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }

    Duplicate(generator) {
        const options = { ...this.options }
        const roughElement = generator.ellipse(this.centerX + 10, this.centerY + 10, this.width, this.height, options)
        return new Ellipse(this.x1 + 10, this.y1 + 10, this.width, this.height, options, roughElement, this.rotation, this.centerX, this.centerY)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, width: this.width, height: this.height }
        this.x1 = Math.min(capture.x1, capture.x1 + capture.width)
        this.y1 = Math.min(capture.y1, capture.y1 + capture.height)
        this.width = Math.abs(capture.width)
        this.height = Math.abs(capture.height)
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, width: this.width, height: this.height, options: this.options, roughElement: this.roughElement, rotation: this.rotation, centerX: this.centerX, centerY: this.centerY }
    }
}

export class Line extends Shape {
    constructor(x1, y1, x2, y2, options, roughElement, rotation) {
        super(x1, y1, x2, y2, options, rotation)
        this.roughElement = roughElement
        this.type = "line"
        this.firstPoint = { x: x1, y: y1 }
        this.secondPoint = { x: x2, y: y2 }
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    updateDimensions(x2, y2, generator) {
        this.x2 = x2
        this.y2 = y2
        this.width = x2 - this.x1
        this.height = y2 - this.y1
        this.secondPoint = { x: x2, y: y2 }
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.x2 += dx
        this.y2 += dy
        this.firstPoint = { x: this.firstPoint.x + dx, y: this.firstPoint.y + dy }
        this.secondPoint = { x: this.secondPoint.x + dx, y: this.secondPoint.y + dy }
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.line(this.firstPoint.x, this.firstPoint.y, this.secondPoint.x, this.secondPoint.y, this.options)
    }

    Resize(dx, dy, generator, resizingPoint, _, gizmoRef) {
        let scaleX = 1, scaleY = 1, origin = { x: 0, y: 0 }
        switch (resizingPoint) {
            case "topLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.x2 = scaleX * (this.x2 - origin.x) + origin.x
                this.y2 = scaleY * (this.y2 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.firstPoint = { x: scaleX * (this.firstPoint.x - origin.x) + origin.x , y: scaleY * (this.firstPoint.y - origin.y) + origin.y }
                this.secondPoint = { x: scaleX * (this.secondPoint.x - origin.x) + origin.x , y: scaleY * (this.secondPoint.y - origin.y) + origin.y }
                break
            case "topRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.x2 = scaleX * (this.x2 - origin.x) + origin.x
                this.y2 = scaleY * (this.y2 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.firstPoint = { x: scaleX * (this.firstPoint.x - origin.x) + origin.x , y: scaleY * (this.firstPoint.y - origin.y) + origin.y }
                this.secondPoint = { x: scaleX * (this.secondPoint.x - origin.x) + origin.x , y: scaleY * (this.secondPoint.y - origin.y) + origin.y }
                break
            case "bottomLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.x2 = scaleX * (this.x2 - origin.x) + origin.x
                this.y2 = scaleY * (this.y2 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.firstPoint = { x: scaleX * (this.firstPoint.x - origin.x) + origin.x , y: scaleY * (this.firstPoint.y - origin.y) + origin.y }
                this.secondPoint = { x: scaleX * (this.secondPoint.x - origin.x) + origin.x , y: scaleY * (this.secondPoint.y - origin.y) + origin.y }
                break
            case "bottomRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.x2 = scaleX * (this.x2 - origin.x) + origin.x
                this.y2 = scaleY * (this.y2 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                this.firstPoint = { x: scaleX * (this.firstPoint.x - origin.x) + origin.x , y: scaleY * (this.firstPoint.y - origin.y) + origin.y }
                this.secondPoint = { x: scaleX * (this.secondPoint.x - origin.x) + origin.x , y: scaleY * (this.secondPoint.y - origin.y) + origin.y }
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }
    // what defines the gizmo shouldn't be the same which defines the points
    Refine() {
        const capture = { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 }
        this.x1 = Math.min(capture.x1, capture.x2)
        this.y1 = Math.min(capture.y1, capture.y2)
        this.x2 = Math.max(capture.x1, capture.x2)
        this.y2 = Math.max(capture.y1, capture.y2)
        this.width = this.x2 - this.x1
        this.height = this.y2 - this.y1
    }

    Duplicate(generator) {
        const options = { ...this.options }
        const roughElement = generator.line(this.x1 + 10, this.y1 + 10, this.x2 + 10, this.y2 + 10, options)
        let res = new Line(this.x1 + 30, this.y1 + 30, this.x2 + 10, this.y2 + 10, options, roughElement, this.rotation)        
        res.updateDimensions(this.x2 + 30, this.y2 + 30, generator)
        return res
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, width: this.width, height: this.height, options: this.options, roughElement: this.roughElement, rotation: this.rotation }
    }
}

// width and height always positive
export class Rectangle extends Shape {
    // in this case x1, y1, width, height are the coordinates of the rectangle
    constructor(x1, y1, width, height, options, roughElement, rotation) {
        super(x1, y1, width, height, options, rotation)
        this.roughElement = roughElement
        this.type = "rectangle"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }

    updateDimensions(x2, y2, generator) {
        this.width = Number((x2 - this.x1).toFixed(2))
        this.height = Number((y2 - this.y1).toFixed(2))
        this.#updateRoughElement(generator)
    }

    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.rectangle(this.x1, this.y1, this.width, this.height, this.options)
    }

    Resize(dx, dy, generator, resizingPoint, _, gizmoRef) {
        let scaleX = 1, scaleY = 1, origin = { x: 0, y: 0 }
        switch (resizingPoint) {
            case "topLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                break
            case "topRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                break
            case "bottomLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                break
            case "bottomRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.x1 = scaleX * (this.x1 - origin.x) + origin.x
                this.y1 = scaleY * (this.y1 - origin.y) + origin.y
                this.width = scaleX * this.width
                this.height = scaleY * this.height
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, width: this.width, height: this.height }
        this.x1 = Math.min(capture.x1, capture.x1 + capture.width)
        this.y1 = Math.min(capture.y1, capture.y1 + capture.height)
        this.width = Math.abs(capture.width)
        this.height = Math.abs(capture.height)
    }

    Duplicate(generator) {
        const options = { ...this.options }
        const roughElement = generator.rectangle(this.x1 + 10, this.y1 + 10, this.width, this.height, options)
        return new Rectangle(this.x1 + 10, this.y1 + 10, this.width, this.height, options, roughElement, this.rotation)
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, width: this.width, height: this.height, options: this.options, roughElement: this.roughElement, rotation: this.rotation }
    }
}

// width and height always positive
export class Path extends Shape {
    // in this case x1, y1, x2, y2 are the bounding box of the path
    constructor(x1, y1, x2, y2, path, options, color, fillFlag, fillStyle, points, strokeStyle, rotation) {
        super(x1, y1, x2, y2, options, rotation)
        this.x2 = x2
        this.y2 = y2
        this.path = path
        this.type = "path"
        this.color = color
        this.fillFlag = fillFlag
        this.fillStyle = fillStyle
        this.points = points
        this.strokeStyle = strokeStyle
        this.width = x2 - x1
        this.height = y2 - y1
    }
    draw(context) {
        context.strokeStyle = this.strokeStyle
        context.fillStyle = this.color
        const stroke = getStroke(this.points, this.options)
        const path = getSvgPathFromStroke(stroke);
        context.fill(new Path2D(path))
    }
    updateDimensions(x2, y2) {
        this.x1 = Math.min(this.x1, x2)
        this.y1 = Math.min(this.y1, y2)
        this.x2 = Math.max(this.x2, x2)
        this.y2 = Math.max(this.y2, y2)
        this.width = this.x2 - this.x1
        this.height = this.y2 - this.y1
        this.centerX = this.x1 + this.width / 2
        this.centerY = this.y1 + this.height / 2
        this.points.push({ x: x2, y: y2 })
    }
    Resize(dx, dy, generator, resizingPoint, mouseDir, gizmoRef) {
        let scaleX = 1, scaleY = 1, origin = { x: 0, y: 0 }
        switch (resizingPoint) {
            case "topLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.points = this.points.map(({ x, y }) => {
                    let newX = scaleX * (x - origin.x) + origin.x
                    let newY = scaleY * (y - origin.y) + origin.y
                    return { x: newX, y: newY }
                })
                this.x1 = Math.min(...this.points.map(({ x }) => x))
                this.y1 = Math.min(...this.points.map(({ y }) => y))
                this.width -= dx
                this.height -= dy
                break
            case "topRight":
                origin = { x: gizmoRef.x1, y: gizmoRef.y1 + gizmoRef.height }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 - dy / gizmoRef.height) ? 1 - dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.points = this.points.map(({ x, y }) => {
                    let newX = scaleX * (x - origin.x) + origin.x
                    let newY = scaleY * (y - origin.y) + origin.y
                    return { x: newX, y: newY }
                })
                this.x2 = Math.max(...this.points.map(({ x }) => x))
                this.y1 = Math.min(...this.points.map(({ y }) => y))
                this.width += dx
                this.height -= dy
                break
            case "bottomLeft":
                origin = { x: gizmoRef.x1 + gizmoRef.width, y: gizmoRef.y1 }
                scaleX = isValidNumber(1 - dx / gizmoRef.width) ? 1 - dx / gizmoRef.width : 1
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.points = this.points.map(({ x, y }) => {
                    let newX = scaleX * (x - origin.x) + origin.x
                    let newY = scaleY * (y - origin.y) + origin.y
                    return { x: newX, y: newY }
                })
                this.x1 = Math.min(...this.points.map(({ x }) => x))
                this.y2 = Math.max(...this.points.map(({ y }) => y))
                this.height += dy
                this.width -= dx
                break
            case "bottomRight":
                origin = { x: gizmoRef.x1 , y: gizmoRef.y1 }
                scaleX = isValidNumber(1 + dx / gizmoRef.width) ? 1 + dx / gizmoRef.width : 1 // main problem is width could be 0 and 1 + dx could be 0 also 
                scaleY = isValidNumber(1 + dy / gizmoRef.height) ? 1 + dy / gizmoRef.height : 1
                if (scaleX === 0 || scaleY === 0) return
                this.points = this.points.map(({ x, y }) => {
                    let newX = scaleX * (x - origin.x) + origin.x 
                    let newY = scaleY * (y - origin.y) + origin.y 
                    return { x: newX, y: newY }
                })
                this.x2 = Math.max(...this.points.map(({ x }) => x))
                this.y2 = Math.max(...this.points.map(({ y }) => y))
                this.width += dx
                this.height += dy
                break
            default:
                break
        }
    }

    Refine() {
        this.x1 = Math.min(...this.points.map(({ x }) => x))
        this.y1 = Math.min(...this.points.map(({ y }) => y))
        this.x2 = Math.max(...this.points.map(({ x }) => x))
        this.y2 = Math.max(...this.points.map(({ y }) => y))
        this.width = this.x2 - this.x1
        this.height = this.y2 - this.y1
    }

    Move(dx, dy) {
        this.x1 += dx
        this.y1 += dy
        this.x2 += dx
        this.y2 += dy
        this.points = this.points.map(({ x, y }) => ({ x: x + dx, y: y + dy }))
    }

    Duplicate(generator) {
        const options = { ...this.options }
        const points = this.points.map(({ x, y }) => ({ x: x + 10, y: y + 10 }))
        return new Path(this.x1 + 10, this.y1 + 10, this.x2 + 10, this.y2 + 10, this.path, options, this.color, this.fillFlag, this.fillStyle, points, this.strokeStyle )
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, width: this.width, height: this.height, path: this.path, options: this.options, color: this.color, fillFlag: this.fillFlag, fillStyle: this.fillStyle, points: this.points, strokeStyle: this.strokeStyle }
    }

}

// width and height are always positive
export class Text extends Shape {
    constructor(x1, y1, text, options, rotation, width, height) {
        super(x1, y1, width, height, options, rotation)
        this.text = text
        this.width = width
        this.height = height
        this.type = "text"
    }

    draw(context, textAreaRef) {
        context.font = this.options.font;
        context.fillStyle = this.options.fill || "black";
        const zoom = useStore.getState().zoom
        const { width: maxLineWidth } = textAreaRef.current.getBoundingClientRect()

        textAreaRef.current.style.fontSize = this.options.font.split('px')[0] / zoom + 'px'
        textAreaRef.current.style.lineHeight = this.options.font.split('px')[0] / zoom + 'px'
        textAreaRef.current.style.fontFamily = this.options.font.split(' ')[1]

        const lines = this.text.split("\n");
        const allLines = wrappedLines(lines, maxLineWidth, context)
        this.height = allLines.length * this.options.font.split('px')[0]
        this.width = allLines.reduce((acc, line) => {
            return Math.max(acc, context.measureText(line).width)
        }, 0)
        allLines.forEach((line, i) => {
            context.fillText(line, this.x1, this.y1 + (i + 1) * this.options.font.split('px')[0]);
        });
    }
    Move(dx, dy) {
        this.x1 += dx
        this.y1 += dy
    }
    updateText(text) {
        this.text = text
    }

    Resize(dx, dy, generator, resizingPoint, mouseDir, gizmoRef) {
        let { left, right, up, down } = mouseDir
        let [fontSize, fontFamily] = this.options.font.split('px')
        switch (resizingPoint) {
            case "topLeft":
                this.options.font = left || up ? `${Number(fontSize) + 1}px ${fontFamily}` : `${Number(fontSize) - 1}px ${fontFamily}`
                this.x1 += dx
                this.y1 += dy
                break
            case "topRight":
                this.options.font = right || up ? `${Number(fontSize) + 1}px ${fontFamily}` : `${Number(fontSize) - 1}px ${fontFamily}`
                this.y1 += dy
                break
            case "bottomLeft":
                this.options.font = left || down ? `${Number(fontSize) + 1}px ${fontFamily}` : `${Number(fontSize) - 1}px ${fontFamily}`
                this.x1 += dx
                break
            case "bottomRight":
                this.options.font = right || down ? `${Number(fontSize) + 1}px ${fontFamily}` : `${Number(fontSize) - 1}px ${fontFamily}`
                break
            default:
                break
        }
    }

    Refine() {
        // TODO: modifiy the y1 coordinates to be the top left corner of the text
    }

    Duplicate(generator) {
        const options = { ...this.options }
        return new Text(this.x1 + 10, this.y1 + 10, this.text, options, this.rotation, this.width, this.height)
    }

    saveLastState() {
        return { x1: this.x1, y1: this.y1, text: this.text, options: { ...this.options }, width: this.width, height: this.height }
    }
}