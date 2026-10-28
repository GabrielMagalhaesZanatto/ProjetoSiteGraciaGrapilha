(async () => {
  const box = document.querySelector('.elementor-posts-container');
  if (!box) return;

  const API = 'https://graciagrapilha.com.br/wp-json/wp/v2/posts?per_page=6&_embed=wp:featuredmedia';
  const texto = (html) => new DOMParser().parseFromString(html || '', 'text/html').body.textContent.trim();

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(API, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const posts = await r.json();
    if (!Array.isArray(posts) || !posts.length) return; // mantém as notícias que já estão na página

    box.innerHTML = '';
    posts.forEach((p) => {
      const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0];
      const sizes = m && m.media_details && m.media_details.sizes;
      const imagem = (sizes && sizes.medium && sizes.medium.source_url) || (m && m.source_url) || '';
      const data = new Date(p.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      let resumo = texto(p.excerpt && p.excerpt.rendered).replace(/\s*\[…\]|\s*\[\.\.\.\]/g, '');
      if (resumo.length > 180) resumo = resumo.slice(0, 180).replace(/\s+\S*$/, '') + '…';

      const el = document.createElement('article');
      el.className = 'elementor-post elementor-grid-item';
      el.setAttribute('role', 'listitem');
      const card = document.createElement('div'); card.className = 'elementor-post__card';

      if (imagem) {
        const a = document.createElement('a'); a.className = 'elementor-post__thumbnail__link'; a.href = p.link; a.tabIndex = -1;
        const t = document.createElement('div'); t.className = 'elementor-post__thumbnail';
        const img = document.createElement('img'); img.src = imagem; img.alt = ''; img.loading = 'lazy';
        t.appendChild(img); a.appendChild(t); card.appendChild(a);
      }

      const corpo = document.createElement('div'); corpo.className = 'elementor-post__text';
      const h3 = document.createElement('h3'); h3.className = 'elementor-post__title';
      const ta = document.createElement('a'); ta.href = p.link; ta.textContent = texto(p.title && p.title.rendered);
      h3.appendChild(ta);
      const ex = document.createElement('div'); ex.className = 'elementor-post__excerpt';
      const pp = document.createElement('p'); pp.textContent = resumo; ex.appendChild(pp);
      const mais = document.createElement('a'); mais.className = 'elementor-post__read-more'; mais.href = p.link; mais.textContent = 'Ler mais »';
      corpo.append(h3, ex, mais); card.appendChild(corpo);

      const meta = document.createElement('div'); meta.className = 'elementor-post__meta-data';
      const sp = document.createElement('span'); sp.className = 'elementor-post-date'; sp.textContent = data;
      meta.appendChild(sp); card.appendChild(meta);

      el.appendChild(card); box.appendChild(el);
    });
  } catch (e) {
    console.warn('Não foi possível carregar as notícias novas, mantendo as da página:', e);
  }
})();
