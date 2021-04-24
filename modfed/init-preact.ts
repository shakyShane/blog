import React from "react";
import ReactDOM from "react-dom";
const items = document.querySelectorAll(`[data-modfed-kind="preact"]`);

items.forEach((item: HTMLDivElement) => {
    hydrate(item);
});

export function hydrate(item: HTMLElement) {
    const { modfedComponent } = item.dataset;

    if (!modfedComponent) {
        console.log("ere");
        throw new Error("Missing Component name. ");
    }

    const data = item.parentElement?.querySelector(`[data-modfed-data="${item.id}"]`);
    const parsed = JSON.parse(data?.textContent ?? "null");

    return import(`../browser-components/${modfedComponent}`).then((mod) => {
        let exported = mod.default;
        if (!exported) {
            console.log("'default' export absent");
            exported = mod[modfedComponent];
        }
        if (!exported) {
            throw new Error(`"default" & "named" export missing in module ${modfedComponent}`);
        }
        console.log("ReactDOM.hydrate", modfedComponent);
        ReactDOM.hydrate(React.createElement(exported, parsed), item);
    });
}
