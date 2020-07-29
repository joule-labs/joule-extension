import { Tooltip as AntdTooltip } from 'antd';

// Overrides antd tooltip to fix buggy arrow
export default class Tooltip extends AntdTooltip {
  onPopupAlign = (popup: HTMLElement, align: any) => {
    const placements = this.getPlacements();
    // Get the current placement
    const placement = Object.keys(placements).filter(
      key =>
        placements[key].points[0] === align.points[0] &&
        placements[key].points[1] === align.points[1],
    )[0];
    if (!placement) {
      return;
    }

    const target = (this as any).tooltip.trigger.getRootDomNode();
    const arrow: HTMLDivElement | null = popup.querySelector('.ant-tooltip-arrow');
    if (!arrow) return;

    // Get the rect of the target element.
    const rect = target.getBoundingClientRect();

    // Only the top/bottom/left/right placements should be handled
    if (/^(top|bottom)$/.test(placement)) {
      const { left, width } = rect;
      const arrowOffset = left + width / 2 - popup.offsetLeft;
      arrow.style.left = `${arrowOffset}px`;
    } else if (/^(left|right)$/.test(placement)) {
      const { top, height } = rect;
      const arrowOffset = top + height / 2 - popup.offsetTop;
      arrow.style.top = `${arrowOffset}px`;
    }
  };
}
