const createCookie = (options) => {
  const cookieOptions = Object.entries(options)
    .map(([key, value]) => {
      if (key === "Expires") {
        const date = value.toUTCString();
        return `${key}=${date}`;
      } else {
        return `${key}=${value}`;
      }
    })
    .join("; ");

  return cookieOptions;
};

module.exports = createCookie;
