import { readableColor } from "polished";

export type TagColor = {
  backgroundColor: string;
  textColor: string;
  [key: string]: unknown;
};

export const randomTagColor = (): TagColor => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 55 + Math.floor(Math.random() * 30);
  const lightness = 55 + Math.floor(Math.random() * 25);
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const textColor = readableColor(backgroundColor, "#000000", "#ffffff", true);
  return { backgroundColor, textColor };
};
