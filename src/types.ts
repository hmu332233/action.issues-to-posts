export type Post = {
  id: number;
  title: string;
  contents: string;
  categories: Category[];
};

export type Category = {
  id: number;
  name: string;
};

export type GithubLabel = {
  id: number;
  name: string;
};
