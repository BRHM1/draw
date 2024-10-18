// Desc: Gizmo class for drawing a rectangle around the selected object
class Gizmo {
    constructor(x1, y1, width, height, bgColor, allowResize) {
        this.x1 = x1 - 5;
        this.y1 = y1 - 5;
        this.width = Math.abs(width + 10);
        this.height = Math.abs(height + 10);
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
        switch (this.resizingPoint) {
            case "topLeft":
                this.x1 += dx
                this.y1 += dy
                this.width -= dx
                this.height -= dy
                break
            case "topRight":
                this.y1 += dy
                this.width += dx
                this.height -= dy
                break
            case "bottomLeft":
                this.x1 += dx
                this.width -= dx
                this.height += dy
                break
            case "bottomRight":
                this.width += dx
                this.height += dy
                break
            default:
                break
        }
    }

    isMouseResizing(x, y) {
        if (!this.allowResize) return false;
        const ResizingRegions = {
            topLeft: [this.x1, this.y1],
            topRight: [this.x1 + this.width, this.y1],
            bottomLeft: [this.x1, this.y1 + this.height],
            bottomRight: [this.x1 + this.width, this.y1 + this.height],
        };
        // determine which resizing region the mouse is over
        let isPointOnRegion = (x, y, region) => Math.hypot(region[0] - x, region[1] - y) <= 5 + this.offset;
        let region = Object.entries(ResizingRegions).find(([_, region]) => isPointOnRegion(x, y, region));
        this.resizingPoint = region ? region[0] : false;
        return region ? region[0] : false;
    }
}

export default Gizmo