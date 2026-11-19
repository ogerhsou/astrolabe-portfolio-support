(() => {
  if (new URLSearchParams(location.search).get('utm_source') !== 'youtube') return;

  // Keep the channel on links between marketing pages, without storage or tracking requests.
  const siteRoot = new URL('../', document.currentScript.src);
  const marketingPaths = new Set([
    '',
    'index.html',
    'guides/manual-portfolio-tracker.html',
    'guides/trades-and-cash.html',
    'tools/portfolio-cash-calculator.html',
  ].map(path => new URL(path, siteRoot).pathname));

  for (const link of document.links) {
    if (link.getAttribute('href').startsWith('#')) continue;

    const destination = new URL(link.href);
    if (destination.origin === 'https://apps.apple.com' &&
        destination.pathname === '/app/apple-store/id6772176503') {
      destination.searchParams.set('ct', 'US_YouTube_202611');
    } else if (destination.origin === siteRoot.origin && marketingPaths.has(destination.pathname)) {
      destination.searchParams.set('utm_source', 'youtube');
    } else {
      continue;
    }

    link.href = destination.href;
  }
})();
