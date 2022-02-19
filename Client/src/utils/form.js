export const constrainLength = (value, length) =>
  length ? value.slice(0, length) : value;

export const constrainLineLengths = (text, lineCount, lineLength) =>
  constrainLength(text.split("\n"), lineCount)
    .map((line) => constrainLength(line, lineLength))
    .join("\n");
