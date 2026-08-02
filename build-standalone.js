const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const enhancements = fs.readFileSync(path.join(root, 'enhancements.css'), 'utf8');
const enterpriseStyles = fs.readFileSync(path.join(root, 'enterprise.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const enterpriseScript = fs.readFileSync(path.join(root, 'enterprise.js'), 'utf8');

const standalone = source
  .replace(/<link rel="stylesheet" href="styles\.css[^\"]*">/, `<style>\n${styles}\n</style>`)
  .replace(/<link rel="stylesheet" href="enhancements\.css[^\"]*">/, `<style>\n${enhancements}\n</style>`)
  .replace(/<link rel="stylesheet" href="enterprise\.css[^\"]*">/, `<style>\n${enterpriseStyles}\n</style>`)
  .replace(/<script src="app\.js[^\"]*"><\/script>/, `<script>\n${script}\n</script>`)
  .replace(/<script src="enterprise\.js[^\"]*"><\/script>/, `<script>\n${enterpriseScript}\n</script>`);

const target = path.join(root, 'Optica-demo.html');
fs.writeFileSync(target, standalone);
console.log(target);
