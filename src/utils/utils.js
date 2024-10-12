import { getStroke } from "perfect-freehand";

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


export function wrappedLines(lines, maxLineWidth, ctx) {
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
  }, // works fine
  line: (x, y, element) => {
    const { x1, y1, x2, y2 } = element
    const a = { x: x1, y: y1 } // start point
    const b = { x: x2, y: y2 } // end point
    const c = { x, y } // point to check(mouse position)
    const offset = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
    const a1 = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2))
    const a2 = Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2))
    return a1 + a2 >= offset - 0.5 && a1 + a2 <= offset + 0.5 ? element : null
  }, // works fine
  circle: (x, y, element) => {
    // calculate distance between center of circle and mouse position if distance is less than radius then point is inside circle
    const { centerX, centerY, radius } = element
    const distance = Math.hypot(Math.abs(x - centerX), Math.abs(y - centerY))
    return distance <= radius ? element : null
  }, // works fine
  ellipse: (x, y, element) => {
    // ((x - centerX)^2 / semiMajorAxis^2) + ((y - centerY)^2 / semiMinorAxis^2) <= 1
    const { width, height, centerX, centerY } = element
    const semiMajorAxis = Math.abs(width / 2)
    const semiMinorAxis = Math.abs(height / 2)
    const isInside = ((x - centerX) ** 2 / semiMajorAxis ** 2) + ((y - centerY) ** 2 / semiMinorAxis ** 2) <= 1
    return isInside ? element : null
  }, // works fine
  path: (x, y, element) => {
    const { points, options } = element
    const stroke = getStroke(points, options)
    const path = getSvgPathFromStroke(stroke);
    const ctx = document.createElement("canvas").getContext("2d")
    return ctx.isPointInPath(new Path2D(path), x, y) ? element : null
  }, // works fine 
  text: (x, y, element) => {
    const { x1, y1, width, height } = element
    return x >= Math.min(x1, x1 + width) && x <= Math.max(x1, x1 + width) && y >= Math.min(y1, y1 + height) && y <= Math.max(y1, y1 + height) ? element : null
  }, // works fine 
}

export function getElementAtPos(x, y, elements) {
  if (elements?.length === 0) return null
  for (let i = elements?.length - 1; i >= 0; i--) {
    const element = elements[i]
    if (element.hidden) continue
    if (pointInsideElementFormula[element.type](x, y, element)) return element
  }
  return null
}

export function getElementsInsideSelectionBox(selectionBox, elements) {
  const { x1, y1, x2, y2 } = selectionBox
  const Bounding_x1 = Math.min(x1, x2)
  const Bounding_x2 = Math.max(x1, x2)
  const Bounding_y1 = Math.min(y1, y2)
  const Bounding_y2 = Math.max(y1, y2)
  const elementsInside = []
  for (let i = 0; i < elements.length; i++) {
    const { x1, y1, width, height, hidden } = elements[i]
    if (hidden) continue
    const minX = Math.min(x1, x1 + width)
    const maxX = Math.max(x1, x1 + width)
    const minY = Math.min(y1, y1 + height)
    const maxY = Math.max(y1, y1 + height)
    if (minX >= Bounding_x1 && maxX <= Bounding_x2 && minY >= Bounding_y1 && maxY <= Bounding_y2) {
      elementsInside.push(elements[i])
    }
  }
  return elementsInside
}


export function drawElement(element, context, roughCanvas, canvasRef) {
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


// Browser DB functions(Add, Get, Delete)
export const addData = (data) => {
  return new Promise((resolve) => {
    const request = window.indexedDB.open('myDB', 1);

    request.onsuccess = () => {
      console.log('request.onsuccess - addData', data);
      const db = request.result;
      const tx = db.transaction('elements', 'readwrite');
      const store = tx.objectStore('elements');
      store.add(data);
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const getData = () => {
  return new Promise((resolve) => {
    const request = window.indexedDB.open('myDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('elements', 'readonly');
      const store = tx.objectStore('elements');
      const data = store.getAll();
      data.onsuccess = () => {
        resolve(data.result);
      };
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const deleteData = (id) => {
  return new Promise((resolve) => {
    const request = window.indexedDB.open('myDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('elements', 'readwrite');
      const store = tx.objectStore('elements');
      store.delete(id);
      resolve(id);
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};