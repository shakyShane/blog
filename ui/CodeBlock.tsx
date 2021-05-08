import React, { PropsWithChildren } from "react";

export function Pre(props) {
  return (
    <pre style={{ background: "#282c34" }} className="rounded text-white font-mono text-base p-4 mb-4 md:p-4">
      {props.children}
    </pre>
  );
}

export function CodeInPre(props: PropsWithChildren<{ src?: string }>) {
  if (props.src) {
    return (
      <code
        style={{ color: "#abb2bf" }}
        className="block whitespace-pre overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: props.src }}
      />
    );
  }
  return (
    <code style={{ color: "#abb2bf" }} className="block whitespace-pre overflow-x-auto">
      {props.children}
    </code>
  );
}
