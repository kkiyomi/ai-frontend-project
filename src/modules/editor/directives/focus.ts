// directives/focus.ts
export default {
  mounted(el: HTMLTextAreaElement, binding: any) {
    if (binding.value) {
      el.focus();
      moveCursorToEnd(el);
    }
  },
  updated(el: HTMLTextAreaElement, binding: any) {
    if (binding.value && !binding.oldValue) {
      el.focus();
      moveCursorToEnd(el);
    }
  }
};

function moveCursorToEnd(el: HTMLTextAreaElement) {
  const len = el.value.length;
  el.setSelectionRange(len, len);
}
