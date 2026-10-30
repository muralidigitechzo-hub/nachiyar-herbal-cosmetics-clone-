const fs = require('fs');

['admin.html', 'nimda.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(f, 'main start index:', content.indexOf('<main'));
  console.log(f, 'main end index:', content.indexOf('</main>'));
  console.log(f, 'admin-layout start index:', content.indexOf('class="admin-layout"'));
});
