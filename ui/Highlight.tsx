import React from "react";
import {CodeInPre, Pre} from "~/ui/CodeBlock";

import {PropsWithChildren} from "react";
import hljs from "highlight.js";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import basic from "highlight.js/lib/languages/basic";

hljs.registerLanguage("rust", rust);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("error", basic);
hljs.registerLanguage("html", html);

export const names = ["rust", "html", "tsx", "ts", "js"];
export type Lang = typeof names[number];

type HighlightParams = React.PropsWithChildren<{
  src: string;
  lang: Lang;
  lines?: number[];
  plusLines?: number[];
  attentionLines?: number[]
  errorLines?: number[]
}>;

export function Highlight(props: HighlightParams) {
  let code = props.src;
  let lines = props.lines || [];
  let plusLines = props.plusLines || [];
  let attentionLines = props.attentionLines || [];
  let errorLines = props.errorLines || [];

  if (props.src[0] === "\n") {
    code = props.src.slice(1);
  }

  let highlighted = props.lang
    ? hljs.highlight(props.lang, code)
    : {value: code}

  return (
    <div className="relative">
      <BlockLabel>{props.lang}</BlockLabel>
      <Pre>
        <CodeInPre src={highlighted.value}
                   lines={lines}
                   plusLines={plusLines}
                   attentionLines={attentionLines}
                   errorLines={errorLines} />
      </Pre>
    </div>
  );
}

export function BlockLabel(props: PropsWithChildren<any>) {
  return (
    <code className="text-sm absolute -top-3 md:top-2 right-3 text-gray-600 bg-atom text-code px-2 py-1 rounded z-10">
      {props.children}
    </code>
  );
}

export function BlockLabelLight(props: PropsWithChildren<any>) {
  return (
    <code
      className="text-sm absolute border-2 -top-4 md:top-3 right-3 text-gray-600 bg-white text-code px-2 py-1 rounded z-10">
      {props.children}
    </code>
  );
}
