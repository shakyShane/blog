import React, { Children, PropsWithChildren } from "react";

type LoaderProps = {
  kind?: "vanilla" | "preact";
  mdxType?: string;
  originalType?: any;
  scriptInclude?: string | string[];
};

export function BrowserComponent(props: PropsWithChildren<LoaderProps>) {
  const { kind = "preact", scriptInclude } = props;
  if (kind === "vanilla" && scriptInclude) {
    console.log(scriptInclude);
    return (
      <>
        <script
          type={"text/json"}
          data-modfed-kind={kind}
          data-modfed-data
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ scriptInclude: [].concat(scriptInclude) }).replace(/</g, "\\u003c"),
          }}
        />
        {props.children}
      </>
    );
  }
  return Children.map(props.children, (child) => {
    if (!React.isValidElement(child)) {
      throw new Error("cannot work with none-valid child");
    }
    // @ts-ignore
    let n = child.type.name || child.type.displayName;
    // handle MDX wrappers
    if (child.props.mdxType && child.props.originalType) {
      n = child.props.originalType.name || child.props.originalType.displayName;
    }
    if (!n) {
      throw new Error("cannot infer name, please use displayName on the exported component");
    }
    const { children, mdxType, originalType, ...rest } = child.props;
    let asString = "";
    try {
      asString = JSON.stringify(rest);
    } catch (e) {
      throw new Error("could not serialise props");
    }
    return (
      <>
        <script
          type={"text/json"}
          dangerouslySetInnerHTML={{
            __html: asString.replace(/</g, "\\u003c"),
          }}
          data-modfed-data
        />
        <div data-modfed-kind={kind} data-modfed-component={kind === "preact" && n}>
          {props.children}
        </div>
      </>
    );
  }) as any;
}
