/* ================================================
   BTRC - Projects Page Rendering
   Renders project cards from the BTRCStore (API or
   bundled fallback data) and enables category filtering.
   ================================================ */

document.addEventListener('DOMContentLoaded', async function() {
    const grid = document.getElementById('projects-grid');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    if (!grid) return;

    // Load projects
    const projects = await BTRCStore.getCollection('projects');
    let currentFilter = 'all';

    function renderProjects() {
        const filtered = currentFilter === 'all'
            ? projects
            : projects.filter(p => (p.category || '') === currentFilter);

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="empty-state">No projects found in this category.</p>';
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const catLabel = p.categoryLabel || p.category || 'Project';
            const img = p.image
                ? '<img src="' + p.image + '" alt="' + (p.name || 'Project') + '" loading="lazy">'
                : '<span>' + (p.name || 'Project') + '</span>';

            // Details button: navigate to details link if provided, otherwise disabled
            let detailsBtn;
            if (p.detailsLink) {
                detailsBtn = '<a href="' + p.detailsLink + '" target="_blank" rel="noopener" class="btn btn-outline">View Details</a>';
            } else {
                detailsBtn = '<button class="btn btn-outline" disabled>No Details</button>';
            }

            return `
                <div class="project-card" data-category="${p.category || ''}">
                    <div class="project-image">
                        ${img}
                        <span class="project-tag">${catLabel}</span>
                    </div>
                    <div class="project-info">
                        <h3>${p.name || ''}</h3>
                        <p>${p.description || ''}</p>
                        ${detailsBtn}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Build filter buttons dynamically from unique categories
    function buildFilters() {
        if (!filterButtonsContainer) return;
        const cats = {};
        projects.forEach(p => {
            const c = p.category;
            const label = p.categoryLabel || c;
            if (c && !cats[c]) cats[c] = label;
        });

        let html = '<button class="filter-btn active" data-filter="all">All</button>';
        Object.keys(cats).forEach(c => {
            html += `<button class="filter-btn" data-filter="${c}">${cats[c]}</button>`;
        });
        filterButtonsContainer.innerHTML = html;

        filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderProjects();
            });
        });
    }

    buildFilters();
    renderProjects();

    // Add reveal animation to cards
    grid.querySelectorAll('.project-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 50);
    });
});
