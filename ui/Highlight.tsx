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
            <code className="absolute top-2 right-2 text-sm text-gray-600">{props.lang}</code>
            <Pre>
                <CodeInPre src={highlighted.value} />
            </Pre>
        </div>
    );
}
