import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import About, { AboutProps } from "../src/section/About";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "About",
  component: About,
} as ComponentMeta<typeof About>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof About> = (args) => <About {...args} />;

export const Text = Template.bind({});

Text.args = {
  headline: "Testing this component",
  anchor: "testanchor",
  paragraphs: [
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore, saepe provident. Ab, iusto! Quibusdam voluptas aspernatur debitis reprehenderit ea recusandae, facere ipsam quod doloremque voluptate architecto nulla, hic quia? Ea.",
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore, saepe provident. Ab, iusto! Quibusdam voluptas aspernatur debitis reprehenderit ea recusandae, facere ipsam quod doloremque voluptate architecto nulla, hic quia? Ea.",
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore, saepe provident. Ab, iusto! Quibusdam voluptas aspernatur debitis reprehenderit ea recusandae, facere ipsam quod doloremque voluptate architecto nulla, hic quia? Ea.",
  ],
};
