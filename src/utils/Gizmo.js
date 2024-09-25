// Desc: Gizmo class for drawing a rectangle around the selected object
class Gizmo {
    constructor(x1, y1, x2, y2, bgColor) {
        this.x1 = Math.min(x1, x2) - 5;
        this.y1 = Math.min(y1, y2) - 5;
        this.x2 = Math.max(x1, x2) + 5;
        this.y2 = Math.max(y1, y2) + 5;
        this.bgColor = bgColor;
    }
    draw(context) {
        const ctx = context.current;
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x1 , this.y1 , this.x2 - this.x1 , this.y2 - this.y1 );
        ctx.strokeStyle = "#0096FF";

        ctx.lineWidth = 1;
        ctx.fillStyle = this.bgColor || "rgba(0, 150, 255, 0.1)";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

export default Gizmo