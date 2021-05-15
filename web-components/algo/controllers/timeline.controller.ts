import { ReactiveController, ReactiveControllerHost } from "lit";
import { TimelineLite } from "gsap/all";
import { times } from "~/web-components/algo/common-animations";

interface TimelineOptions {
  loop?: boolean,
  duration?: number
}

export class TimelineController implements ReactiveController {
  host: ReactiveControllerHost;
  timeline: TimelineLite;

  constructor(host: ReactiveControllerHost, options?: TimelineOptions) {
    (this.host = host).addController(this);
    const loop = options?.loop ?? true;
    this.timeline = new TimelineLite({
      defaults: { duration: options.duration ?? times.DURATION * 1.5 },
      onComplete: function () {
        if (loop) {
          this.restart();
        }
      },
    });
  }
  hostUpdated() {
    console.log("host updated");
  }

  hostDisconnected() {
    this.timeline.clear();
  }
}
