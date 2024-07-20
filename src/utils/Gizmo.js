// Desc: Gizmo class for drawing a rectangle around the selected object
class Gizmo {
    constructor(coordinates) {
        this.minX = coordinates.minX
        this.minY = coordinates.minY
        this.maxX = coordinates.maxX
        this.maxY = coordinates.maxY
    }
    draw(context) {
        const { minX, minY, maxX, maxY } = this
        const center = {
            x: (maxX - minX) / 2,
            y: (maxY - minY) / 2,
        };
        const ctx = context.current;
        ctx.save();
        ctx.beginPath();
        ctx.rect(minX - 15, minY - 15 , maxX - minX + 30, maxY - minY + 30);
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
    }

}

export default Gizmo