import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
const CELL_WIDTH = 30;
const MARGIN_RIGHT = 0;

export function Test() {
  const [input] = useState("({}00]})");
  const { result, values } = useMemo(() => balanced(input), [input]);
  const steps = values.length;
  const [current, setStep] = useState(-1);
  const clamped = current < steps ? current : steps - 1;
  const asRef = useRef({ current, steps });
  asRef.current = { current, steps };
  const stack = clamped > -1 && values[clamped] ? values[clamped].stack : [];
  const actions = clamped > -1 && values[clamped] ? values[clamped].actions : [];
  const left = clamped * CELL_WIDTH + MARGIN_RIGHT * clamped;
  const step = useCallback(() => {
    setStep((prev) => (prev < steps - 1 ? prev + 1 : prev));
  }, [steps]);
  const stepBack = useCallback(() => {
    setStep((prev) => (prev > -1 ? prev - 1 : prev));
  }, []);
  const [playing, setPlaying] = useState(false);

  const keyUp = useCallback((evt) => {
    if (evt.code === "ArrowRight") {
      step();
    }
    if (evt.code === "ArrowLeft") {
      stepBack();
    }
  }, []);

  useEffect(() => {
    let id;
    function play() {
      if (asRef.current.current + 1 === asRef.current.steps) {
        setPlaying(false);
        return;
      }
      clearTimeout(id);
      id = setTimeout(() => {
        step();
        play();
      }, 1000);
    }
    if (playing) {
      play();
    }
    return () => {
      clearTimeout(id);
    };
  }, [playing]);

  return (
    <div onKeyUp={keyUp}>
      <Label>Stack</Label>
      <Row>
        <Char>{"["}</Char>
        {stack.map((x, index) => {
          return <Cell key={`${x}-${index}`}>{x}</Cell>;
        })}
        <Char>{"]"}</Char>
      </Row>
      <div className="pt-4">
        <Label>Input</Label>
        <Row>
          {input.split("").map((x, index) => {
            return (
              <Cell key={`${x}-${index}`} active={clamped === index}>
                {x}
              </Cell>
            );
          })}
        </Row>
      </div>
      <div className="">
        <Row>
          <Pointer left={left} visible={clamped > -1}>
            <span>^</span>
            <span className="text-sm">{clamped}</span>
          </Pointer>
        </Row>
      </div>
      <div className="pt-4">
        <Label>result: {clamped === steps - 1 ? String(result) : "n/a"}</Label>
      </div>

      <div className="pt-4">
        <p>
          <button type="button" className="border-2 font-mono px-3" onClick={stepBack}>
            Prev
          </button>
          <button type="button" className="border-2 font-mono px-3" onClick={step}>
            Next
          </button>
          {!playing && (
            <button type="button" className="border-2 font-mono px-3" onClick={() => setPlaying(true)}>
              Play
            </button>
          )}
          {playing && (
            <button type="button" className="border-2 font-mono px-3" onClick={() => setPlaying(false)}>
              Pause
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function Row(props: PropsWithChildren<any>) {
  return <div className="pt-2 flex items-center font-mono">{props.children}</div>;
}

function Cell(props: PropsWithChildren<{ left?: number; active?: boolean }>) {
  return (
    <span
      className="border-2 px-1 text-center"
      style={{
        width: `${CELL_WIDTH}px`,
        display: "block",
        color: props.active ? "#41f741" : "",
      }}
    >
      {props.children}
    </span>
  );
}

function Pointer(props: PropsWithChildren<{ left?: number; visible?: boolean }>) {
  return (
    <div
      className="border-2 flex flex-col border-transparent px-1 text-center transition transition-all"
      style={{
        width: `${CELL_WIDTH}px`,
        transform: props.left ? `translateX(${props.left}px)` : "",
        opacity: props.visible ? "1" : "0",
      }}
    >
      {props.children}
    </div>
  );
}

// function Arrow() {
//   return (
//     <svg viewBox="0 0 24 24" style={{ border: "1px solid red" }} height="50" width="50">
//       <line x1="2" y1="4.2" x2="22" y2="4.2" />
//       <line x1="2" y1="8" x2="22" y2="8" />
//     </svg>
//   );
// }

function Label(props: PropsWithChildren<any>) {
  return <p className="font-mono text-sm">{props.children}</p>;
}

function Char(props: PropsWithChildren<any>) {
  return <span className="border-2 border-transparent text-gray-300 px-1">{props.children}</span>;
}

function balanced(input: string) {
  console.log("input=", input);
  const values: {
    stack: string[];
    index: number;
    actions: string[];
  }[] = [];
  const stack = [];
  const map = {
    "(": ")",
    "[": "]",
    "{": "}",
  };
  let result = true;
  loop: for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    console.log("char", char);
    switch (char) {
      case "(":
      case "{":
      case "[": {
        stack.push(map[char]);
        values.push({ stack: stack.slice(), index: i, actions: [`stack.push("${map[char]}")`] });
        break;
      }
      case ")":
      case "]":
      case "}": {
        const prev = stack.pop();
        values.push({ stack: stack.slice(), index: i, actions: ["stack.pop()", "prev === char"] });
        if (prev !== char) {
          console.log("set false");
          result = false;
          break loop;
        }
        break;
      }
      default: {
        values.push({ stack: stack.slice(), index: i, actions: [] });
      }
    }
  }
  return { result: result && stack.length === 0, values };
}

function Pop(props: PropsWithChildren<any>) {
  const ref = useRef();
  return (
    <>
      <style jsx global>
        {`
          @keyframes bounce {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          .fade-in {
            color: red;
            animation-name: bounce;
            animation-duration: 0.3s;
            animation-fill-mode: forwards;
          }
        `}
      </style>
      <span ref={ref} className="pop">
        {props.children}
      </span>
    </>
  );
}
