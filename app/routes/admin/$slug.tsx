import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { getRawPost, RawPost, updatePost } from "~/post";

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getRawPost(params.slug);
};

export const action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: Record<string, boolean> = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  await updatePost({ title, slug, markdown });

  return redirect("/admin");
};

export default function EditPost() {
  const errors = useActionData();
  const transition = useTransition();
  const post = useLoaderData<RawPost>();

  return (
    <Form method="post" key={post.slug}>
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}
          {/* readonly は手抜き */}
          <input type="text" name="slug" value={post.slug} readOnly />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown</label>{" "}
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea rows={20} name="markdown" defaultValue={post.markdown} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Updating..." : "Update Post"}
        </button>
      </p>
    </Form>
  );
}
