// Desc: Gizmo class for drawing a rectangle around the selected object
class Gizmo {
    constructor(x1, y1, width, height, bgColor, allowResize) {
        this.x1 = x1 - 5;
        this.y1 = y1 - 5;
        this.width = width + 10;
        this.height = height + 10;
        this.initX = this.x1;
        this.initY = this.y1;
        this.offset = 5;
        this.bgColor = bgColor;
        this.allowResize = allowResize;
    }
    draw(context) {
        const ctx = context.current;
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x1 , this.y1 , this.width , this.height );
        ctx.strokeStyle = "#0096FF";

        ctx.lineWidth = 1;
        ctx.fillStyle = this.bgColor || "rgba(0, 150, 255, 0.1)";
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const ResizingRegions = [
            [this.x1, this.y1],
            [this.x1 + this.width, this.y1],
            [this.x1, this.y1 + this.height],
            [this.x1 + this.width, this.y1 + this.height],
        ];

        this.allowResize && ResizingRegions.forEach(([x, y]) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#0096FF";
            ctx.fill();
            ctx.restore();
        });
    }

    isMouseOver(x, y) {
        return x > this.x1 && x < this.x1 + this.width && y > this.y1  && y < this.y1 + this.height;
    }
    
    updateCoordinates(x, y) {
       this.width = x - this.x1;
       this.height = y - this.y1;
    }

    Move(dx, dy) {
        this.x1 += dx;
        this.y1 += dy;
    }

    Resize(dx, dy) {
        this.width += dx;
        this.height += dy;
    }

    isMouseResizing(x, y) {
        if (!this.allowResize) return false;
        const ResizingRegions = [
            [this.x1, this.y1],
            [this.x1 + this.width, this.y1],
            [this.x1, this.y1 + this.height],
            [this.x1 + this.width, this.y1 + this.height],
        ];

        return ResizingRegions.some(([gx, gy]) => Math.hypot(gx - x, gy - y) <= 5 + this.offset);
    }
}

export default Gizmo