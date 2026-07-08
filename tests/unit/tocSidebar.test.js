import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import TocSidebar from "../../src/components/TocSidebar.astro";

// Shape of Astro's build-time heading extraction (MarkdownHeading).
const heading = (depth, slug, text) => ({ depth, slug, text });

const renderSidebar = async (headings) => {
  const container = await AstroContainer.create();
  return container.renderToString(TocSidebar, { props: { headings } });
};

describe("TocSidebar", () => {
  it("renders an anchor link for every h2, skipping other depths", async () => {
    const html = await renderSidebar([
      heading(1, "manager-readme", "Manager README"),
      heading(2, "my-job", "My job"),
      heading(3, "a-subsection", "A subsection"),
      heading(2, "how-i-communicate", "How I communicate"),
    ]);

    expect(html).toContain('href="#my-job"');
    expect(html).toContain(">My job</a>");
    expect(html).toContain('href="#how-i-communicate"');
    expect(html).toContain(">How I communicate</a>");
    expect(html).not.toContain("#manager-readme");
    expect(html).not.toContain("#a-subsection");
  });

  it("keeps the h2s in document order", async () => {
    const html = await renderSidebar([
      heading(2, "first", "First"),
      heading(2, "second", "Second"),
    ]);

    expect(html.indexOf("#first")).toBeLessThan(html.indexOf("#second"));
  });

  it("renders nothing when there are no h2 headings", async () => {
    const html = await renderSidebar([heading(1, "title-only", "Title only")]);

    expect(html).not.toContain("<nav");
  });
});
