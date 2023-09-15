addEventListener("DOMContentLoaded", () => {
  ScrollTrigger.create({
    trigger: ".container",
    pin: ".sticky",
    start: "top top",
    end : "bottom-=15 top+=250px",
    endTrigger: ".container",
    toggleClass: "is-sticky",
    pinSpacing: false,
  });
});