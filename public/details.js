(() => {
  const fine = matchMedia('(pointer:fine)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const enabled = () => fine.matches && !reduce.matches && !document.documentElement.classList.contains('motion-paused');

  document.querySelectorAll('.button').forEach(button => {
    const first = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (first) {
      const label = document.createElement('span'); label.className = 'button-label';
      const word = document.createElement('span'); word.className = 'button-word';
      word.textContent = first.textContent.trim(); word.dataset.copy = word.textContent;
      // The animated duplicate is decorative; the link keeps its original accessible name.
      button.setAttribute('aria-label', word.textContent);
      label.setAttribute('aria-hidden', 'true'); label.append(word); first.replaceWith(label);
    }
    const icon = button.querySelector('.icon');
    if (icon) {
      const track = document.createElement('span'); track.className = 'button-icon'; track.setAttribute('aria-hidden', 'true');
      icon.replaceWith(track); track.append(icon);
      const copy = icon.cloneNode(true); copy.classList.add('icon-copy'); track.append(copy);
    }
    button.addEventListener('pointermove', event => {
      if (!enabled() || event.pointerType === 'touch') return;
      const r = button.getBoundingClientRect();
      const x = event.clientX-r.left, y = event.clientY-r.top;
      button.style.setProperty('--hover-x', `${x}px`);
      button.style.setProperty('--hover-y', `${y}px`);
      button.style.setProperty('--button-x', `${(x/r.width-.5)*6}px`);
      button.style.setProperty('--button-y', `${(y/r.height-.5)*5}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--button-x','0px'); button.style.setProperty('--button-y','0px');
    });
  });

  document.querySelectorAll('.areas-grid .area').forEach((area, index) => {
    const covers = ['catalogo-v2.jpg','su-misura-v2.jpg','hero-libro-v2.jpg'];
    area.style.setProperty('--area-cover', `url('/assets/${covers[index%3]}')`);
  });
})();
