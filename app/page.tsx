import css from "./page.module.scss";
import Link from "next/link";

export default function Home() {
    return (
        <ul className={css.list}>
            <li><Link href={'/word-game'}>Word Game</Link></li>
        </ul>
    );
}
