/**
 * dashboard.js
 * Handles data aggregation and Chart.js visualization for the Emotion Dashboard.
 * Designed to be modular for SaaS expansion.
 */

const Dashboard = {
    chart: null,
    
    // Aggregation data over the session
    stats: {
        totalReadings: 0,
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        neutral: 0
    },

    init: function() {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        
        // Define SaaS Theme Chart colors matching style.css
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', sans-serif";

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Neutral', 'Surprised', 'Sad', 'Angry'],
                datasets: [{
                    label: 'Emotion Frequency',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.6)',  // Happy (Green)
                        'rgba(148, 163, 184, 0.6)', // Neutral (Gray)
                        'rgba(192, 132, 252, 0.6)', // Surprised (Purple)
                        'rgba(99, 102, 241, 0.6)',  // Sad (Blue)
                        'rgba(239, 68, 68, 0.6)'    // Angry (Red)
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(148, 163, 184, 1)',
                        'rgba(192, 132, 252, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 200 // Faster updates for real-time feel
                }
            }
        });
    },

    update: function(emotionLabel) {
        if(!this.chart) return;

        // Record Reading
        this.stats.totalReadings++;
        
        // Map general label to our stats
        if(this.stats[emotionLabel] !== undefined) {
            this.stats[emotionLabel]++;
        }

        // Update Chart Data array based on ordering: ['Happy', 'Neutral', 'Surprised', 'Sad', 'Angry']
        this.chart.data.datasets[0].data = [
            this.stats.happy,
            this.stats.neutral,
            this.stats.surprised,
            this.stats.sad,
            this.stats.angry
        ];
        
        // Call update on the specific Chart instance smoothly
        this.chart.update('none'); // Update without full animation to prevent seizure-ui

        this.updateStatsUI();
    },

    updateStatsUI: function() {
        // Calculate SaaS percentages
        const total = this.stats.totalReadings;
        if(total === 0) return;

        const happyPercent = ((this.stats.happy / total) * 100).toFixed(1);
        const sadPercent = ((this.stats.sad / total) * 100).toFixed(1);

        document.getElementById('stat-happy-percent').innerText = `${happyPercent}%`;
        document.getElementById('stat-sad-percent').innerText = `${sadPercent}%`;
        document.getElementById('stat-total-count').innerText = total;
    }
};