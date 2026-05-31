const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Obtener la lista de archivos staged
const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

// Si no hay archivos staged, o si los únicos archivos staged son package.json, version.ts y package-lock.json, no hacemos nada
const packageJsonPath = 'package.json';
const versionTsPath = 'src/lib/version.ts';
const packageLockPath = 'package-lock.json';

const functionalChanges = stagedFiles.filter(f => 
  f !== packageJsonPath && 
  f !== versionTsPath && 
  f !== packageLockPath
);

if (functionalChanges.length === 0) {
  // No hay cambios funcionales staged, no bump
  process.exit(0);
}

// Bump version
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = pkg.version;

// Incrementar versión patch (por ejemplo: X.Y.Z -> X.Y.(Z+1))
const parts = currentVersion.split('.').map(Number);
if (parts.length === 3 && !parts.some(isNaN)) {
  parts[2] += 1;
  const newVersion = parts.join('.');
  
  // Guardar en package.json
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  
  // Guardar en package-lock.json si existe
  if (fs.existsSync(packageLockPath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
      if (lock.version) lock.version = newVersion;
      if (lock.packages && lock.packages['']) {
        lock.packages[''].version = newVersion;
      }
      fs.writeFileSync(packageLockPath, JSON.stringify(lock, null, 2) + '\n');
      execSync(`git add ${packageLockPath}`);
    } catch (e) {
      console.error('Warning: Could not update package-lock.json version:', e.message);
    }
  }

  // Guardar en src/lib/version.ts
  const versionContent = `export const APP_VERSION = "${newVersion}"\nexport const APP_NAME = "DentiApp Online"\nexport const APP_DESCRIPTION = "Panel administrativo para clínicas dentales"\n`;
  fs.writeFileSync(versionTsPath, versionContent);

  // Agregar al stage de git
  execSync(`git add ${packageJsonPath} ${versionTsPath}`);
  console.log(`[Version Bump] Version bumped from ${currentVersion} to ${newVersion} and staged.`);
} else {
  console.error('[Version Bump] Invalid version format in package.json:', currentVersion);
}
