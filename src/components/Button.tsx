import styles from "./Button.module.css";
import { ReactNode, MouseEvent } from "react";

interface HasButton {
  children: ReactNode;
  onClick?: (data: MouseEvent<HTMLButtonElement>) => void;
  type?: String;
}

function Button({ children, onClick, type }: HasButton) {
  let isColor = styles[`${type}`];
  return (
    <button onClick={onClick} className={`${styles.btn} ${isColor}`}>
      {children}
    </button>
  );
}

export default Button;
