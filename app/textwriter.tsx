// TextWriter.tsx
'use client'
import React, { useState, useEffect } from 'react';
const TextWriter = ({ text, delay }: { text: string; delay: number }) => {
    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);
  
    useEffect(() => {
      setDisplayText('');
      setIndex(0);
    }, [text]);
  
    useEffect(() => {
      if (index >= text.length) return;
  
      const timer = setInterval(() => {
        const currentChar = text.charAt(index);
        const nextChar = text.charAt(index + 1);
        setDisplayText((prevDisplayText) => {
          if (currentChar === '.' && nextChar !== ' ') {
            return prevDisplayText + currentChar + ' ';
          }
          return prevDisplayText + currentChar;
        });
        setIndex((prevIndex) => prevIndex + 1);
      }, delay);
  
      return () => clearInterval(timer);
    }, [text, delay, index]);
  
    return <div>{displayText}</div>;
  };
  
  export default TextWriter;