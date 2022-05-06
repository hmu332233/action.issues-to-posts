'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@octokit/core');
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
  throw new Error('Required GITHUB_TOKEN, GITHUB_REPOSITORY!');
}
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const [OWNER, REPO] = process.env.GITHUB_REPOSITORY.split('/');
function getPosts() {
  return __awaiter(this, void 0, void 0, function* () {
    const octokit = new core_1.Octokit({ auth: GITHUB_TOKEN });
    const { data: issues } = yield octokit.request(
      'GET /repos/{owner}/{repo}/issues',
      {
        owner: OWNER,
        repo: REPO,
        per_page: 100,
      },
    );
    const posts = yield Promise.all(
      issues.map((issue) =>
        __awaiter(this, void 0, void 0, function* () {
          const { data: comments } = yield octokit.request(
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
          const categories = issue.labels.map((label) => ({
            id: label.id,
            name: label.name,
          }));
          return {
            id: issue.number,
            title: issue.title,
            contents,
            categories,
          };
        }),
      ),
    );
    return posts;
  });
}
function action() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const posts = yield getPosts();
      console.log(posts);
    } catch (error) {
      console.log(error);
    }
  });
}
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield action();
  }))();
