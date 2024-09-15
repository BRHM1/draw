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


class Circle extends Shape {
    constructor(x1, y1, diameter, options) {
        super(x1, y1, diameter, diameter, options)
    }
}