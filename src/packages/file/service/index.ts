import { join } from "path";
import { BadRequest } from "../../core";
import { FileData } from "../model";
import formidable from "formidable";
import { IncomingMessage } from "http";
import { randomUUID } from "crypto";

/**
 * pure file data
 * @param f file data input
 * @returns file data
 */
export function pureFileData(f: FileData): FileData;
export function pureFileData(f?: FileData): FileData | undefined;
export function pureFileData(f?: FileData): FileData | undefined {
  if (!f) return undefined;

  const { name, size, uid, url, type } = f;
  if (!name) throw BadRequest("Name is required");
  else if (!uid) throw BadRequest("Uid is required");

  return { name, size, uid, url, type };
}

const PublicDir = process.env.PUBLIC_DIR ?? "public";
const PrivateDir = process.env.PRIVATE_DIR ?? "private";

export function readPublicFilePath(file: string) {
  return join(process.cwd(), PublicDir, file);
}

export function readPrivateFilePath(user: string, file: string) {
  return join(process.cwd(), PrivateDir, user, file);
}

export type ParseFormFiles = Record<string, string[]>;

function saveFiles(req: IncomingMessage, dir: string): Promise<ParseFormFiles> {
  const form = formidable({
    encoding: "utf-8",
    uploadDir: dir,
    keepExtensions: true,
    allowEmptyFiles: false,
    maxFiles: 9,
    maxFileSize: 9 * 1024 * 1024,
    multiples: false,
    filename: (name, ext) => {
      return `${randomUUID()}-${name}${ext}`;
    },
  });

  return new Promise<ParseFormFiles>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      resolve(
        Object.entries(files).reduce<ParseFormFiles>((prev, curr) => {
          const [k, v] = curr;
          if (v) prev[k] = v.map((nf) => nf.newFilename);
          return prev;
        }, {}),
      );
    });
  });
}

export function savePublicFiles(req: IncomingMessage) {
  return saveFiles(req, join(process.cwd(), PublicDir));
}

export function savePrivateFile(req: IncomingMessage, user: string) {
  return saveFiles(req, join(process.cwd(), PrivateDir, user));
}
