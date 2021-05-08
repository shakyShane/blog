import React from "react";
import { CodeInPre, Pre } from "~/ui/CodeBlock";

import { PropsWithChildren } from "react";
import hljs from "highlight.js";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";

hljs.registerLanguage("rust", rust);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("html", html);

export type Lang = "rust" | "html" | "tsx" | "ts" | "js";

export function Highlight(props: PropsWithChildren<{ src: string; lang: Lang }>) {
  let code = props.src;

  if (props.src[0] === "\n") {
    code = props.src.slice(1);
  }

  let highlighted = hljs.highlight(props.lang, code);

  return (
    <div className="relative">
      <BlockLabel>{props.lang}</BlockLabel>
      <Pre>
        <CodeInPre src={highlighted.value} />
      </Pre>
    </div>
  );
}

export function BlockLabel(props: PropsWithChildren<any>) {
  return (
    <code className="text-sm absolute -top-3 md:top-2 right-3 text-gray-600 bg-atom text-code px-2 py-1 rounded">
      {props.children}
    </code>
  );
}

export function BlockLabelLight(props: PropsWithChildren<any>) {
  return (
    <code className="text-sm absolute border-2 -top-4 md:top-2 right-3 text-gray-600 bg-white text-code px-2 py-1 rounded">
      {props.children}
    </code>
  );
}
