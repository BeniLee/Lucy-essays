export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/api/submit') {
      try {
        const { date, title, body, password } = await request.json();

        if (password !== env.POST_PASSWORD) {
          return new Response(JSON.stringify({ error: '密碼錯誤' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        if (!date || !title || !body) {
          return new Response(JSON.stringify({ error: '請填寫完整資訊' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Build JSON patch for GitHub API
        const patch = [
          { op: 'add', path: '/-/default', value: { date, title, preview: body.slice(0, 100) + '...', body, images: [], hasImage: false } }
        ];

        // Create a new essay file
        const filename = `essay-${date}-${Date.now()}.json`;
        const fileContent = JSON.stringify({
          id: `essay-${date}-${Date.now()}`,
          date,
          title,
          preview: body.slice(0, 100) + '...',
          body,
          images: [],
          hasImage: false,
        }, null, 2);

        // Push to GitHub via Contents API
        const ghRes = await fetch(`https://api.github.com/repos/BeniLee/Lucy-essays/contents/essays/${filename}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `add essay: ${title} (${date})`,
            content: btoa(fileContent),
          }),
        });

        if (!ghRes.ok) {
          const err = await ghRes.text();
          return new Response(JSON.stringify({ error: 'GitHub 失敗：' + err }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Rebuild index.json via GitHub API
        const indexRes = await fetch('https://api.github.com/repos/BeniLee/Lucy-essays/contents/essays/index.json', {
          headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` },
        });
        const indexData = await indexRes.json();
        const currentIndex = JSON.parse(atob(indexData.content));
        
        const newEssay = JSON.parse(fileContent);
        currentIndex.push(newEssay);
        currentIndex.sort((a, b) => b.date.localeCompare(a.date));

        const updateRes = await fetch('https://api.github.com/repos/BeniLee/Lucy-essays/contents/essays/index.json', {
          method: 'PUT',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `update index: ${title}`,
            content: btoa(JSON.stringify(currentIndex, null, 2)),
            sha: indexData.sha,
          }),
        });

        if (!updateRes.ok) {
          const err = await updateRes.text();
          return new Response(JSON.stringify({ error: '更新索引失敗：' + err }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: '發布成功！' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: '伺服器錯誤：' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
