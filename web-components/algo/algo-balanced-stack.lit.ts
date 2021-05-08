import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { html, LitElement } from "lit";
import invariant from "tiny-invariant";
import Stack from "./algo-stack.lit";
import { Result } from "./algo-result.lit";
import { init } from "./balanced_stack";
import { PointerRow } from "./algo-pointer-row.lit";
import { times } from "./common-animations";
import { layout } from "./common-styles.lit";
import { TimelineLite } from "gsap/gsap-core";
import { CSSPlugin } from "gsap/CSSPlugin";

const plugins = [CSSPlugin];

@customElement("algo-balanced-stack")
export class BalancedStack extends LitElement {
  static styles = [layout];

  pointerRowRef = createRef<PointerRow>();
  inputRef = createRef<Stack>();
  stackRef = createRef<Stack>();
  resultRef = createRef<Result>();

  @property({ type: String })
  input: string = "";

  @state()
  timeline = new TimelineLite({
    defaults: { duration: times.DURATION * 1.5 },
    onComplete: function () {
      setTimeout(() => {
        this.restart();
      }, 1000);
    },
  });

  firstUpdated() {
    invariant(this.pointerRowRef.value, "this.pointerRowRef.value");
    invariant(this.inputRef.value, "this.inputRef.value");
    invariant(this.stackRef.value, "this.stackRef.value");
    invariant(this.resultRef.value, "this.resultRef.value");
    init(
      this.input,
      {
        INPUT: this.inputRef.value,
        POINTER_ROW: this.pointerRowRef.value,
        RESULT: this.resultRef.value,
        STACK: this.stackRef.value,
      },
      this.timeline
    );
  }

  pause = () => this.timeline.pause();
  play = () => this.timeline.play();
  restart = () => this.timeline.restart();

  /**
   * Output of this component
   */
  render() {
    return html`
      <algo-controls .pause=${this.pause} .play=${this.play} .restart=${this.restart}></algo-controls>
      <div class="row">
        <div>
          <p class="prefix">Input:</p>
          <div class="row-height">
            <algo-pointer-row ${ref(this.pointerRowRef)}></algo-pointer-row>
          </div>
          <algo-stack ${ref(this.inputRef)}></algo-stack>
        </div>
      </div>
      <div class="row gap">
        <div>
          <p class="prefix">Stack:</p>
          <algo-stack ${ref(this.stackRef)} layout="absolute"></algo-stack>
        </div>
      </div>
      <div class="row gap">
        <algo-result ${ref(this.resultRef)}></algo-result>
      </div>
    `;
  }
}

export const name = "BalancedStack";
