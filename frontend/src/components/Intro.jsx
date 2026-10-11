import { useEffect, useState } from "react";

const letters = ["W", "H", "A", "T", "I", "F", "?"];

export default function Intro({ onComplete }) {
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => {
            setStarted(true);
        });

        const finish = setTimeout(() => {
            onComplete();
        }, 3400);

        return () => {
            cancelAnimationFrame(animation);
            clearTimeout(finish);
        };
    }, [onComplete]);

    return (
        <div className="intro-screen">
            <h1 className={`intro-title ${started ? "intro-started" : ""}`}>
                {letters.map((letter, index) => (
                    <span
                        className={`intro-letter intro-letter-${index}`}
                        key={`${letter}-${index}`}
                    >
                        {letter}
                    </span>
                ))}
            </h1>
        </div>
    );
}