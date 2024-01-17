"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDom from "react-dom";
import styles from "./styles.module.css";


type Props = {
  json: Record<string, any>;
  elementId: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function JsonModal({
  json,
  isOpen,
  setIsOpen,
  elementId
}: Props) {

  const [element, setElement] = useState<HTMLElement | null>(null);

  // useEffect(() => {
  //   const element = document.getElementById(elementId);
  //   if (element) {
  //     setElement(element);
  //   }
  // }, []);

  const onOverlayClick = () => {
    setIsOpen(false);
  };

  if (!isOpen) return <></>;
  return ReactDom.createPortal(
    <>
      <div className={styles.overlay} onClick={onOverlayClick}/>
      <div className={styles.modal}>
        <pre>
        {JSON.stringify(json, null, 2)}
        </pre>
      </div>
    </>, document.getElementById(elementId)!
  );
}