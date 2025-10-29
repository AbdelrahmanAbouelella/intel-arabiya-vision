import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

<<<<<<< HEAD
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
=======
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
>>>>>>> 467fd0a475c25716ce964992426fa3e65259afc7
}
