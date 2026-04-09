const fs = require('fs');
const path = require('path');

// 1. Create page.jsx files for Next.js routing

const routes = [
  { dir: '', component: 'home/Home.jsx', name: 'Home' },
  { dir: 'about', component: 'about/About.jsx', name: 'About' },
  { dir: 'updates', component: 'updates/Updates.jsx', name: 'Updates' },
  { dir: 'solutions', component: 'solutions/Solutions.jsx', name: 'Solutions' },
  { dir: 'contact', component: 'contact/Contact.jsx', name: 'Contact' }
];

const appDir = path.join(__dirname, 'src', 'app');

routes.forEach(route => {
  const pagePath = path.join(appDir, route.dir, 'page.jsx');
  // Need to measure how many directories up we are to reach `src/pages-components`
  const relativeDepth = route.dir === '' ? '../pages-components' : '../../pages-components';
  const content = `
"use client";
import ${route.name} from "${relativeDepth}/${route.component.replace('.jsx', '')}";

export default function Page() {
  return <${route.name} />;
}
`;
  fs.writeFileSync(pagePath, content.trim(), 'utf8');
});

// 2. Fix react-router-dom imports across ALL files

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('react-router-dom') || content.includes('react-router')) {
    content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+["']react-router-dom["']/g, 'import Link from "next/link"');
    content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+["']react-router["']/g, 'import Link from "next/link"');
    content = content.replace(/import\s+\{\s*useLocation\s*\}\s+from\s+["']react-router-dom["']/g, 'import { usePathname as useLocation } from "next/navigation"');
    changed = true;
  }

  if (content.includes('<Link to=')) {
    content = content.replace(/<Link\s+to=/g, '<Link href=');
    changed = true;
  }

  // Musician theme often sets document.title in React component with useEffect. Next.js app router doesn't strictly mind, but no change needed.

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed React Router in:', file);
  }
});
