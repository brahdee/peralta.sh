import {
  S3Client,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import { secret } from "encore.dev/config";

const CDN_URL = "https://cdn.peralta.sh";
const BUCKET = "easternmind-storage";

// Storage keys & url
const r2AccessKey = secret("r2AccessKey");
const r2SecretKey = secret("r2SecretKey");
const r2URL = secret("r2URL");

const s3 = new S3Client({
  region: "auto",
  endpoint: r2URL(),
  credentials: {
    accessKeyId: r2AccessKey(),
    secretAccessKey: r2SecretKey(),
  },
});

const thumbnailStorage = await s3.send(
  new ListObjectsV2Command({
    Bucket: BUCKET,
    Delimiter: "/"
  }),
);

type Year = {
  readonly year: number,
  readonly albums: Albums
}

type Albums = {
  readonly digital: string[]
  readonly film: string[]
};

async function getFiles(prefix: string): Promise<string[]> {
  const files: string[] = [];

  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    }),
  );

  response.Contents?.forEach(file => {
    if (file.Key && !file.Key.endsWith("/")) {
      files.push(CDN_URL + "/" + file.Key);
    }
  });

  return files;
}

async function getPhotos(): Promise<Year[]> {
  const years: Year[] = [];

  // Retrieve numbered year folders
  for (const folder of thumbnailStorage.CommonPrefixes ?? []) {
    const prefix = folder.Prefix;

    if (!prefix) continue;

    // Extract the year from the folder name
    const match = prefix.match(/^(\d+)\/$/);

    if (!match) continue;

    const year = Number(match[1]);

    // Retrieve digital and film albums
    const [digital, film] = await Promise.all([
      getFiles(`${prefix}digital/`),
      getFiles(`${prefix}film/`)
    ]);

    years.push({
      year,
      albums: {
        digital,
        film
      }
    });
  }

  return years.sort((a, b) => a.year - b.year);
}

export const photoObjs = await getPhotos();