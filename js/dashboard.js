/* ================================================
   BTRC - Bamenda Technological Research Center
   Dashboard JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initProgressBars();
    initCharts();
});

/* ================================================
   DASHBOARD INITIALIZATION
   ================================================ */
function initDashboard() {
    const dashboardSection = document.querySelector('.dashboard');
    
    if (!dashboardSection) return;
    
    // Dashboard statistics data
    const stats = {
        activeProjects: 24,
        completedProjects: 156,
        studentsInvolved: 842,
        technologyAreas: 8
    };
    
    // Animate dashboard counters
    animateDashboardCounters(stats);
    
    // Add dashboard interactions
    initDashboardInteractions();
}

/* ================================================
   DASHBOARD COUNTERS
   ================================================ */
function animateDashboardCounters(stats) {
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    if (dashboardCards.length === 0) return;
    
    let animated = false;
    
    const animate = () => {
        if (animated) return;
        
        const dashboardSection = document.querySelector('.dashboard');
        if (!dashboardSection) return;
        
        const sectionTop = dashboardSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight - 100) {
            dashboardCards.forEach((card, index) => {
                const numberEl = card.querySelector('h3');
                if (!numberEl) return;
                
                let target;
                let suffix = '';
                
                switch(index) {
                    case 0:
                        target = stats.activeProjects;
                        break;
                    case 1:
                        target = stats.completedProjects;
                        break;
                    case 2:
                        target = stats.studentsInvolved;
                        break;
                    case 3:
                        target = stats.technologyAreas;
                        break;
                    default:
                        target = 0;
                }
                
                // Animate the number
                animateNumber(numberEl, target, suffix);
            });
            
            animated = true;
        }
    };
    
    // Initial check
    animate();
    
    // Scroll event
    window.addEventListener('scroll', animate);
}

function animateNumber(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(start + (target - start) * easeOut);
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target + suffix;
        }
    }
    
    requestAnimationFrame(update);
}

/* ================================================
   DASHBOARD INTERACTIONS
   ================================================ */
function initDashboardInteractions() {
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/* ================================================
   PROGRESS BARS
   ================================================ */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    if (progressBars.length === 0) return;
    
    let animated = false;
    
    const animate = () => {
        if (animated) return;
        
        const progressSection = document.querySelector('.progress-section');
        if (!progressSection) {
            // Animate anyway if no section found
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                if (targetWidth) {
                    bar.style.width = targetWidth;
                }
            });
            animated = true;
            return;
        }
        
        const sectionTop = progressSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight - 100) {
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                if (targetWidth) {
                    // Add a small delay for staggered effect
                    setTimeout(() => {
                        bar.style.width = targetWidth;
                    }, 100);
                }
            });
            animated = true;
        }
    };
    
    // Initial check
    animate();
    
    // Scroll event
    window.addEventListener('scroll', animate);
}

/* ================================================
   CHARTS (PURE JAVASCRIPT)
   ================================================ */
function initCharts() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    if (chartContainers.length === 0) return;
    
    chartContainers.forEach(container => {
        const chartType = container.getAttribute('data-chart-type');
        
        switch(chartType) {
            case 'bar':
                createBarChart(container);
                break;
            case 'pie':
                createPieChart(container);
                break;
            case 'line':
                createLineChart(container);
                break;
            default:
                break;
        }
    });
}

/* ================================================
   BAR CHART
   ================================================ */
function createBarChart(container) {
    const data = JSON.parse(container.getAttribute('data-chart') || '[]');
    if (data.length === 0) return;
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const width = container.offsetWidth || 400;
    const height = container.offsetHeight || 300;
    
    canvas.width = width;
    canvas.height = height;
    
    const barWidth = (width - 60) / data.length - 20;
    const maxValue = Math.max(...data.map(d => d.value));
    
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 60);
        const x = 50 + index * (barWidth + 20);
        const y = height - 30 - barHeight;
        
        // Bar
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0d9488';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-medium').trim() || '#475569';
        ctx.font = '12px Open Sans';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, height - 10);
        
        // Value
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim() || '#1e293b';
        ctx.font = 'bold 12px Montserrat';
        ctx.fillText(item.value, x + barWidth / 2, y - 5);
    });
}

/* ================================================
   PIE CHART
   ================================================ */
function createPieChart(container) {
    const data = JSON.parse(container.getAttribute('data-chart') || '[]');
    if (data.length === 0) return;
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const size = Math.min(container.offsetWidth || 300, container.offsetHeight || 300);
    
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - 40) / 2;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = -Math.PI / 2;
    
    const colors = [
        '#0d9488', '#0a2540', '#14b8a6', '#1a3a5c', 
        '#0f766e', '#061829', '#20c997', '#1e293b'
    ];
    
    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Label
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
        
        if (item.value / total > 0.1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, labelX, labelY);
        }
        
        startAngle += sliceAngle;
    });
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#ffffff';
    ctx.fill();
}

/* ================================================
   LINE CHART
   ================================================ */
function createLineChart(container) {
    const data = JSON.parse(container.getAttribute('data-chart') || '[]');
    if (data.length === 0) return;
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const width = container.offsetWidth || 400;
    const height = container.offsetHeight || 200;
    
    canvas.width = width;
    canvas.height = height;
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;
    
    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--neutral-dark').trim() || '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0d9488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0d9488';
        ctx.fill();
        
        // Label
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-medium').trim() || '#475569';
        ctx.font = '10px Open Sans';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x, height - 10);
    });
}

/* ================================================
   STATISTICS ANIMATION
   ================================================ */
function initStatsAnimation() {
    const statItems = document.querySelectorAll('.stat-item');
    
    if (statItems.length === 0) return;
    
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize stats animation
document.addEventListener('DOMContentLoaded', initStatsAnimation);

/* ================================================
   EXPORT FUNCTIONS
   ================================================ */
window.BTRCDashboard = {
    initDashboard,
    initProgressBars,
    initCharts,
    animateNumber
};
