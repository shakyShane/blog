export function RuntimeScriptInclude(props: { html: string }) {
  if (!process.env.BOOTSTRAP) {
    return <div dangerouslySetInnerHTML={{ __html: `<!-- missing bootstrap -->` }} />;
  }

  if (!props.html.includes("data-modfed-kind")) {
    return <div dangerouslySetInnerHTML={{ __html: `<!-- no JS components found -->` }} />;
  }
  const runtimes = [];
  if (props.html.includes(`data-modfed-kind="vanilla"`)) {
    runtimes.push("vanilla");
  }
  if (props.html.includes(`data-modfed-kind="preact"`)) {
    runtimes.push("preact");
  }
  const json = { runtimes };
  return (
    <>
      <script
        type={"text/json"}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }}
        id="bootstrap"
      />
      {process.env.NODE_ENV === "development" && <script src={`http://localhost:8080/webpack/bootstrap.js`} />}
      {process.env.NODE_ENV === "production" && <script src={`/_next/static/chunks/modfed/${process.env.BOOTSTRAP}`} />}
    </>
  );
}
