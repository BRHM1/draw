const Text = (elements, setElements, focus) => {
    const startText = (e) => {
        // if the last element is text and it's empty, remove it
        if (elements.length >= 1 &&
            elements[elements.length - 1].type === 'text' &&
            elements[elements.length - 1].value === '') {
            setElements((prevElements) => {
                return [...prevElements.slice(0, -1)]
            })
        }
        // focus on the text input
        focus();
        const { clientX, clientY } = e;
        const id = Date.now();
        // create a new text element
        const newText = {
            type: 'text',
            id,
            x: clientX,
            y: clientY,
            x2: clientX + 50,
            y2: clientY + 25,
            width: 50,
            height: 25,
            value: "",
            font: '24px Arial',
            stroke: 'black',
            strokeWidth: 1,
        }
        setElements((prevElements) => [...prevElements, newText])
    }
    // const newText = elements[elements.length - 1];
    const chars = new Set([
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
        "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z", "Enter", "Backspace", " ",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
        "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3",
        "4", "5", "6", "7", "8", "9", "!", "@", "#", "$",
        "%", "^", "&", "*", "(", ")", "-", "_", "+", "=",
        "[", "]", "{", "}", "|", ";", ":", "'", "\"", ",",
        ".", "<", ">", "/", "?", "`", "~", "\\", 
    ])
    const newText = elements[elements.length - 1];
    const text = (e) => {
        if (elements.length === 0) return;
        if (!chars.has(e.nativeEvent.key)) return;
        switch (e.nativeEvent.key) {
            case 'Enter':
                newText.value += '\n';
                break;
            case 'Backspace':
                newText.value = newText.value.slice(0, -1);
                break;
            default:
                newText.value += e.nativeEvent.key;
                newText.x2 = newText.x + newText.value.length * 10;
                break;
        }
        newText.width = newText.value.length * 20;
    }
    const stopText = (e) => {
        setElements((prevElements) => {
            return [...prevElements.slice(0, -1), newText]
        })
    }
    return { startText, text, stopText }
}

export default Text