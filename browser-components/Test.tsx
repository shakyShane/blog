import React, { useState } from "react";

export function Test() {
    const vars = "stroke-current fill-current";
    const [offset, setOffset] = useState("none");

    return (
        <div>
            <p>
                <button type="button" onClick={() => setOffset("none-anim")}>
                    Click
                </button>
            </p>
            <svg viewBox="0 0 24 24" style={{ border: "1px solid red" }} height="100" width="100" className={vars}>
                <line x1="2" y1="4.2" x2="22" y2="4.2" />
                <line x1="2" y1="8" x2="22" y2="8" />
                <line x1="2" y1="8" x2="22" y2="8" className={offset} />
            </svg>
        </div>
    );
}
