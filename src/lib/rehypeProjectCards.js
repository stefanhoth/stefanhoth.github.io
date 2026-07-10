// Rehype plugin for `template: projects` pages: wraps every h2 and the
// content up to the next h2 into <section class="project-card">, so the
// page can style each project as a card. Content before the first h2
// (the intro) is left untouched; pages with any other template pass
// through unchanged.
//
// Inside a card the plugin also builds the presentation structure the
// styles in src/pages/[slug].astro rely on:
// - a header row with an icon tile: the project's leading emoji if the
//   title starts with one (it is moved out of the title), otherwise a
//   monogram of the first letter, tinted with a hue derived from the
//   title so each project gets a stable, distinct color
// - a paragraph holding nothing but an *emphasized* line directly after
//   the title becomes a row of chips, split on "·"

const text = (value) => ({ type: "text", value });

const el = (tagName, properties, children) => ({
  type: "element",
  tagName,
  properties,
  children,
});

function textContent(node) {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textContent).join("");
}

// Stable 0-359 hue from the project title, so colors survive rebuilds
// but differ between projects.
function hueFor(name) {
  let hue = 0;
  for (const char of name) {
    hue = (hue * 31 + char.codePointAt(0)) % 360;
  }
  return hue;
}

const LEADING_EMOJI = /^(\p{Extended_Pictographic}️?)\s*/u;

// Removes a leading emoji from the first non-empty text node under the
// h2 (typically inside its link) and returns it, or null if none.
function extractLeadingEmoji(h2) {
  const queue = [h2];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node.type === "text" && node.value.trim() !== "") {
      const match = node.value.match(LEADING_EMOJI);
      if (!match) return null;
      node.value = node.value.slice(match[0].length);
      return match[1];
    }
    queue.unshift(...(node.children ?? []));
  }
  return null;
}

function iconTile(h2) {
  const emoji = extractLeadingEmoji(h2);
  const title = textContent(h2).trim();
  return el("span", { className: ["project-icon"], ariaHidden: "true" }, [
    text(emoji ?? (title[0] ?? "?").toUpperCase()),
  ]);
}

// A paragraph whose only element child is a single <em> right after the
// title is the card's meta line; its "·"-separated parts become chips.
function isMetaParagraph(node) {
  if (node?.type !== "element" || node.tagName !== "p") return false;
  const children = node.children.filter(
    (child) => child.type !== "text" || child.value.trim() !== "",
  );
  return children.length === 1 && children[0].tagName === "em";
}

function toChips(paragraph) {
  const em = paragraph.children.find((child) => child.tagName === "em");
  paragraph.properties.className = ["project-meta"];
  paragraph.children = textContent(em)
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => el("span", { className: ["chip"] }, [text(part)]));
}

function buildCard(h2) {
  const icon = iconTile(h2);
  const title = textContent(h2).trim();
  const header = el("div", { className: ["project-card-header"] }, [icon, h2]);
  return el(
    "section",
    { className: ["project-card"], style: `--project-hue: ${hueFor(title)}` },
    [header],
  );
}

export default function rehypeProjectCards() {
  return (tree, file) => {
    if (file.data.astro?.frontmatter?.template !== "projects") return;

    const wrapped = [];
    let card = null;
    // Only the first block after the title can be the meta line;
    // whitespace-only text nodes between blocks don't close the slot.
    let metaSlotOpen = false;

    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "h2") {
        card = buildCard(node);
        metaSlotOpen = true;
        wrapped.push(card);
      } else if (card) {
        if (node.type === "element") {
          if (metaSlotOpen && isMetaParagraph(node)) {
            toChips(node);
          }
          metaSlotOpen = false;
        }
        card.children.push(node);
      } else {
        wrapped.push(node);
      }
    }

    tree.children = wrapped;
  };
}
