export const reviewRecord = Object.freeze({
  name: "Promo landing pg",
  breadcrumb: "Celebrity > Ship X > Experiences > Top Chef Promo > Landing Page",
  uiKit: "AWD Design System 2",
  repo: "/portfolio-clean",
  build: "xxxxxxxxxxxx",
  reviewState: "In review",
  image: new URL("./assets/artifact-1.jpeg", import.meta.url).href,
  callouts: Object.freeze([
    Object.freeze({
      id: "hero-subject", number: "1", tone: "positive", x: 82.2, y: 17.2,
      author: "AW", timestamp: "8/6/26 @ 3:30 pm",
      message: "The hero crop and subject placement are approved for review.",
      replies: Object.freeze([
        Object.freeze({ author: "MM", timestamp: "8/6/26 @ 3:44 pm", message: "Confirmed against the current desktop art direction." }),
        Object.freeze({ author: "AW", timestamp: "8/6/26 @ 4:02 pm", message: "Keeping this anchor with the current build." }),
      ]),
    }),
    Object.freeze({
      id: "headline-copy", number: "2", tone: "focus", x: 39.6, y: 28.5,
      author: "AW", timestamp: "8/6/26 @ 3:30 pm",
      message: "Review the headline wrap at the current design width.",
      replies: Object.freeze([
        Object.freeze({ author: "JL", timestamp: "8/6/26 @ 4:18 pm", message: "Copy review is still in progress." }),
      ]),
    }),
  ]),
  history: Object.freeze([
    Object.freeze({ time: "Today, 9:42 am", title: "Review opened", detail: "Build xxxxxxxxxxxx moved to In review." }),
    Object.freeze({ time: "Yesterday, 4:18 pm", title: "Callout 2 updated", detail: "A reply was added to the headline review." }),
    Object.freeze({ time: "Aug 6, 3:30 pm", title: "Callouts created", detail: "Two anchored review notes were added." }),
  ]),
});
