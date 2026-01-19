import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';

export default function useDraggableScroll<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e: MouseEvent) => {
        if (!ref.current) return;
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging || !ref.current) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        ref.current.scrollLeft = scrollLeft - walk;
    };

    return {
        ref,
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
        isDragging
    };
}
