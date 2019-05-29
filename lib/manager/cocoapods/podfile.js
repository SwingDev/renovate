function parsePod(line, nameAndVersionRegex, keyValueRegex) {
  logger.trace(`Parsing pod '${line}`);
  nameAndVersionRegex.lastIndex = 0;
  keyValueRegex.lastIndex = 0;
  //Fetch name and version spec
  let matches = nameAndVersionRegex.exec(line);
  if (!matches) {
    return null;
  }
  const [, indent, depName, , currentValue] = matches;
  logger.trace(`Found pod '${depName}`);

  //Fetch all other properties
  let properties = {};

  do {
    matches = keyValueRegex.exec(line);
    if (matches) {
      const [, key, value] = matches;
      properties[key] = value;
    }
  } while (matches);

  const dep = {
    depName,
    specifier: currentValue,
    currentValue: currentValue != undefined ? currentValue : '0',
    indent,
    properties,
    datasource: 'cocoapods',
  };
  return dep;
}

function parsePodfile(content) {
  if (content == null) {
    return {};
  }

  const nameAndVersionRegex = new RegExp(
    `^( *)pod +\\'([^']+)\\'( *, *\\'(.+)\\')? *`,
    'g'
  );
  const keyAndValueRegex = new RegExp(
    ` *, *\\:([a-z]+) *=> *(\\'([^']+)\\'|\\[(.*)\\])`,
    'g'
  );
  return content
    .split('\n')
    .map((rawline, lineNumber) => {
      let [line, comment] = rawline.split('#').map(part => part.trim());
      if (!line) {
        line = rawline;
      }
      const dep = parsePod(line, nameAndVersionRegex, keyAndValueRegex);
      if (!dep) {
        return null;
      }

      dep['lineNumber'] = lineNumber;
      return dep;
    })
    .filter(Boolean);
}

module.exports = {
  parsePodfile,
};
