// Rehype plugin for `template: projects` pages: wraps every h2 and the
// content up to the next h2 into <section class="project-card">, so the
// page can style each project as a card without imposing any new syntax
// on the vault markdown. Content before the first h2 (the intro) is left
// untouched. Pages with any other template pass through unchanged.
export default function rehypeProjectCards() {
  return (tree, file) => {
    if (file.data.astro?.frontmatter?.template !== "projects") return;

    const wrapped = [];
    let card = null;

    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "h2") {
        card = {
          type: "element",
          tagName: "section",
          properties: { className: ["project-card"] },
          children: [node],
        };
        wrapped.push(card);
      } else if (card) {
        card.children.push(node);
      } else {
        wrapped.push(node);
      }
    }

    tree.children = wrapped;
  };
}
