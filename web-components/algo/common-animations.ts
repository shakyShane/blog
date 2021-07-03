import { TimelineLite } from "gsap";
import TweenTarget = gsap.TweenTarget;

export type PointerId = string;
export type ElementId = string;
export type XIndex = number;

export enum Color {
  red = "red",
  orange = "orange",
  lightgreen = "lightgreen",
  black = "black",
  purple = "purple",
}

export const times = {
  DURATION: 0.3,
};

export const sizes = {
  CELL: 20,
};

export function positionItems<T extends HTMLElement>(timeline, cells: T[]) {
  cells.forEach((cell, index) => {
    timeline.set(cell, {
      translateX: sizes.CELL * index
    })
  })
}

export function bounceInputIn<T extends HTMLElement>(timeline, cells: T[]) {
  timeline.set(cells, { visibility: "visible" }).fromTo(
    cells,
    { opacity: 0, translateY: 10 },
    {
      duration: 1,
      opacity: 1,
      translateY: 0,
      stagger: 0.1,
      ease: "elastic(1, 0.3)",
      color: Color.black,
      scale: 1,
    }
  );
}

export function fadeInPointer(timeline: TimelineLite, elem: TweenTarget, color = "white", duration = times.DURATION) {
  timeline.fromTo(
    elem,
    { color, visibility: "hidden", opacity: 0, scale: 0, duration },
    { color, visibility: "visible", opacity: 1, scale: 1, duration }
  );
}

export function showPointer(timeline: TimelineLite, elem: TweenTarget, color = "white") {
  timeline.set(elem, { color, visibility: "visible", opacity: 1, duration: 0 });
}
