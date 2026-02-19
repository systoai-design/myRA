// GHL Chat Widget configuration and utilities
const WIDGET_ID = "69584d089b31e93877c9c8f6";
const LOADER_URL = "https://widgets.leadconnectorhq.com/loader.js";
const RESOURCES_URL = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";

// Extend window type for GHL APIs
declare global {
  interface Window {
    openGHLChat?: () => void;
    leadConnector?: {
      chatWidget?: {
        open?: () => void;
      };
    };
    LC_API?: {
      open_chat_window?: () => void;
    };
  }
}

export function ensureGhlScript(): void {
  const existingScript = document.querySelector(`script[src="${LOADER_URL}"]`);
  
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = LOADER_URL;
    script.setAttribute("data-resources-url", RESOURCES_URL);
    script.setAttribute("data-widget-id", WIDGET_ID);
    script.async = true;
    document.body.appendChild(script);
  }
}

export function openGhlChat(): void {
  // If the chat is embedded inside our helper iframe, ask that iframe to open it.
  const embedIframe = document.querySelector<HTMLIFrameElement>(
    'iframe[src="/pura-chat-embed.html"], iframe[src="pura-chat-embed.html"]'
  );

  if (embedIframe?.contentWindow) {
    console.debug("GHL: Requesting open via embedded iframe");
    embedIframe.contentWindow.postMessage({ type: "PURA_CHAT_OPEN" }, "*");
    return;
  }

  // Try leadConnector API first (most reliable)
  if (window.leadConnector?.chatWidget?.open) {
    console.debug("GHL: Opening via leadConnector API");
    window.leadConnector.chatWidget.open();
    return;
  }

  // Try LC_API
  if (window.LC_API?.open_chat_window) {
    console.debug("GHL: Opening via LC_API");
    window.LC_API.open_chat_window();
    return;
  }

  // Fallback: try clicking known widget elements
  const selectors = [
    `[data-widget-id="${WIDGET_ID}"]`,
    '.lc-chat-widget-button',
    '[class*="chat-widget"] button',
    '[class*="lc_text-widget"]',
    '.lc_text-widget-open',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement;
    if (el) {
      console.debug(`GHL: Opening via fallback click on ${selector}`);
      el.click();
      return;
    }
  }

  // If nothing worked, retry after a short delay (widget may still be loading)
  console.debug("GHL: Widget not ready, retrying...");
  setTimeout(() => {
    if (window.leadConnector?.chatWidget?.open) {
      window.leadConnector.chatWidget.open();
    } else if (window.LC_API?.open_chat_window) {
      window.LC_API.open_chat_window();
    }
  }, 500);
}
