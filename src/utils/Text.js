import React from 'react'

const Text = (elements, setElements) => {
    const startText = (e) => {
        const { clientX, clientY } = e;
        const id = Date.now();
        const newText = {
            type: 'text',
            id,
            x: clientX,
            y: clientY,
            value: '',
            font: '24px Arial',
            stroke: 'black',
            strokeWidth: 1,
        }
        setElements((prevElements) => [...prevElements, newText])
    }
    const text = (e) => {
        if (elements.length === 0) return;
        const val = e.target.value;
        const newText = elements[elements.length - 1];
        newText.value = val;
        setElements((prevElements) => {
            return [...prevElements.slice(0, -1), newText]
        })
    }
    const stopText = () => {
        console.log('onFinish')
    }
    return { startText, text, stopText }
}

export default Text