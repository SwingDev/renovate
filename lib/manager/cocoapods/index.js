import { parsePodfileLock } from './lock';
import { parsePodfile } from './podfile';

async function extractPackageFile(config, packageFile) {
  logger.trace('cocoapods.extractAllPackageFile()');

  const content = await platform.getFile(packageFile);
  const lockContent = await platform.getFile(packageFile + '.lock');
  const lock = parsePodfileLock(lockContent);

  const deps = parsePodfile(content).map(dep => {
    const versionFromLock = lock[dep.depName];
    if (versionFromLock != undefined) {
      dep.fromVersion = versionFromLock;
    }
    return dep;
  });

  if (!deps.length) {
    return null;
  }

  logger.trace(`Found deps: ${JSON.stringify(deps)}`);
  return { deps };
}

function updateDependency(fileContent, upgrade) {
  // prettier-ignore
  try {
    logger.debug(`cocoapods.updateDependency(): packageFile:${upgrade.packageFile} depName:${upgrade.depName}, version:${upgrade.currentVersion} ==> ${upgrade.newValue}`);
    const lines = fileContent.split('\n');
    const oldValue = lines[upgrade.lineNumber];
    let properties = Object.keys(upgrade.properties).map((key)=>`:${key} => ${upgrade.properties[value]}`).join(", ");
    if (properties.length > 0) {
      properties = `, ${properties}`;
    }
    lines[upgrade.lineNumber] = `  pod '${upgrade.packageFile}', '${upgrade.newValue}'${properties}`;
    return lines.join('\n');
  } catch (err) {
    logger.info({ err }, 'Error setting new package version');
    return null;
  }
}

module.exports = {
  extractPackageFile,
  updateDependency,
  language: 'swift',
};
