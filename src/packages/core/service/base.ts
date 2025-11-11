import { SortOrder } from "mongoose";

export type ReadQueryForm = Record<string, unknown>;
export type ReadQueryPage = { currentPage: number; pageSize: number };
export type ReadQuerySort = Record<string, SortOrder>;
export type ReadQueryProject = Record<string, 1 | 0 | number>;

export interface ReadQuery<TForm = ReadQueryForm, TSort = ReadQuerySort> {
  form: TForm;
  page: ReadQueryPage;
  sort?: TSort;
  project?: ReadQueryProject;
}

export interface ReadQueryData {
  form?: string;
  page?: string;
  sort?: string;
  project?: string;
}

export function pageQueryParser<
  TForm extends ReadQueryForm = ReadQueryForm,
  TSort extends ReadQuerySort = ReadQuerySort,
>(query: ReadQueryData): ReadQuery<TForm, TSort> {
  const { form = "{}", page = "{}", sort, project } = query;

  const { currentPage = 1, pageSize = 10 } = JSON.parse(page);

  return {
    form: JSON.parse(form),
    page: { currentPage, pageSize },
    sort: sort ? JSON.parse(sort) : undefined,
    project: project ? JSON.parse(project) : undefined,
  };
}
