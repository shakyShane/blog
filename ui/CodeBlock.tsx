import React, { PropsWithChildren } from "react";
import { BlockLabel, names } from "~/ui/Highlight";

export function Pre(props) {
  return (
    <pre className="bg-atom relative rounded text-white font-mono text-base p-4 mb-4 md:p-4">{props.children}</pre>
  );
}

export function CodeInPre(props: PropsWithChildren<{ src?: string; className?: string }>) {
  if (props.src) {
    return (
      <code
        className="text-code text-sm block whitespace-pre overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: props.src }}
      />
    );
  }
  const label = labelFromLang(props.className);
  return (
    <>
      <BlockLabel>{label}</BlockLabel>
      <code className="text-code text-sm block whitespace-pre overflow-x-auto">{props.children}</code>
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
