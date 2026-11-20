(() => {
  const query = new URLSearchParams(location.search);
  if (query.get('utm_source') !== 'youtube') return;

  const root = new URL('../', document.currentScript.src);
  const pages = [
    '', 'index.html', 'guides/manual-portfolio-tracker.html',
    'guides/trades-and-cash.html', 'tools/portfolio-cash-calculator.html',
    'guides/sgx-us-stocks-in-sgd.html', 'guides/hong-kong-portfolio.html',
  ];
  const sitePaths = new Set(pages.map(path => new URL(path, root).pathname));
  const campaigns = {
    'sg-ledger': 'SG_YouTube_Ledger_202611',
    'hk-ledger': 'HK_YouTube_Ledger_202611',
    'trade-edit': 'US_YouTube_TradeEdit_202611',
  };
  const landingCampaign = document.documentElement.lang === 'en-SG' ? 'sg-ledger' :
    document.documentElement.lang === 'zh-Hant-HK' ? 'hk-ledger' : '';
  const incoming = query.get('utm_campaign');
  const campaign = Object.hasOwn(campaigns, incoming) ? incoming : landingCampaign;

  // Carry the original tutorial along this visit, without storing anything on the device.
  for (const link of document.links) {
    if (link.getAttribute('href').startsWith('#')) continue;
    const destination = new URL(link.href);
    if (destination.origin === 'https://apps.apple.com' &&
        destination.pathname === '/app/apple-store/id6772176503') {
      destination.searchParams.set('ct', campaigns[campaign] || 'US_YouTube_202611');
      if (campaign === 'sg-ledger' || campaign === 'hk-ledger') {
        destination.searchParams.delete('ppid');
      }
    } else if (destination.origin === root.origin && sitePaths.has(destination.pathname)) {
      destination.searchParams.set('utm_source', 'youtube');
      if (campaign) destination.searchParams.set('utm_campaign', campaign);
    } else {
      continue;
    }
    link.href = destination.href;
  }
})();
