#!/bin/bash
# Exports posts from the remote API into src/content/posts/ as .md files with frontmatter.
# Images are stripped (Post component uses a local gradient.jpg, ignoring the image field).
mkdir -p src/content/posts
curl -s https://41adf6f41ba9f813.mokky.dev/posts | node -e "
const fs = require('fs'), path = require('path');
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  const posts = JSON.parse(d);
  posts.forEach(post => {
    const file = path.join('src/content/posts', post.id + '.md');
    const safeTitle = (post.title || '').replace(/\"/g, '\\\\\"');
    const content = '---\nid: ' + post.id + '\ntitle: \"' + safeTitle + '\"\n---\n\n' + (post.text || '') + '\n';
    fs.writeFileSync(file, content);
    console.log('Created:', post.id + '.md  | title:', post.title);
  });
  console.log('Done. Total posts:', posts.length);
});
"
