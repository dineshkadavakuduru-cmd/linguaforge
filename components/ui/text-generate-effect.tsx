"use client";

import { motion } from "motion/react";

export function TextGenerateEffect({ words, className = "" }: { words: string; className?: string }) {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.035 } }, hidden: {} }}
      aria-label={words}
      className={className}
    >
      {words.split(" ").map((word, index) => (
        <motion.span key={`${word}-${index}`} variants={{ hidden: { opacity: 0, y: 12, filter: "blur(5px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }} className="mr-[0.24em] inline-block last:mr-0">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
