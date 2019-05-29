function parsePodfileLock(content) {
  if (content == null) {
    return {};
  }

  const regex = new RegExp(`^ *- \"?(.*) \\((.*)\\):\"?$`, 'g');

  var deps = {};

  content.split('\n').map((line, lineNumber) => {
    regex.lastIndex = 0;
    const matches = regex.exec(line);
    if (!matches) {
      return null;
    }
    const [, depName, currentValue] = matches;
    deps[depName] = currentValue;
  });

  return deps;
}

module.exports = {
  parsePodfileLock,
};
