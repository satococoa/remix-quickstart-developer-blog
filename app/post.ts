import { processMarkdown } from "@ryanflorence/md";
import parseFrontMatter from "front-matter";
import fs from "fs/promises";
import path from "path";
import invariant from "tiny-invariant";

export type Post = {
  slug: string;
  title: string;
  html: string;
};

export type PostMarkdownAttributes = {
  title: string;
};

const postsPath = path.join(__dirname, "../posts");

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title;
}

export async function getPosts() {
  const dir = await fs.readdir(postsPath);
  return Promise.all(
    dir.map(async (file) => {
      const filePath = path.join(postsPath, file);
      const fileContents = await fs.readFile(filePath, "utf8");
      const { attributes, body } = parseFrontMatter(fileContents);
      invariant(
        isValidPostAttributes(attributes),
        `${file} has bad meta data!`
      );
      return {
        slug: file.replace(/\.md$/, ""),
        title: attributes.title,
        body,
      };
    })
  );
}

export async function getPost(slug: string) {
  const filePath = path.join(postsPath, `${slug}.md`);
  const fileContents = await fs.readFile(filePath, "utf8");
  const { attributes, body } = parseFrontMatter(fileContents);
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filePath} is missing attributes`
  );
  const html = await processMarkdown(body);
  return { slug, html, title: attributes.title };
}

export type RawPost = {
  title: string;
  slug: string;
  markdown: string;
};

export async function createPost(post: RawPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, `${post.slug}.md`), md);
  return getPost(post.slug);
}

export async function getRawPost(slug: string) {
  const filePath = path.join(postsPath, `${slug}.md`);
  const fileContents = await fs.readFile(filePath, "utf8");
  const { attributes, body: markdown } = parseFrontMatter(fileContents);
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filePath} is missing attributes`
  );

  return { slug, title: attributes.title, markdown };
}

export async function updatePost(post: RawPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, `${post.slug}.md`), md);
  return getPost(post.slug);
}
