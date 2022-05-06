'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const core = __importStar(require('@actions/core'));
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
      core.setOutput('posts', posts);
    } catch (error) {
      console.log(error);
    }
  });
}
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield action();
  }))();
