/* ================================================
   BTRC - Bamenda Technological Research Center
   Filter JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
    initProjectFilter();
});

/* ================================================
   PROJECT FILTER
   ================================================ */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (filterButtons.length === 0 || projectCards.length === 0) return;
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            filterProjects(filter, projectCards);
        });
    });
    
    // Add animation to cards
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

/* ================================================
   FILTER PROJECTS
   ================================================ */
function filterProjects(filter, cards) {
    let visibleCount = 0;
    
    cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            // Show card
            card.classList.remove('hide');
            
            // Add animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, visibleCount * 50);
            
            visibleCount++;
        } else {
            // Hide card
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.classList.add('hide');
            }, 300);
        }
    });
    
    // Update results message
    updateFilterMessage(filter, visibleCount);
}

/* ================================================
   FILTER MESSAGE
   ================================================ */
function updateFilterMessage(filter, count) {
    let messageContainer = document.querySelector('.filter-message');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'filter-message';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.padding = '20px';
        messageContainer.style.color = 'var(--text-medium)';
        
        const projectsGallery = document.querySelector('.projects-gallery .container');
        if (projectsGallery) {
            projectsGallery.appendChild(messageContainer);
        }
    }
    
    const filterName = filter === 'all' ? 'All Projects' : filter.replace('-', ' ');
    messageContainer.innerHTML = `<p>Showing ${count} ${filterName}</p>`;
    
    // Hide message after 2 seconds
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            messageContainer.remove();
        }, 300);
    }, 2000);
}

/* ================================================
   SEARCH FILTER (Optional Enhancement)
   ================================================ */
function initSearchFilter() {
    const searchInput = document.querySelector('.project-search');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    });
}

// Initialize search filter
document.addEventListener('DOMContentLoaded', initSearchFilter);

/* ================================================
   SORT PROJECTS (Optional Enhancement)
   ================================================ */
function initSortProjects() {
    const sortSelect = document.querySelector('.project-sort');
    
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        const projectGrid = document.querySelector('.projects-grid');
        const projectCards = Array.from(document.querySelectorAll('.project-card'));
        
        // Sort cards
        projectCards.sort((a, b) => {
            const aTitle = a.querySelector('h3').textContent;
            const bTitle = b.querySelector('h3').textContent;
            
            if (sortBy === 'az') {
                return aTitle.localeCompare(bTitle);
            } else if (sortBy === 'za') {
                return bTitle.localeCompare(aTitle);
            }
            
            return 0;
        });
        
        // Re-append sorted cards
        projectCards.forEach(card => {
            projectGrid.appendChild(card);
        });
    });
}

// Initialize sort
document.addEventListener('DOMContentLoaded', initSortProjects);

/* ================================================
   EXPORT FUNCTIONS
   ================================================ */
window.BTRCFilter = {
    initProjectFilter,
    filterProjects,
    initSearchFilter,
    initSortProjects
};
