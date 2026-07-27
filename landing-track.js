(function () {
  const trackedFlag = "batchcutout_landing_tracked";
  const visitorStorageKey = "batchcutout_visitor_id";
  const sessionStorageKey = "batchcutout_session_id";
  const trackedCtaSelector = [
    ".landing-button",
    ".landing-secondary",
    ".landing-panel a",
    ".landing-nav a:not(.landing-logo)",
  ].join(",");
  const preservedCampaignParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
  ];

  function stableId(storage, key) {
    try {
      const existing = storage.getItem(key);
      if (existing) return existing;
      const next = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      storage.setItem(key, next);
      return next;
    } catch {
      return "";
    }
  }

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    return {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href.split("#")[0],
      language: document.documentElement.lang || "",
      referrer: document.referrer || "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || params.get("source") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      gclid: params.get("gclid") || "",
      gbraid: params.get("gbraid") || "",
      wbraid: params.get("wbraid") || "",
    };
  }

  function send(name, detail) {
    const payload = JSON.stringify({
      name,
      detail: {
        event_category: "seo",
        event_label: name,
        value: 0,
        ...attribution(),
        ...detail,
      },
      visitorId: stableId(localStorage, visitorStorageKey),
      sessionId: stableId(sessionStorage, sessionStorageKey),
    });

    try {
      if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
        if (sent) return;
      }
    } catch {
      // Measurement must not affect navigation.
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  function targetDetail(link) {
    const url = new URL(link.href, window.location.origin);
    const params = new URLSearchParams(url.search);
    let target = url.origin === window.location.origin ? "internal" : "external";
    if (url.pathname.startsWith("/pricing")) target = "pricing";
    if (url.hash === "#tool" || url.href.includes("#tool")) target = "tool";

    return {
      target,
      target_path: url.pathname,
      target_hash: url.hash,
      target_source: params.get("utm_source") || "",
      target_medium: params.get("utm_medium") || "",
      target_campaign: params.get("utm_campaign") || "",
      cta_campaign: link.dataset.batchcutoutCtaCampaign || "",
      checkout_plan: params.get("checkout_plan") || "",
    };
  }

  function preserveCampaignParams() {
    const sourceParams = new URLSearchParams(window.location.search);
    if (!preservedCampaignParams.some((key) => sourceParams.has(key))) return;

    document.querySelectorAll("a[href]").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      if (url.origin !== window.location.origin) return;

      const ctaCampaign = url.searchParams.get("utm_campaign") || "";
      if (ctaCampaign) link.dataset.batchcutoutCtaCampaign = ctaCampaign;

      let changed = false;
      preservedCampaignParams.forEach((key) => {
        if (sourceParams.has(key) && url.searchParams.get(key) !== sourceParams.get(key)) {
          url.searchParams.set(key, sourceParams.get(key));
          changed = true;
        }
      });

      if (changed) {
        link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
      }
    });
  }

  function markPageViewOnce() {
    try {
      const key = `${trackedFlag}:${window.location.pathname}`;
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
      return true;
    } catch {
      return true;
    }
  }

  function isPaidSearchVisit(params) {
    if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) return true;

    const source = (params.get("utm_source") || "").toLowerCase();
    const medium = (params.get("utm_medium") || "").toLowerCase();
    return ["google", "google_ads", "adwords"].includes(source)
      && ["cpc", "ppc", "paid", "paid_search"].includes(medium);
  }

  function redirectPaidSearchToTool() {
    const directToolTarget = document.body?.dataset?.paidDirectTool || "";
    const sourceParams = new URLSearchParams(window.location.search);
    if (!directToolTarget || !isPaidSearchVisit(sourceParams)) return false;

    const target = new URL(directToolTarget, window.location.origin);
    preservedCampaignParams.forEach((key) => {
      const value = sourceParams.get(key);
      if (value) target.searchParams.set(key, value);
    });

    send("paid_landing_tool_redirect", {
      landing_type: "paid_search",
      target: "tool",
      target_path: target.pathname,
      target_hash: target.hash,
      target_source: target.searchParams.get("utm_source") || "",
      target_medium: target.searchParams.get("utm_medium") || "",
      target_campaign: target.searchParams.get("utm_campaign") || "",
    });
    window.location.replace(target.toString());
    return true;
  }

  preserveCampaignParams();

  if (markPageViewOnce()) {
    send("seo_landing_view", { landing_type: "seo" });
  }

  if (redirectPaidSearchToTool()) return;

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.(trackedCtaSelector);
    if (!link || !link.href) return;
    send("seo_landing_cta_clicked", {
      landing_type: "seo",
      ...targetDetail(link),
      cta_text: link.textContent.replace(/\s+/g, " ").trim().slice(0, 120),
      cta_href: link.href,
    });
  });
})();
