const logger = () => {
  const log = (..._: any[]) => {};
  const error = (..._: any[]) => {};
  const warn = (..._: any[]) => {};
  const info = (..._: any[]) => {};

  if (import.meta.env.DEV) {
    return {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
    };
  }

  return { log, warn, error, info };
};

const uniqid = (prefix: string = "vpdf_", random: boolean = false): string => {
  const sec = Date.now() * 1000 + Math.random() * 1000;
  const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");
  return `${prefix}${id}${
    random ? `.${Math.trunc(Math.random() * 100000000)}` : ""
  }`;
};

export const { log, warn, error, info } = logger();
export { uniqid };
