import { Document, Query } from "mongoose";
import { adminAuth } from "../../user/middleware";
import {
  BaseQuery,
  BaseRes,
  del,
  get,
  GetRequestHandler,
  InternalServerError,
  NotFound,
  path,
  post,
  PostRequestHandler,
  put,
} from "../lib";
import { adminRoleAuth, UserInfo } from "../middleware";
import { LocalModel, useModel } from "../middleware/model";
import { modelNameList, pageQueryParser } from "../service";
import { mongo } from "../../../db";

export interface GetDictQuery extends BaseQuery {
  value?: string;
  label?: string;
}

export interface GetDictRes extends BaseRes {
  data: Array<{ label: string; value: string }>;
}

export interface GetQuery extends BaseQuery {
  form?: string;
  page?: string;
  sort?: string;
  project?: string;
  populate?: string;
}

export interface GetRes<T = unknown> extends BaseRes {
  currentPage: number;
  pageSize: number;
  total: number;
  records: Array<T> | Query<T, unknown>;
  pageNum: number;
}

@path("/admin")
@adminRoleAuth
export class CoreAdminController {
  @get("/model/dict")
  @adminAuth
  public getModelDict: GetRequestHandler<GetDictRes, GetDictQuery> = (
    req,
    res,
    next,
  ) => {
    res.json({
      code: 0,
      msg: "get model dict ok",
      data: modelNameList.map((e) => {
        return { label: e, value: e };
      }),
    });
  };

  @get("/:model")
  @useModel
  public getModel: GetRequestHandler<GetRes, GetQuery, UserInfo & LocalModel> =
    async (req, res, next) => {
      const model = res.locals.model;
      const {
        page: { currentPage, pageSize },
        form,
        sort,
        project,
      } = pageQueryParser<Record<string, unknown>>(req.query);
      const total = await model.countDocuments(form);
      const pageNum = Math.ceil(total / pageSize);
      let records: Array<Document<unknown>>;
      if (currentPage <= pageNum) {
        let modelQuery = model.find(form, project);

        // use sort
        if (sort) {
          modelQuery = modelQuery.sort(sort);
        }

        // use page
        if (pageSize > 0) {
          modelQuery = modelQuery
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);
        }

        // use populate
        if (req.query.populate) {
          modelQuery = modelQuery.populate(req.query.populate);
        }

        // exec
        records = await modelQuery.exec();
      } else {
        records = [];
      }

      res.json({
        code: 0,
        msg: `get ${res.locals.modelName} ok`,
        currentPage,
        pageSize,
        total,
        pageNum,
        records,
      });
    };

  @get("/:model/:id")
  @useModel
  public getModel1: GetRequestHandler<
    BaseRes,
    BaseQuery,
    UserInfo & LocalModel
  > = async (req, res, next) => {
    const model = res.locals.model;
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const data = await model.findById(id);
    if (!data) throw NotFound(`${res.locals.modelName} ${id} not found`);
    res.json({
      code: 0,
      msg: `get ${res.locals.modelName} ok`,
      data,
    });
  };

  @post("/:model")
  @useModel
  public postModel: PostRequestHandler<
    BaseRes,
    unknown,
    never,
    UserInfo & LocalModel
  > = async (req, res, next) => {
    const model = res.locals.model;
    const d = await model.create(req.body);
    res.status(201).json({
      code: 0,
      msg: `create ${res.locals.modelName} ok`,
      data: d,
    });
  };

  @put("/:model/:id")
  @useModel
  public putModelById: PostRequestHandler<
    BaseRes,
    Record<string, unknown>,
    never,
    UserInfo & LocalModel
  > = async (req, res, next) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const model = res.locals.model;

    // delete known fields
    const { _id, __v, createdAt, updatedAt, ...rest } = req.body;
    const d = await model.findById(id);
    if (!d) throw NotFound(`${res.locals.modelName} ${id} not found`);
    // set values
    d.$set(rest);
    await d.save();

    res.json({
      code: 0,
      msg: `update ${res.locals.modelName} ok`,
      data: d,
    });
  };

  @del("/:model/:id")
  @useModel
  public deleteModelById: PostRequestHandler<
    BaseRes,
    never,
    never,
    UserInfo & LocalModel
  > = async (req, res, next) => {
    const model = res.locals.model;
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    await model.deleteOne({ _id: id });
    res.json({
      code: 0,
      msg: `delete ${res.locals.modelName} ok`,
    });
  };

  @get("/status")
  public getStatus: GetRequestHandler<BaseRes> = async (req, res, next) => {
    res.json({
      code: 0,
      msg: "ok",
      data: {
        mongo: mongo.readyState,
      },
    });
  };

  @post("/db/index")
  public postDbIndex: PostRequestHandler<BaseRes<string>> = async (
    req,
    res,
    next,
  ) => {
    await mongo.syncIndexes();
    res.json({ code: 0, msg: "ok" });
  };
}
