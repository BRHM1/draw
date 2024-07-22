import { useState } from 'react';
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
        console.log(e.target.value)
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
            width: 50,
            height: 25,
            value: "",
            font: '24px Arial',
            stroke: 'black',
            strokeWidth: 1,
        }
        setElements((prevElements) => [...prevElements, newText])
    }
    const text = (e) => {
        if (elements.length === 0) return;
        const newText = elements[elements.length - 1];
        switch (e.nativeEvent.key) {
            case 'Enter':
                newText.value += '\n';
                break;
            case 'Backspace':
                newText.value = newText.value.slice(0, -1);
                break;
            default:
                newText.value += e.nativeEvent.key;
                break;
        }
        newText.width = newText.value.length * 20;
        setElements((prevElements) => {
            return [...prevElements.slice(0, -1), newText]
        })
    }
    const stopText = (e) => {
    }
    return { startText, text, stopText }
}

export default Text