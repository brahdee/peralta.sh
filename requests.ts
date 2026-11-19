import { api } from "encore.dev/api";
import ejs, { Options } from "ejs";
import { photoObjs } from "./storage";
import { getDetails } from "./details";

const TEMPLATE_PATH = "./templates";
const ejsOptions: Options = { views: [TEMPLATE_PATH] };

// Static files
export const assets = api.static(
  { expose: true, path: "/assets/*path", dir: "./assets"},
);

// Serve homepage content (at root)
export const serveHomepage = api.raw(
  { expose: true, path: "/", method: ["GET", "HEAD"] },
  async (req, resp) => {
    const viewPath = `${TEMPLATE_PATH}/main/index.ejs`;

    const details = await getDetails();
        
    const html = await ejs.renderFile(
      viewPath,
      details,
    );

    resp.setHeader("content-type", "text/html");

    if (req.method === "HEAD") {
      resp.end();
      return;
    }
    resp.end(html);
  },
);

// Serve /gallery content
export const serveGallery = api.raw(
  { expose: true, path: "/gallery", method: "GET" },
  async (_, resp) => {
    const viewPath = `${TEMPLATE_PATH}/gallery/index.ejs`;

    const html = await ejs.renderFile(
      viewPath,
      { photos: photoObjs, mainphoto: photoObjs.find(y => y.year === 2026)?.albums.digital.find(p => p.endsWith("0008.webp")) },
      ejsOptions,
    );

    resp.setHeader("content-type", "text/html");
    resp.end(html);
  },
);

// 404
export const notFound = api.raw(
  { expose: true, path: "/!path", method: "GET" },
  async (_, resp) => {
    const viewPath = `${TEMPLATE_PATH}/404/index.ejs`;
    const html = await ejs.renderFile(viewPath);

    resp.setHeader("content-type", "text/html");
    resp.end(html);
  },
);