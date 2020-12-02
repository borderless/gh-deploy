import { request } from "@octokit/request";
import simpleGit, { SimpleGit } from "simple-git";
import gh from "parse-github-url";

export interface Options {
  ref?: string;
  cwd?: string;
  token?: string;
  task?: string;
  autoMerge?: boolean;
  payload?: string;
  environment?: string;
  description?: string;
  contexts?: string[];
  transient?: boolean;
  production?: boolean;
}

/**
 * Create a GitHub deployment.
 */
export async function deploy(options: Options) {
  const cwd = options.cwd || process.cwd();
  const {
    autoMerge = true,
    contexts,
    description,
    environment,
    payload,
    production,
    task,
    token = process.env.GITHUB_TOKEN,
    transient,
  } = options;

  if (!token) throw new TypeError("GitHub token is missing");
  if (!environment) throw new TypeError("Deployment environment is missing");

  const git: SimpleGit = simpleGit(cwd);

  const url = await git.remote(["get-url", "origin"]);
  if (!url) throw new TypeError(`Git repo is missing remote URL: ${cwd}`);

  const ghUrl = gh(url);
  if (!ghUrl) throw new TypeError(`Git remote URL is not using GitHub: ${url}`);

  const { owner, name: repo } = ghUrl;

  const ref = options.ref || (await git.revparse(["HEAD"]));

  await request({
    method: "POST",
    url: `/repos/${owner}/${repo}/deployments`,
    headers: {
      accept: "application/vnd.github.ant-man-preview+json",
      authorization: `token ${token}`,
    },
    data: {
      ref,
      task,
      auto_merge: autoMerge,
      payload,
      environment,
      description,
      required_contexts: contexts,
      transient_environment: transient,
      production_environment: production,
    },
  });

  return { environment, owner, repo };
}
