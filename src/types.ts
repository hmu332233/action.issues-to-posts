export type Post = {
  id: number;
  title: string;
  contents: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  name: string;
};

export type GithubLabel = {
  id: number;
  name: string;
};
