import { css } from "lit";
import { sizes } from "~/web-components/algo/common-animations";

export const layout = css`
  .row {
    display: flex;
    align-items: center;
    position: relative;
  }
  .gap {
    margin-top: 20px;
  }
  .preview {
    line-height: 20px;
    font-size: 0.8em;
    font-family: monospace;
  }
  .row-height {
    display: block;
    height: ${sizes.CELL * 1.5}px;
    position: relative;
  }
  .prefix {
    line-height: 20px;
    font-size: 0.8em;
    font-family: monospace;
  }
  .legend {
    margin: 0;
    padding: 0;
  }
  .legend li {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: baseline;
  }
  .legend li algo-pointer {
    position: relative;
    top: 4px;
    margin-right: 10px;
  }
`;
