const items = document.querySelectorAll(`[data-modfed-kind="vanilla"]`);

items.forEach((item: HTMLScriptElement) => {
  hydrate(item);
});

function hydrate(item: HTMLScriptElement) {
  let parsed;
  try {
    parsed = JSON.parse(item.textContent ?? "null");
  } catch (e) {
    console.error("failed parsing vanilla js include");
    console.error(e);
    return;
  }
  if (!parsed || !parsed.scriptInclude) {
    console.warn("missing `scriptInclude` from vanilla js");
    return;
  }
  const promises = parsed.scriptInclude.map((elem: string) => {
    console.log(`loading vanilla JS ${item}`);
    return import(`../web-components/${elem}`);
  });

  Promise.all(promises).then((x) => {
    console.log(x);
  });
}

export {};
