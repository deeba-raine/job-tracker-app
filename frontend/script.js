let statusChartInstance = null;
let monthlyChartInstance = null;

Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
Chart.defaults.color = '#9e9484';

const chartTitle = text => ({
  display: true,
  text,
  color: '#655e53',
  font: { size: 13, weight: '600' }
});

const statusColors = {
  Applied: '#c5dfef',
  Interview: '#bde8e0',
  Offer: '#bcebc9',
  Rejected: '#f8c3cb'
};

function updateDateCards() {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  const dateEl = document.getElementById('current-date');
  const dayEl = document.getElementById('current-day');

  if (dateEl) dateEl.textContent = dateFormatted;
  if (dayEl) dayEl.textContent = dayOfWeek;
}

function extractYearMonth(dateStr) {
  if (!dateStr) return null;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[1];
      const year = parts[2];
      const cleanYear = year.length === 2 ? `20${year}` : year;
      const cleanMonth = String(month).padStart(2, '0');
      return `${cleanYear}-${cleanMonth}`;
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  return null;
}

function updateDashboard() {
  const rows = document.querySelectorAll('.applications-table tbody tr');
  const statusCounts = {};
  const monthCounts = {};

  rows.forEach(row => {
    const statusEl = row.querySelector('.status');
    if (statusEl) {
      const status = statusEl.textContent.trim();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    const dateCell = row.children[4] || row.children[2];
    if (dateCell) {
      const key = extractYearMonth(dateCell.textContent.trim());
      if (key) {
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    }
  });

  const totalCountEl = document.getElementById('totalCount');
  if (totalCountEl) {
    totalCountEl.textContent = rows.length;
  }

  const statusCanvas = document.getElementById('statusChart');
  if (statusCanvas) {
    if (statusChartInstance) statusChartInstance.destroy();

    const labels = Object.keys(statusCounts);
    statusChartInstance = new Chart(statusCanvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: labels.map(s => statusColors[s] || '#ddd'),
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          title: chartTitle('Application Status'),
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
          }
        }
      }
    });
  }

  const monthlyCanvas = document.getElementById('monthlyChart');
  if (monthlyCanvas) {
    if (monthlyChartInstance) monthlyChartInstance.destroy();

    const sortedMonthKeys = Object.keys(monthCounts).sort();

    monthlyChartInstance = new Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: sortedMonthKeys.map(k => {
          const [y, m] = k.split('-');
          return new Date(y, m - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          data: sortedMonthKeys.map(k => monthCounts[k]),
          backgroundColor: '#f5b7b1',
          hoverBackgroundColor: '#ec9b93',
          borderRadius: 6,
          maxBarThickness: 36
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          title: chartTitle('Monthly Applied'),
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
            grid: { color: '#f1ede5' }
          }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDateCards();
  updateDashboard();

  document.querySelector('.applications-table tbody').addEventListener('click', event => {
    const button = event.target.closest('.delete-btn');
    if (!button) return;

    button.closest('tr').remove();
    updateDashboard();
  });

});