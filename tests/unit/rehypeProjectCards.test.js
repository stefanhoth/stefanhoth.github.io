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

const projectTree = () => ({
  type: "root",
  children: [
    el("h1", text("Projects")),
    el("p", text("Intro paragraph")),
    el("h2", el("a", text("First project"))),
    el("p", text("First description")),
    el("h2", text("Second project")),
    el("p", text("Second description")),
  ],
});

describe("rehypeProjectCards", () => {
  it("wraps each h2 and its following content into a project-card section", () => {
    const tree = run(projectTree(), "projects");

    const [h1, intro, cardA, cardB] = tree.children;
    expect(h1.tagName).toBe("h1");
    expect(intro.tagName).toBe("p");

    expect(cardA.tagName).toBe("section");
    expect(cardA.properties.className).toEqual(["project-card"]);
    expect(cardA.children.map((c) => c.tagName)).toEqual(["div", "p"]);

    expect(cardB.tagName).toBe("section");
  });

  it("builds a header row with the h2 and a monogram icon tile", () => {
    const tree = run(projectTree(), "projects");
    const header = tree.children[2].children[0];

    expect(header.properties.className).toEqual(["project-card-header"]);
    const [icon, h2] = header.children;
    expect(icon.properties.className).toEqual(["project-icon"]);
    expect(icon.properties.ariaHidden).toBe("true");
    expect(icon.children[0].value).toBe("F");
    expect(h2.tagName).toBe("h2");
  });

  it("assigns each card a stable hue derived from its title", () => {
    const treeA = run(projectTree(), "projects");
    const treeB = run(projectTree(), "projects");

    const styleOf = (tree, i) => tree.children[i].properties.style;
    expect(styleOf(treeA, 2)).toMatch(/^--project-hue: \d+$/);
    expect(styleOf(treeA, 2)).toBe(styleOf(treeB, 2));
    expect(styleOf(treeA, 2)).not.toBe(styleOf(treeA, 3));
  });

  it("moves a leading emoji from the title into the icon tile", () => {
    const tree = {
      type: "root",
      children: [
        el("h2", el("a", text("🔦 STARlog"))),
        el("p", text("Description")),
      ],
    };

    run(tree, "projects");

    const [icon, h2] = tree.children[0].children[0].children;
    expect(icon.children[0].value).toBe("🔦");
    expect(h2.children[0].children[0].value).toBe("STARlog");
  });

  it("turns an em-only paragraph after the title into meta chips", () => {
    // Includes the newline text nodes the real pipeline emits between blocks.
    const tree = {
      type: "root",
      children: [
        el("h2", text("Project")),
        text("\n"),
        el("p", el("em", text("TypeScript · Gemini · browser-only"))),
        text("\n"),
        el("p", text("Description")),
      ],
    };

    run(tree, "projects");

    const [, , meta, , description] = tree.children[0].children;
    expect(meta.properties.className).toEqual(["project-meta"]);
    expect(meta.children.map((chip) => chip.children[0].value)).toEqual([
      "TypeScript",
      "Gemini",
      "browser-only",
    ]);
    expect(meta.children[0].properties.className).toEqual(["chip"]);
    expect(description.properties.className).toBeUndefined();
  });

  it("does not treat a later em-only paragraph as the meta line", () => {
    const tree = {
      type: "root",
      children: [
        el("h2", text("Project")),
        el("p", text("Description")),
        el("p", el("em", text("just an emphasized sentence"))),
      ],
    };

    run(tree, "projects");

    const [, , later] = tree.children[0].children;
    expect(later.properties.className).toBeUndefined();
  });

  it("leaves pages with other templates untouched", () => {
    const children = [el("h2", text("Heading")), el("p", text("Body"))];
    const tree = { type: "root", children: [...children] };

    run(tree, "sidebar");

    expect(tree.children).toEqual(children);
  });
});
