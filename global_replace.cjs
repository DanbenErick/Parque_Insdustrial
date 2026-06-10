const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build' && file !== '.gemini') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx') || dirFile.endsWith('.sql')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const frontendFiles = walkSync('/Users/danbenerickcruzbarreto/Proyectos/luz');
const backendFiles = walkSync('/Users/danbenerickcruzbarreto/Proyectos/luz-backend');
const allFiles = [...frontendFiles, ...backendFiles];

let changedFiles = 0;

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/Miembro/g, 'Socio')
    .replace(/miembro/g, 'socio')
    .replace(/MIEMBRO/g, 'SOCIO')
    .replace(/Miembros/g, 'Socios')
    .replace(/miembros/g, 'socios')
    .replace(/MIEMBROS/g, 'SOCIOS')
    .replace(/Inquilino/g, 'Socio')
    .replace(/inquilino/g, 'socio')
    .replace(/INQUILINO/g, 'SOCIO')
    .replace(/Inquilinos/g, 'Socios')
    .replace(/inquilinos/g, 'socios')
    .replace(/INQUILINOS/g, 'SOCIOS');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Reemplazado en', filePath);
    changedFiles++;
  }
});

console.log(`Reemplazo completado. ${changedFiles} archivos modificados.`);
