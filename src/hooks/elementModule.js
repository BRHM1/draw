export class Shape {
    constructor(x1, y1, width, height, options) {
        this.x1 = x1
        this.y1 = y1
        this.width = width
        this.height = height
        this.options = options
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
}


export class Circle extends Shape {
    constructor(x1, y1, diameter, options, roughElement, centerX, centerY, ) {
        super(x1, y1, diameter, diameter, options)
        this.roughElement = roughElement
        this.centerX = centerX
        this.centerY = centerY
        this.type = "circle"
    }
}

export class Ellipse extends Shape {
    constructor(x1, y1, width, height, options, roughElement) {
        super(x1, y1, width, height, options)
        this.roughElement = roughElement
        this.type = "ellipse"
    }
}

export class Line extends Shape {
    constructor(x1, y1, x2, y2, options, roughElement) {
        super(x1, y1, x2, y2, options)
        this.roughElement = roughElement
        this.type = "line"
    }
}

export class Rectangle extends Shape {
    constructor(x1, y1, width, height, options, roughElement) {
        super(x1, y1, width, height, options)
        this.roughElement = roughElement
        this.type = "rectangle"
    }
}

export class Path extends Shape {
    constructor(x1, y1, x2, y2, path, options, color, fillFlag, fillStyle, points, strokeStyle) {
        super(x1, y1, x2, y2, options)
        this.path = path
        this.type = "path"
        this.color = color
        this.fillFlag = fillFlag
        this.fillStyle = fillStyle
        this.points = points
        this.strokeStyle = strokeStyle
    }
}