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


const wrappedLines = (lines, maxLineWidth, ctx) => {
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