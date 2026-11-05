import { api } from "encore.dev/api";
import ejs, { Options } from "ejs";
import { photoObjs } from "./storage";

const TEMPLATE_PATH = "./templates";
const ejsOptions: Options = { views: [TEMPLATE_PATH] };

// Static files
export const assets = api.static(
  { expose: true, path: "/!path", dir: "./assets", notFound: "./assets/404.html"},
);

// Serve /gallery content
export const serveGallery = api.raw(
  { expose: true, path: "/gallery", method: "GET" },
  async (req, resp) => {
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