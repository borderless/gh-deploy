#!/usr/bin/env node

import arg from "arg";
import ora from "ora";
import { deploy } from "./index";

const {
  "--context": contexts,
  "--cwd": cwd = process.cwd(),
  "--description": description,
  "--environment": environment,
  "--help": help,
  "--no-auto-merge": noAutoMerge,
  "--no-context": noContext,
  "--payload": payload,
  "--production": production,
  "--ref": ref,
  "--task": task,
  "--transient": transient,
} = arg({
  "--context": [String],
  "--cwd": String,
  "--description": String,
  "--environment": String,
  "--help": Boolean,
  "--no-auto-merge": Boolean,
  "--no-context": Boolean,
  "--payload": String,
  "--production": Boolean,
  "--ref": String,
  "--task": String,
  "--transient": Boolean,
  "-d": "--description",
  "-e": "--environment",
});

if (help) {
  process.stdout.write(`
  gh-deploy -e <environment>

Other options:

  --context <context>         GitHub contexts required to pass before deploying
  --cwd <path>                Deployment repository path (default: \`process.cwd()\`)
  --description <description> Description of the deployment (optional)
  --no-auto-merge             Disable auto-merge of default branch into current ref
  --no-context                Disable GitHub context checking entirely
  --payload <data>            JSON payload with extra information about the deployment
  --production                Specifies if the given environment is one that end-users directly interact with (default: \`true\` when environment is \`production\`)
  --ref <ref>                 The ref to deploy (default: \`HEAD\` commit)
  --task <task>               Specifies a task to execute (default: \`deploy\`)
  --transient                 Specifies if the given environment is specific to the deployment and will no longer exist at some point in the future
`);
  process.exit(0);
}

const spinner = ora({ spinner: "dots" });

spinner.start("Deploying...");

deploy({
  autoMerge: !noAutoMerge,
  contexts: noContext ? [] : contexts,
  cwd,
  description,
  environment,
  payload,
  production,
  ref,
  task,
  transient,
}).then(
  ({ environment, owner, repo }) => {
    spinner.succeed(`Deployed to ${environment}!`);
    console.log(`🚀 https://github.com/${owner}/${repo}/deployments 🚀`);
    process.exit(0);
  },
  (err) => {
    spinner.fail(err.message);
    process.exit(1);
  }
);
