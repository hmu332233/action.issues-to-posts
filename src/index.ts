import { Octokit } from '@octokit/core';
import * as core from '@actions/core';
import type { Category, Post, GithubLabel } from './types';

if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
  throw new Error('Required GITHUB_TOKEN, GITHUB_REPOSITORY!');
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const [OWNER, REPO] = process.env.GITHUB_REPOSITORY.split('/');

async function getPosts() {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const { data: issues } = await octokit.request(
    'GET /repos/{owner}/{repo}/issues',
    {
      owner: OWNER,
      repo: REPO,
      per_page: 100,
    },
  );

  const posts = await Promise.all<Promise<Post>[]>(
    issues.map(async (issue) => {
      const { data: comments } = await octokit.request(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
        {
          owner: OWNER,
          repo: REPO,
          issue_number: issue.number,
        },
      );

      const contents = comments.reduce(
        (commentsBody, comment) => `${commentsBody}\n\n${comment.body}`,
        '',
      );

      const categories: Category[] = (issue.labels as GithubLabel[]).map(
        (label) => ({ id: label.id, name: label.name }),
      );

      return {
        id: issue.number,
        title: issue.title,
        contents,
        categories,
      };
    }),
  );

  const { data: labels } = await octokit.request(
    'GET /repos/{owner}/{repo}/labels',
    {
      owner: OWNER,
      repo: REPO,
      per_page: 100,
    },
  );

  const categories: Category[] = (labels as GithubLabel[]).map((label) => ({
    id: label.id,
    name: label.name,
  }));

  return {
    posts,
    categories,
  };
}

async function action() {
  try {
    const { posts, categories } = await getPosts();

    core.setOutput('posts', JSON.stringify(posts));
    core.setOutput('categories', JSON.stringify(categories));
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await action();
})();
