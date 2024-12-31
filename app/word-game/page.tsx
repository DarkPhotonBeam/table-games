"use client";

import css from './word-game.module.scss';
import {useEffect, useRef, useState} from "react";

interface Letter {
    symbol: string;
    used: boolean;
    staged: boolean;
    className: string;
    style: {
        left: string;
        top: string;
        background: string;
    }
}

const radius = 43;
const colorSaturation = 180;

const rgba = (r: number, g: number, b: number, a: number) => {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const getCoords = (i: number, n: number) => {
    const arg = i / n;
    const x = Math.cos(arg * 2 * Math.PI) * radius + 50;
    const y = Math.sin(arg * 2 * Math.PI) * radius + 50;
    return {x: `${x}%`, y: `${y}%`};
};

function getDefaultLetters(): Letter[] {
    const symbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    //const symbols = ['a', 'b', 'c', 'd'];
    const arr: Letter[] = [];
    for (let i = 0; i < symbols.length; ++i) {
        const coords = getCoords(i, symbols.length);
        arr.push({
            symbol: symbols[i],
            used: false,
            staged: false,
            className: css.letter,
            style: {
                left: coords.x,
                top: coords.y,
                background: rgba((1-i/symbols.length)*colorSaturation, 40, i/symbols.length*colorSaturation, 255),
            }
        });
    }
    return arr;
}

export default function WordGame() {
    const [letters, setLetters] = useState<Letter[]>(getDefaultLetters());
    const [numStaged, setNumStaged] = useState<number>(0);
    const [round, setRound] = useState(1);
    const [started, setStarted] = useState(false);
    const timeUpRef = useRef<boolean>(false);
    const timerRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastTime = useRef<number>(-1);
    //const timeCount = useRef<number>(0);

    useEffect(() => {
	audioRef.current = new Audio("/gameOver.mp3");
    }, []);

    const reset = () => {
        const _letters = [...letters];
        _letters.forEach(letter => {
            letter.used = false;
            letter.staged = false;
        });
        setStarted(false);
        setNumStaged(0);
        if (timerRef.current != null) window.clearTimeout(timerRef.current);
        timeRef.current = 0;
        timerRef.current = null;
        setRound(1);
        timeUpRef.current = false;
        setLetters(_letters);
    };

    const stageLetter = (i: number) => {
        if (!started) return;
        const _letters = [...letters];
        if (_letters[i].used) return;
        if (_letters[i].staged) {
            // unstage
            if (numStaged == 0) return;
            setNumStaged(numStaged - 1)
        } else {
            // stage
            if (numStaged >= round) return;
            setNumStaged(numStaged + 1);
        }
        _letters[i].staged = !_letters[i].staged;
        setLetters(_letters);
    };

    const timeFrame = (timePassed: number) => {
        if (lastTime.current === -1 || timePassed < lastTime.current) lastTime.current = timePassed;
        const delta = timePassed - lastTime.current;
        timeRef.current = timeRef.current + delta / 1000;
        if (!timeUpRef.current) requestAnimationFrame(timeFrame);
        if (timeUpRef.current) {
            console.log("TIME UP");
            if (audioRef.current != null) audioRef.current.play().then();
            reset();
        }
    };

    const resetTimer = () => {
        timeRef.current = 0;
        lastTime.current = -1;
        timeUpRef.current = false;
    };

    const startTimer = () => {
        timeUpRef.current = false;
        timeFrame(0);
        if (timerRef.current != null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            timeUpRef.current = true;
        }, 10 * 1000);
    };

    const confirm = () => {
        if (!started) {
            setStarted(true);
            startTimer();
            return;
        }
        if (numStaged != round) return;
        const _letters = [...letters];
        let numUnused = 0;
        for (let i = 0; i < _letters.length; ++i) {
            if (!_letters[i].used) ++numUnused;
            if (_letters[i].staged) {
                _letters[i].used = true;
                --numUnused;
                _letters[i].staged = false;
            }
        }
        console.log(numUnused);
        if (numUnused < round) {
            for (let i = 0; i < _letters.length; ++i) {
                _letters[i].used = false;
                _letters[i].staged = false;
                setRound(round + 1);
            }
        }
        resetTimer();
        startTimer();
        setLetters(_letters);
        setNumStaged(0);
    };

    return (
        <div className={css.game}>
            {
                letters.map((letter, i) => (letter.used ? "" :
                    <div onClick={() => stageLetter(i)} className={letter.className + ' ' + (letter.staged || !started ? css.staged : "")} key={i} style={letter.style}>{letter.symbol}</div>
                ))
            }
            <div className={css.reset} onClick={reset}>Reset</div>
            <div className={css.confirm} onClick={confirm}>{started ? "OK" : "Start"}</div>
            <div className={css.round}>Round {round}</div>
        </div>
    );
}
