import React, { PropsWithChildren } from "react";
import { BlockLabel, names } from "~/ui/Highlight";
import {renderToString} from "react-dom/server";

export function Pre(props) {
  return (
    <pre className="bg-atom relative rounded text-white font-mono text-base py-4 md:py-8 mb-4">{props.children}</pre>
  );
}

export function AutoCodeInPre(props) {
  if (typeof props.metastring === "string") {
    try {
      let vars = JSON.parse(props.metastring);
      let lines = vars.lines?.map(Number)||[]
      let plusLines = vars.plusLines?.map(Number)||[];
      let attentionLines = vars.attentionLines?.map(Number)||[];
      let errorLines = vars.errorLines?.map(Number)||[];
      return <CodeInPre {...props} lines={lines}
                        plusLines={plusLines}
                        attentionLines={attentionLines}
                        errorLines={errorLines}
      />
    } catch (e) {
      console.log('nah');
    }
  }
  return <CodeInPre {...props} />
}

type CodeProps = PropsWithChildren<{
  src?: string;
  className?: string,
  lines: number[],
  plusLines: number[],
  attentionLines: number[]
  errorLines: number[]
}>
export function CodeInPre(props: CodeProps) {
  function process(str) {
    let split = str.split('\n');
    let lines = [];
    let count = 0;
    let attentionCount = 0;
    for (let string of split) {
      let isLast = count === split.length - 1;
      let highlight = Boolean(props.lines?.includes(count));
      let plus = Boolean(props.plusLines?.includes(count));
      let attention = Boolean(props.attentionLines?.includes(count));
      let errors = Boolean(props.errorLines?.includes(count));
      let attr = "false";
      if (plus) attr = "plus";
      if (highlight) attr = "highlight";
      if (attention) attr = "highlight";
      if (errors) attr = "error";
      let highlightAttr = attr !== "false"
        ? `data-highlight-line="${attr}"`
        : ''

      let contentAttr = attention ? `data-line-content="${++attentionCount}"` : '';
      if (string === "" && !isLast) {
        lines.push(`<div ${highlightAttr} ${contentAttr}  class="px-4 md:px-8">&nbsp;</div>`)
      } else {
        lines.push(`<div ${highlightAttr} ${contentAttr} class="px-4 md:px-8">${string}</div>`)
      }
      count++
    }
    return lines.join('')
  }

  const label = labelFromLang(props.className);
  if (props.src) {
    return (
      <>
        <BlockLabel>{label}</BlockLabel>
        <code
          className="text-code text-sm block whitespace-pre overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: process(props.src) }}
        />
      </>
    );
  }


  return (
    <>
      <BlockLabel>{label}</BlockLabel>
      <code className="text-code text-sm block whitespace-pre overflow-x-auto"
            dangerouslySetInnerHTML={{__html:process(renderToString(props.children))}}
      />
    </>
  );
}

function labelFromLang(className?: string): string | null {
  if (typeof className === "string") {
    const match = className.match(/language-(.+)?/);
    if (match && match[1]) {
      if (names.includes(match[1])) {
        return match[1];
      }
    }
  }
  return null;
}
