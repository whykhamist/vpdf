if (!Promise.hasOwnProperty("withResolvers")) {
  if (window)
    // @ts-expect-error
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
}
