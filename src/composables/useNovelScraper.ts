import { Ref, reactive, computed } from "vue";
import type { ScrapingOptions, ScrapingState } from "../types/scraper";

export const useNovelScraper = () => {
  const state = reactive<ScrapingState>({
    isLoading: false,
    result: null,
    error: null,
  });

  // Default options for common novel sites
  const defaultOptions: ScrapingOptions = {
    titleSelector: "h1, .chapter-title, .title, .entry-title, .post-title",
    contentSelector:
      ".chapter-content, .entry-content, .content, .post-content, .story-text, main p, article p",
    removeSelectors: [
      ".ads",
      ".advertisement",
      ".nav",
      ".navigation",
      ".menu",
      ".sidebar",
      ".footer",
      ".header",
      ".comments",
      ".related-posts",
      ".share-buttons",
      ".tags",
      ".categories",
      ".author-info",
    ],
    timeout: 15000,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  };

  // Helper functions
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchWithTimeout = async (
    url: string,
    timeout: number,
    userAgent: string
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // For Vue 3 projects, you might need to use a CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url
      )}`;

      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": userAgent,
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Create a mock Response object for the HTML content
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => data.contents,
      } as Response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  };

  const parseHTML = (html: string): Document => {
    return new DOMParser().parseFromString(html, "text/html");
  };

  const extractTitle = (doc: Document, titleSelector: string): string => {
    const selectors = titleSelector.split(",").map((s) => s.trim());

    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }

    // Fallback to page title
    const pageTitle = doc.querySelector("title");
    return pageTitle?.textContent?.trim() || "Unknown Chapter";
  };

  const extractContent = (doc: Document, contentSelector: string): string => {
    const selectors = contentSelector.split(",").map((s) => s.trim());

    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        // If selecting paragraphs, join them
        if (selector.includes("p")) {
          const paragraphs = Array.from(elements)
            .map((el) => el.textContent?.trim())
            .filter((text) => text && text.length > 10);

          if (paragraphs.length > 0) {
            return paragraphs.join("\n\n");
          }
        } else {
          // For container elements, get the first one with substantial content
          for (const element of elements) {
            const text = element.textContent?.trim();
            if (text && text.length > 50) {
              return text;
            }
          }
        }
      }
    }

    return "";
  };

  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim()
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€\x9D/g, '"')
      .replace(/â€"/g, "—")
      .replace(/â€¦/g, "...");
  };

  // Main scraping function
  const scrapeChapter = async (
    url: string,
    options: Partial<ScrapingOptions> = {},
    // Vue reactive refs to update (optional for backward compatibility)
    vueRefs?: {
      scrapedContent?: Ref<string>;
      scrapedPreview?: Ref<string>;
      statusMessage?: Ref<string>;
      statusType?: Ref<string>;
    }
  ): Promise<void> => {
    const finalOptions = { ...defaultOptions, ...options };

    state.isLoading = true;
    state.error = null;
    state.result = null;

    try {
      // Validate URL
      if (!url || !isValidUrl(url)) {
        throw new Error("Invalid URL provided");
      }

      // Fetch the webpage
      const response = await fetchWithTimeout(
        url,
        finalOptions.timeout!,
        finalOptions.userAgent!
      );

      const html = await response.text();
      const doc = parseHTML(html);

      // Remove unwanted elements
      finalOptions.removeSelectors?.forEach((selector) => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      });

      // Extract title and content
      const title = extractTitle(doc, finalOptions.titleSelector!);
      const content = extractContent(doc, finalOptions.contentSelector!);

      if (!content.trim()) {
        throw new Error("No content found with the specified selectors");
      }

      // Process content
      const cleanContent = cleanText(content);
      const paragraphs = cleanContent
        .split("\n\n")
        .filter((p) => p.trim().length > 0);
      const wordCount = cleanContent
        .split("/s+")
        .filter((word) => word.length > 0).length;
      const preview =
        cleanContent.substring(0, 200) +
        (cleanContent.length > 200 ? "..." : "");

      // Update internal state
      state.result = {
        title,
        content: cleanContent,
        preview,
        paragraphCount: paragraphs.length,
        wordCount,
        success: true,
      };

      // Update external Vue refs if provided
      if (vueRefs) {
        if (vueRefs.scrapedContent) {
          vueRefs.scrapedContent.value = cleanContent;
        }
        if (vueRefs.scrapedPreview) {
          vueRefs.scrapedPreview.value = preview;
        }
        if (vueRefs.statusMessage) {
          vueRefs.statusMessage.value = `Successfully scraped ${paragraphs.length} paragraphs`;
        }
        if (vueRefs.statusType) {
          vueRefs.statusType.value = "success";
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      state.error = errorMessage;
      state.result = {
        title: "",
        content: "",
        preview: "",
        paragraphCount: 0,
        wordCount: 0,
        success: false,
        error: errorMessage,
      };

      // Update external Vue refs with error state if provided
      if (vueRefs) {
        if (vueRefs.scrapedContent) {
          vueRefs.scrapedContent.value = "";
        }
        if (vueRefs.scrapedPreview) {
          vueRefs.scrapedPreview.value = "";
        }
        if (vueRefs.statusMessage) {
          vueRefs.statusMessage.value = `Error: ${errorMessage}`;
        }
        if (vueRefs.statusType) {
          vueRefs.statusType.value = "error";
        }
      }
    } finally {
      state.isLoading = false;
    }
  };

  // Scrape with retry logic
  const scrapeWithRetry = async (
    url: string,
    options: Partial<ScrapingOptions> = {},
    maxRetries: number = 3,
    vueRefs?: {
      scrapedContent?: Ref<string>;
      scrapedPreview?: Ref<string>;
      statusMessage?: Ref<string>;
      statusType?: Ref<string>;
    }
  ): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await scrapeChapter(url, options, vueRefs);

      if (state.result?.success) {
        return;
      }

      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    // If we get here, all attempts failed
    const finalError = `Failed after ${maxRetries} attempts. Last error: ${state.error}`;
    state.error = finalError;

    // Update Vue refs with final error state
    if (vueRefs) {
      if (vueRefs.statusMessage) {
        vueRefs.statusMessage.value = finalError;
      }
      if (vueRefs.statusType) {
        vueRefs.statusType.value = "error";
      }
    }
  };

  // Computed properties
  const hasContent = computed(
    () => state.result?.success && state.result.content.length > 0
  );
  const statusMessage = computed(() => {
    if (state.isLoading) return "Scraping chapter...";
    if (state.error) return `Error: ${state.error}`;
    if (hasContent.value) {
      return `Successfully scraped ${state.result?.paragraphCount} paragraphs (${state.result?.wordCount} words)`;
    }
    return "Ready to scrape";
  });

  // Clear results
  const clearResults = () => {
    state.result = null;
    state.error = null;
  };

  return {
    // State
    isLoading: computed(() => state.isLoading),
    result: computed(() => state.result),
    error: computed(() => state.error),
    hasContent,
    statusMessage,

    // Methods
    scrapeChapter,
    scrapeWithRetry,
    clearResults,

    // Utils
    isValidUrl,
  };
};
