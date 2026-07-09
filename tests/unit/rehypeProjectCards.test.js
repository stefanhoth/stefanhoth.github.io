import { describe, expect, it } from "vitest";
import rehypeProjectCards from "../../src/lib/rehypeProjectCards.js";

// Minimal hast helpers matching what the markdown pipeline produces.
const el = (tagName, ...children) => ({
  type: "element",
  tagName,
  properties: {},
  children,
});
const text = (value) => ({ type: "text", value });

const file = (template) => ({ data: { astro: { frontmatter: { template } } } });

const run = (tree, template) => {
  rehypeProjectCards()(tree, file(template));
  return tree;
};

describe("rehypeProjectCards", () => {
  it("wraps each h2 and its following content into a project-card section", () => {
    const tree = {
      type: "root",
      children: [
        el("h1", text("Projects")),
        el("p", text("Intro paragraph")),
        el("h2", text("First project")),
        el("p", text("First description")),
        el("h2", text("Second project")),
        el("p", text("Second description")),
      ],
    };

    run(tree, "projects");

    const [h1, intro, cardA, cardB] = tree.children;
    expect(h1.tagName).toBe("h1");
    expect(intro.tagName).toBe("p");

    expect(cardA.tagName).toBe("section");
    expect(cardA.properties.className).toEqual(["project-card"]);
    expect(cardA.children.map((c) => c.tagName)).toEqual(["h2", "p"]);

    expect(cardB.tagName).toBe("section");
    expect(cardB.children[0].children[0].value).toBe("Second project");
  });

  it("keeps whitespace/text nodes inside the surrounding card", () => {
    const tree = {
      type: "root",
      children: [
        el("h2", text("Only project")),
        text("\n"),
        el("p", text("Description")),
      ],
    };

    run(tree, "projects");

    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].children).toHaveLength(3);
  });

  it("leaves pages with other templates untouched", () => {
    const children = [el("h2", text("Heading")), el("p", text("Body"))];
    const tree = { type: "root", children: [...children] };

    run(tree, "sidebar");

    expect(tree.children).toEqual(children);
  });
});
