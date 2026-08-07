/* ================================================
   BTRC - Programs Page Rendering
   Renders program cards from the BTRCStore.
   "Apply Now" navigates to the provided application
   page link, or falls back to the contact page.
   ================================================ */

document.addEventListener('DOMContentLoaded', async function() {
    const grid = document.getElementById('programs-grid');
    if (!grid) return;

    const programs = await BTRCStore.getCollection('programs');

    if (programs.length === 0) {
        grid.innerHTML = '<p class="empty-state">No programs available yet. Check back soon.</p>';
        return;
    }

    grid.innerHTML = programs.map(p => {
        const img = p.image
            ? '<img src="' + p.image + '" alt="' + (p.name || 'Program') + '" loading="lazy">'
            : '<span>' + (p.name || 'Program') + '</span>';

        const applyLink = p.applyLink || 'contact.html';

return `
            <div class="program-detail-card reveal">
                <div class="program-detail-image">
                    ${img}
                </div>
                <div class="program-detail-content">
                    <h3>${p.name || ''}</h3>
                    <p>${p.description || ''}</p>
                    <a href="${applyLink}" target="_blank" rel="noopener" class="btn btn-primary">Apply Now</a>
                </div>
            </div>
        `;
    }).join('');

    // Trigger reveal animation (dynamically added cards need .active added here)
    const revealEls = grid.querySelectorAll('.reveal');
    revealEls.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('active');
        }, i * 100);
    });
});
