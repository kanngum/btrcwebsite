/* ================================================
   BTRC - News Page Rendering
   Renders news post cards from the BTRCStore.
   "Read More" navigates to the provided link, or is
   disabled if no link is set.
   ================================================ */

document.addEventListener('DOMContentLoaded', async function() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    const news = await BTRCStore.getCollection('news');

    if (news.length === 0) {
        grid.innerHTML = '<p class="empty-state">No news available yet. Check back soon.</p>';
        return;
    }

    // Sort by date descending (newest first)
    news.sort((a, b) => new Date(b.date) - new Date(a.date));

    grid.innerHTML = news.map(n => {
        const img = n.image
            ? '<img src="' + n.image + '" alt="' + (n.title || 'News') + '" loading="lazy">'
            : '<span>' + (n.title || 'News') + '</span>';

        const readBtn = n.link
            ? '<a href="' + n.link + '" target="_blank" rel="noopener" class="btn btn-outline">Read More</a>'
            : '<button class="btn btn-outline" disabled>Read More</button>';

        return `
            <div class="post-card reveal">
                <div class="post-image">
                    ${img}
                    ${n.category ? '<span class="post-category">' + n.category + '</span>' : ''}
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span>
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${BTRCStore.formatDate(n.date)}
                        </span>
                        ${n.author ? '<span><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' + n.author + '</span>' : ''}
                    </div>
                    <h3>${n.title || ''}</h3>
                    <p>${n.summary || ''}</p>
                    ${readBtn}
                </div>
            </div>
        `;
    }).join('');

    // Trigger reveal animation
    const revealEls = grid.querySelectorAll('.reveal');
    revealEls.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('active');
        }, i * 100);
    });
});
