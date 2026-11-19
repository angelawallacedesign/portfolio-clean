let owner = null;

export function createScrollLock() {
  let saved = null;
  return {
    get locked() { return saved !== null; },
    lock() {
      if (saved) return;
      if (owner || document.documentElement.style.overflow === "hidden" || document.body.style.overflow === "hidden") {
        throw new Error("Document scrolling is already locked by another overlay.");
      }
      const html = document.documentElement;
      const body = document.body;
      saved = {
        x: window.scrollX, y: window.scrollY,
        htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position, bodyTop: body.style.top,
        bodyLeft: body.style.left, bodyRight: body.style.right,
        bodyWidth: body.style.width
      };
      owner = this;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${saved.y}px`;
      body.style.left = `-${saved.x}px`;
      body.style.right = "0";
      body.style.width = "100%";
    },
    unlock() {
      if (!saved) return;
      const state = saved;
      saved = null;
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = state.htmlOverflow;
      body.style.overflow = state.bodyOverflow;
      body.style.position = state.bodyPosition;
      body.style.top = state.bodyTop;
      body.style.left = state.bodyLeft;
      body.style.right = state.bodyRight;
      body.style.width = state.bodyWidth;
      owner = null;
      window.scrollTo(state.x, state.y);
    }
  };
}
