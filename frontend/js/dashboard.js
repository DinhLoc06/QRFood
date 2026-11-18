(function () {
    'use strict';

    var el = document.getElementById('srms-dashboard-json');
    var boot = el ? JSON.parse(el.textContent || '{}') : {};

    function makeChart(id, cfg) {
        var canvas = document.getElementById(id);
        if (!canvas || typeof Chart === 'undefined') return null;
        var ctx = canvas.getContext('2d');
        return ctx ? new Chart(ctx, cfg) : null;
    }

    var revChart = makeChart('revenueChart', {
        type: 'line',
        data: {
            labels: (boot.revenueByDay || []).map(function (r) { return String(r.day || ''); }),
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: (boot.revenueByDay || []).map(function (r) { return Number(r.total); }),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.15)',
                fill: true,
                tension: 0.3,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    });

    var statusChart = makeChart('statusChart', {
        type: 'doughnut',
        data: {
            labels: (boot.statusCounts || []).map(function (s) { return String(s.status); }),
            datasets: [{
                data: (boot.statusCounts || []).map(function (s) { return Number(s.cnt); }),
                backgroundColor: ['#facc15', '#3b82f6', '#34d399', '#94a3b8'],
            }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });

    function money(n) {
        return Math.round(Number(n)).toLocaleString('vi-VN') + ' ₫';
    }

    async function refresh() {
        try {
            var response = await window.SRMS.apiFetch('api/stats');
            if (!response || !response.success || !response.data) return;
            var data = response.data;
            var fields = {
                statTotalOrders: String(data.total_orders),
                statRevenue: money(data.revenue),
                statOrdersToday: String(data.orders_today),
                statRevenueToday: money(data.revenue_today),
                statOccupied: String(data.tables_occupied),
                statAvailable: String(data.tables_available),
            };
            Object.keys(fields).forEach(function (id) {
                var node = document.getElementById(id);
                if (node) node.textContent = fields[id];
            });

            var popular = document.getElementById('popularList');
            if (popular && Array.isArray(data.popular)) {
                if (!data.popular.length) {
                    popular.innerHTML = '<p class="text-muted mt-0">Chưa có đơn hàng hoàn tất.</p>';
                } else {
                    popular.innerHTML = '<ul class="kitchen-items">' + data.popular.map(function (item) {
                        return '<li><strong>' + String(item.name).replace(/&/g, '&amp;').replace(/</g, '&lt;') +
                            '</strong> — ' + Number(item.total_qty) + ' đã bán</li>';
                    }).join('') + '</ul>';
                }
            }

            if (revChart && data.revenue_by_day) {
                revChart.data.labels = data.revenue_by_day.map(function (row) { return String(row.day); });
                revChart.data.datasets[0].data = data.revenue_by_day.map(function (row) { return Number(row.total); });
                revChart.update();
            }
            if (statusChart && data.status_counts) {
                statusChart.data.labels = data.status_counts.map(function (row) { return String(row.status); });
                statusChart.data.datasets[0].data = data.status_counts.map(function (row) { return Number(row.cnt); });
                statusChart.update();
            }
        } catch (error) {
            window.SRMS.toast(error.message || 'Không thể làm mới bảng tổng quan', true);
        }
    }

    var button = document.getElementById('refreshDashboard');
    if (button) button.addEventListener('click', refresh);
    window.setInterval(refresh, window.SRMS.pollMs || 8000);
})();
