/* Retire the legacy prototype's inline minimum-line-height adjustment.
   The shared stylesheet now owns line heights; original scripts stay intact. */
(() => {
  const root = document.getElementById('keysUnifiedPrototype');
  if (!root) return;
  const legacyValues = new Set(['15px', '16px', '18px', '21px']);
  const clean = node => {
    if (node.nodeType !== 1 || !node.isConnected) return;
    [node, ...node.querySelectorAll('[style]')].forEach(element => {
      if (element.closest('svg')) return;
      if (element.style.getPropertyPriority('line-height') === 'important' &&
          legacyValues.has(element.style.getPropertyValue('line-height'))) {
        element.style.removeProperty('line-height');
      }
    });
  };
  const pending = new Set();
  let scheduled = false;
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => pending.add(node)));
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      pending.forEach(clean);
      pending.clear();
    });
  }).observe(root, {childList: true, subtree: true});
  clean(root);
})();
