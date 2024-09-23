const average = (a, b) => (a + b) / 2

export function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}


export function wrappedLines (lines, maxLineWidth, ctx) {
  const wrapped = [];
  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(" ");
    let currentLine = words[0];
    for (let j = 1; j < words.length; j++) {
      const word = words[j];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxLineWidth) {
        currentLine += " " + word;
      } else {
        wrapped.push(currentLine);
        currentLine = word;
      }
    }
    wrapped.push(currentLine);
  }
  return wrapped;
};


const pointInsideElementFormula = {
  rectangle: (x, y, element) => {
      const { x1, y1, width, height } = element
      return x >= Math.min(x1, x1 + width) && x <= Math.max(x1, x1 + width) && y >= Math.min(y1, y1 + height) && y <= Math.max(y1, y1 + height) ? element : null
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

export function getElementAtPos (x, y, elements) {
  if (elements?.length === 0) return null
  for (let i = elements?.length - 1; i >= 0; i--) {
      const element = elements[i]
      switch(element?.type) {
        case "rectangle":
          if (pointInsideElementFormula.rectangle(x, y, element)) return element.id
          break
        case "line":
          if (pointInsideElementFormula.line(x, y, element)) return element.id
          break
        case "circle":
          if (pointInsideElementFormula.circle(x, y, element)) return element.id
          break
        case "ellipse":
          if (pointInsideElementFormula.ellipse(x, y, element)) return element.id
          break
        case "path":
          if (pointInsideElementFormula.path(x, y, element)) return element.id
          break
        case "text":
          if (pointInsideElementFormula.text(x, y, element)) return element.id
          break
      }
  }
  return null
}

export function drawElement (element, context , roughCanvas, canvasRef) {
  switch (element?.type) {
    case "path":
      context.strokeStyle = element.stroke;
      context.fillStyle = element.color;
      context.fill(element.path)
      break;
    case "erase":
      context.clearRect(
        element.x,
        element.y,
        element.width,
        element.height
      );
      break;
    case "text":
      context.font = element.font;
      context.strokeStyle = element.stroke;
      context.lineWidth = element.strokeWidth;
      const maxLineWidth = canvasRef.current.width - element.x1;
      const lines = element.value.split("\n");
      wrappedLines(lines, maxLineWidth, context).forEach((line, i) => {
        context.fillText(line, element.x1, element.y1 + i * 25);
      });
      break;
    default:
      element?.roughElement ? roughCanvas.draw(element.roughElement) : null;
      break;
  }
};