import type { IconifyIcon } from "@iconify/vue";
import defaultFile from "@iconify/icons-vscode-icons/default-file";
import audio from "@iconify/icons-vscode-icons/file-type-audio";
import avif from "@iconify/icons-vscode-icons/file-type-avif";
import c from "@iconify/icons-vscode-icons/file-type-c";
import cheader from "@iconify/icons-vscode-icons/file-type-cheader";
import cpp from "@iconify/icons-vscode-icons/file-type-cpp";
import csharp from "@iconify/icons-vscode-icons/file-type-csharp";
import css from "@iconify/icons-vscode-icons/file-type-css";
import excel from "@iconify/icons-vscode-icons/file-type-excel";
import go from "@iconify/icons-vscode-icons/file-type-go";
import html from "@iconify/icons-vscode-icons/file-type-html";
import image from "@iconify/icons-vscode-icons/file-type-image";
import java from "@iconify/icons-vscode-icons/file-type-java";
import js from "@iconify/icons-vscode-icons/file-type-js";
import json from "@iconify/icons-vscode-icons/file-type-json";
import kotlin from "@iconify/icons-vscode-icons/file-type-kotlin";
import log from "@iconify/icons-vscode-icons/file-type-log";
import markdown from "@iconify/icons-vscode-icons/file-type-markdown";
import pdf from "@iconify/icons-vscode-icons/file-type-pdf2";
import php from "@iconify/icons-vscode-icons/file-type-php";
import powerpoint from "@iconify/icons-vscode-icons/file-type-powerpoint";
import python from "@iconify/icons-vscode-icons/file-type-python";
import reactjs from "@iconify/icons-vscode-icons/file-type-reactjs";
import reactts from "@iconify/icons-vscode-icons/file-type-reactts";
import ruby from "@iconify/icons-vscode-icons/file-type-ruby";
import rust from "@iconify/icons-vscode-icons/file-type-rust";
import shell from "@iconify/icons-vscode-icons/file-type-shell";
import sql from "@iconify/icons-vscode-icons/file-type-sql";
import svg from "@iconify/icons-vscode-icons/file-type-svg";
import swift from "@iconify/icons-vscode-icons/file-type-swift";
import text from "@iconify/icons-vscode-icons/file-type-text";
import toml from "@iconify/icons-vscode-icons/file-type-toml";
import typescript from "@iconify/icons-vscode-icons/file-type-typescript";
import video from "@iconify/icons-vscode-icons/file-type-video";
import vue from "@iconify/icons-vscode-icons/file-type-vue";
import word from "@iconify/icons-vscode-icons/file-type-word";
import xml from "@iconify/icons-vscode-icons/file-type-xml";
import yaml from "@iconify/icons-vscode-icons/file-type-yaml";
import zip from "@iconify/icons-vscode-icons/file-type-zip";
import type { BundledIconifyIcon } from "./lucideDefaults";

function vscodeIcon(name: string, data: IconifyIcon): BundledIconifyIcon {
  return {
    prefix: "vscode-icons",
    name,
    body: data.body,
    width: data.width ?? 32,
    height: data.height ?? 32,
  };
}

const DEFAULT = vscodeIcon("default-file", defaultFile);
const PDF = vscodeIcon("file-type-pdf2", pdf);
const WORD = vscodeIcon("file-type-word", word);
const EXCEL = vscodeIcon("file-type-excel", excel);
const POWERPOINT = vscodeIcon("file-type-powerpoint", powerpoint);
const IMAGE = vscodeIcon("file-type-image", image);
const SVG = vscodeIcon("file-type-svg", svg);
const AVIF = vscodeIcon("file-type-avif", avif);
const AUDIO = vscodeIcon("file-type-audio", audio);
const VIDEO = vscodeIcon("file-type-video", video);
const ZIP = vscodeIcon("file-type-zip", zip);
const JS = vscodeIcon("file-type-js", js);
const TS = vscodeIcon("file-type-typescript", typescript);
const JSX = vscodeIcon("file-type-reactjs", reactjs);
const TSX = vscodeIcon("file-type-reactts", reactts);
const JSON = vscodeIcon("file-type-json", json);
const HTML = vscodeIcon("file-type-html", html);
const CSS = vscodeIcon("file-type-css", css);
const XML = vscodeIcon("file-type-xml", xml);
const PYTHON = vscodeIcon("file-type-python", python);
const JAVA = vscodeIcon("file-type-java", java);
const GO = vscodeIcon("file-type-go", go);
const RUST = vscodeIcon("file-type-rust", rust);
const C = vscodeIcon("file-type-c", c);
const CPP = vscodeIcon("file-type-cpp", cpp);
const H = vscodeIcon("file-type-cheader", cheader);
const VUE = vscodeIcon("file-type-vue", vue);
const PHP = vscodeIcon("file-type-php", php);
const RUBY = vscodeIcon("file-type-ruby", ruby);
const SHELL = vscodeIcon("file-type-shell", shell);
const YAML = vscodeIcon("file-type-yaml", yaml);
const TOML = vscodeIcon("file-type-toml", toml);
const SQL = vscodeIcon("file-type-sql", sql);
const KOTLIN = vscodeIcon("file-type-kotlin", kotlin);
const SWIFT = vscodeIcon("file-type-swift", swift);
const CSHARP = vscodeIcon("file-type-csharp", csharp);
const TEXT = vscodeIcon("file-type-text", text);
const MARKDOWN = vscodeIcon("file-type-markdown", markdown);
const LOG = vscodeIcon("file-type-log", log);

export type FileIconCategory =
  | "pdf"
  | "word"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "audio"
  | "video"
  | "archive"
  | "code"
  | "text"
  | "generic";

export const FILE_ICON_CATEGORIES: readonly FileIconCategory[] = [
  "pdf",
  "word",
  "spreadsheet",
  "presentation",
  "image",
  "audio",
  "video",
  "archive",
  "code",
  "text",
  "generic",
];

export const FILE_ICON_BY_CATEGORY: Record<FileIconCategory, BundledIconifyIcon> = {
  pdf: PDF,
  word: WORD,
  spreadsheet: EXCEL,
  presentation: POWERPOINT,
  image: IMAGE,
  audio: AUDIO,
  video: VIDEO,
  archive: ZIP,
  code: JS,
  text: TEXT,
  generic: DEFAULT,
};

export const FILE_ICON_BY_EXT: Record<string, BundledIconifyIcon> = {
  pdf: PDF,
  doc: WORD,
  docx: WORD,
  odt: WORD,
  rtf: WORD,
  xls: EXCEL,
  xlsx: EXCEL,
  csv: EXCEL,
  ods: EXCEL,
  tsv: EXCEL,
  ppt: POWERPOINT,
  pptx: POWERPOINT,
  odp: POWERPOINT,
  png: IMAGE,
  jpg: IMAGE,
  jpeg: IMAGE,
  gif: IMAGE,
  webp: IMAGE,
  svg: SVG,
  bmp: IMAGE,
  ico: IMAGE,
  tif: IMAGE,
  tiff: IMAGE,
  heic: IMAGE,
  avif: AVIF,
  mp3: AUDIO,
  wav: AUDIO,
  ogg: AUDIO,
  flac: AUDIO,
  m4a: AUDIO,
  aac: AUDIO,
  wma: AUDIO,
  mp4: VIDEO,
  mov: VIDEO,
  webm: VIDEO,
  avi: VIDEO,
  mkv: VIDEO,
  wmv: VIDEO,
  m4v: VIDEO,
  zip: ZIP,
  rar: ZIP,
  "7z": ZIP,
  tar: ZIP,
  gz: ZIP,
  tgz: ZIP,
  bz2: ZIP,
  xz: ZIP,
  js: JS,
  ts: TS,
  jsx: JSX,
  tsx: TSX,
  json: JSON,
  html: HTML,
  css: CSS,
  xml: XML,
  py: PYTHON,
  java: JAVA,
  go: GO,
  rs: RUST,
  c: C,
  cpp: CPP,
  h: H,
  vue: VUE,
  php: PHP,
  rb: RUBY,
  sh: SHELL,
  yaml: YAML,
  yml: YAML,
  toml: TOML,
  sql: SQL,
  kt: KOTLIN,
  swift: SWIFT,
  cs: CSHARP,
  txt: TEXT,
  md: MARKDOWN,
  log: LOG,
  generic: DEFAULT,
};

const EXT_TO_CATEGORY: Record<string, FileIconCategory> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  odt: "word",
  rtf: "word",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  csv: "spreadsheet",
  ods: "spreadsheet",
  tsv: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  odp: "presentation",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  ico: "image",
  tif: "image",
  tiff: "image",
  heic: "image",
  avif: "image",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  m4a: "audio",
  aac: "audio",
  wma: "audio",
  mp4: "video",
  mov: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
  wmv: "video",
  m4v: "video",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  tgz: "archive",
  bz2: "archive",
  xz: "archive",
  js: "code",
  ts: "code",
  jsx: "code",
  tsx: "code",
  json: "code",
  html: "code",
  css: "code",
  xml: "code",
  py: "code",
  java: "code",
  go: "code",
  rs: "code",
  c: "code",
  cpp: "code",
  h: "code",
  vue: "code",
  php: "code",
  rb: "code",
  sh: "code",
  yaml: "code",
  yml: "code",
  toml: "code",
  sql: "code",
  kt: "code",
  swift: "code",
  cs: "code",
  txt: "text",
  md: "text",
  log: "text",
  generic: "generic",
};

export function fileIconCategory(ext: string): FileIconCategory {
  return EXT_TO_CATEGORY[ext.toLowerCase()] ?? "generic";
}

export function resolveFileIcon(slotName: string): {
  category: FileIconCategory;
  icon: BundledIconifyIcon;
} | undefined {
  if (!slotName.startsWith("file:")) return undefined;
  const ext = slotName.slice(5);
  if (!ext) return undefined;
  const key = ext.toLowerCase();
  return {
    category: fileIconCategory(key),
    icon: FILE_ICON_BY_EXT[key] ?? DEFAULT,
  };
}
