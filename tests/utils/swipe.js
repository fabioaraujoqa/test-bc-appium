export async function swipeNTimes({ element, direction = 'left', times = 1, duration = 800, percent = 0.5 }) {
  for (let i = 0; i < times; i++) {
    await browser.swipe({
      direction,
      duration,
      percent,
      scrollableElement: element,
    });
    await browser.pause(300);
  }
}
