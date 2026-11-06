    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light only';
    // Do not paint the preserved baseline before the current design and scenario mount.
    document.documentElement.dataset.keysBoot = 'loading';
    const revealPrototype = () => { delete document.documentElement.dataset.keysBoot; };
    const bootFallback = setTimeout(revealPrototype, 15000);
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        clearTimeout(bootFallback);
        revealPrototype();
      }));
    }, { once: true });
