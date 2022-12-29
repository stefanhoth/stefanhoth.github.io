import React, { Component, FunctionComponent, ReactNode } from "react";

export interface AboutProps {
  headline: string;
  anchor?: string;
  paragraphs?: string[];
}

const About: FunctionComponent<AboutProps> = ({
  headline = "*tap tap* Is this thing on?",
  anchor = "about",
  paragraphs = [
    "Stefan likes caramel popcorn.",
    "He's also good at eating Döner.",
  ],
}) => {

  anchor = anchor || "about"
  const content: ReactNode[] = [];

  paragraphs.forEach((element) => {
    content.push(<p>{element}</p>)
  });


  return (
    <>
      <h1 id={anchor}>{headline}</h1>
      {content}
    </>
  );
};

export default About;
