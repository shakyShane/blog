import { ReactiveController, ReactiveControllerHost } from "lit";
import { TimelineLite } from "gsap/all";
import { times } from "~/web-components/algo/common-animations";

export class TimelineController implements ReactiveController {
  host: ReactiveControllerHost;
  timeline: TimelineLite;

  constructor(host: ReactiveControllerHost, timeout = 1000) {
    (this.host = host).addController(this);
    this.timeline = new TimelineLite({
      defaults: { duration: times.DURATION * 1.5 },
      onComplete: function () {
        setTimeout(() => {
          this.restart();
        }, timeout);
      },
    });
  }
  hostDisconnected() {
    this.timeline.clear();
  }
}
