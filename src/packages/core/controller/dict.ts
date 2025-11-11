import {
  BadRequest,
  BaseQuery,
  BaseRes,
  get,
  GetRequestHandler,
  NotFound,
  path,
} from "..";
import { readDict } from "../service";

interface GetDictByNameQuery extends BaseQuery {
  name: string;
}

/**
 * @openapi
 * tags:
 *   name: Dictionary
 *   description: Dictionary operations
 */
@path("/dict")
export class DictController {
  /**
   * @openapi
   * /dict:
   *   get:
   *     summary: Get dictionary by name
   *     description: Retrieves dictionary data based on the provided name
   *     tags: [Dictionary]
   *     parameters:
   *       - in: query
   *         name: name
   *         required: true
   *         description: Name of the dictionary to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Dictionary data successfully retrieved
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: "#/components/schemas/BaseRes"
   *                 - properties:
   *                     data:
   *                       $ref: "#/components/schemas/Dict"
   *       400:
   *         $ref: "#/components/responses/400"
   *       404:
   *         $ref: "#/components/responses/404"
   */
  @get()
  public get: GetRequestHandler<BaseRes, GetDictByNameQuery> = async (
    req,
    res,
    next,
  ) => {
    const { name } = req.query;
    if (!name) throw BadRequest("Must input name");
    const data = await readDict(name);
    if (!data) throw NotFound(`Dict ${name} not found`);
    res.json({ code: 0, msg: "ok", data });
  };
}
