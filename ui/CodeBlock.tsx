import React, { PropsWithChildren } from "react";

export function Pre(props) {
  return (
    <pre className="bg-atom rounded text-white font-mono text-base p-4 mb-4 md:p-4">
      {props.children}
    </pre>
  );
}

export function CodeInPre(props: PropsWithChildren<{ src?: string }>) {
  if (props.src) {
    return (
      <code
        className="text-code text-sm block whitespace-pre overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: props.src }}
      />
    );
  }
  return (
    <code className="text-code text-sm block whitespace-pre overflow-x-auto">
      {props.children}
    </code>
  );
}
