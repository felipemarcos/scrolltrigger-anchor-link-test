addEventListener("DOMContentLoaded", () => {
  ScrollTrigger.create({
    trigger: ".container",
    pin: ".sticky",
    start: "top top",
    end : "bottom-=15 top+=250px",
    endTrigger: ".container",
    toggleClass: "is-sticky",
    pinSpacing: false,
    onUpdate: (self) => {
      if (self.getVelocity() === 0) return;
      this.element.classList.add(this.animatingClass);

      if (delayedCall) delayedCall.kill();
      delayedCall = gsap.delayedCall(0.3, () => {
        this.element.classList.remove(this.animatingClass);
      });
    },
  });
});