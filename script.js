let valueChart, timeChart, roiChart, speedToLeadChart;
let originalCumulativeCost = [];

document.getElementById('recurring-checkbox').addEventListener('change', handleRecurringCheckbox);

function openTab(tabName) {
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    let tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";

    resetCharts();
}

function resetCharts() {
    if (roiChart) roiChart.destroy();
    if (timeChart) timeChart.destroy();
    if (valueChart) valueChart.destroy();
    if (speedToLeadChart) speedToLeadChart.destroy();

    document.getElementById('monthly-left').innerHTML = '';
    document.getElementById('roi').innerHTML = '';
    document.getElementById('time-saved-day').innerHTML = '';
    document.getElementById('time-saved-week').innerHTML = '';
    document.getElementById('time-saved-month').innerHTML = '';
    document.getElementById('projected-sales').innerHTML = '';

    document.getElementById('discount-btn').style.display = 'none';
    document.getElementById('pricing-fields').style.display = 'none';
}

function calculateInboundROI() {
    const clientValue = parseFloat(document.getElementById('client-value').value) || 0;
    const missedCalls = parseFloat(document.getElementById('missed-calls').value) || 0;
    const closeRate = parseFloat(document.getElementById('close-rate').value) / 100 || 0;
    const humanQualTime = parseFloat(document.getElementById('qual-time-human-inbound').value) || 0;
    const aiQualTime = parseFloat(document.getElementById('ai-qual-time-inbound').value) || 0;
    const startupCost = parseFloat(document.getElementById('startup-cost').value) || 0;
    const monthlyCost = parseFloat(document.getElementById('monthly-cost').value) || 0;
    const humanResponseTime = parseInt(document.getElementById('human-response-time').value);

    const missedCallsPerMonth = missedCalls * 4;
    let monthlyLeftOnTableAI = clientValue * missedCallsPerMonth * closeRate;

    if (document.getElementById('recurring-checkbox').checked) {
        monthlyLeftOnTableAI *= 12; // Assuming recurring revenue
    }

    const timeSavedPerCallAI = humanQualTime - aiQualTime;
    const timeSavedPerDay = (missedCalls / 7) * timeSavedPerCallAI;
    const timeSavedPerWeek = missedCalls * timeSavedPerCallAI;
    const timeSavedPerMonth = timeSavedPerWeek * 4;

    document.getElementById('monthly-left').innerHTML = `Monthly Net Value Left on Table: $${monthlyLeftOnTableAI.toFixed(2)}`;
    document.getElementById('roi').innerHTML = `Monthly ROI with AI: ${((monthlyLeftOnTableAI - (startupCost / 12) - monthlyCost) / (startupCost + monthlyCost) * 100).toFixed(2)}%`;
    document.getElementById('time-saved-day').innerHTML = `Time Saved per Day: ${timeSavedPerDay.toFixed(2)} hours`;
    document.getElementById('time-saved-week').innerHTML = `Time Saved per Week: ${timeSavedPerWeek.toFixed(2)} hours`;
    document.getElementById('time-saved-month').innerHTML = `Time Saved per Month: ${timeSavedPerMonth.toFixed(2)} hours`;

    document.getElementById('discount-btn').style.display = 'block';

    generateCumulativeChartMonthly(monthlyCost, monthlyLeftOnTableAI, monthlyLeftOnTableAI * 0.7, startupCost);
    generateTimeSavedChart(timeSavedPerDay, timeSavedPerWeek, timeSavedPerMonth);
    generateSpeedToLeadChart(humanResponseTime, closeRate);
}

function calculateOutboundROI() {
    const clientValue = parseFloat(document.getElementById('avg-client-value-outbound').value) || 0;
    const leadsPerDay = parseFloat(document.getElementById('leads-per-day').value) || 0;
    const closeRate = parseFloat(document.getElementById('close-rate-outbound').value) / 100 || 0;
    const humanQualTime = parseFloat(document.getElementById('qual-time-human-outbound').value) || 0;
    const aiQualTime = parseFloat(document.getElementById('ai-qual-time-outbound').value) || 0;
    const startupCost = parseFloat(document.getElementById('startup-cost').value) || 0;
    const monthlyCost = parseFloat(document.getElementById('monthly-cost').value) || 0;
    const humanResponseTime = parseInt(document.getElementById('human-response-time-outbound').value);

    const leadsPerMonth = leadsPerDay * 30;
    let monthlyLeftOnTableAI = clientValue * leadsPerMonth * closeRate;

    if (document.getElementById('recurring-checkbox').checked) {
        monthlyLeftOnTableAI *= 12; // Assuming recurring revenue
    }

    const timeSavedPerCallAI = humanQualTime - aiQualTime;
    const timeSavedPerDay = (leadsPerDay / 7) * timeSavedPerCallAI;
    const timeSavedPerWeek = leadsPerDay * timeSavedPerCallAI;
    const timeSavedPerMonth = timeSavedPerWeek * 4;

    document.getElementById('monthly-left').innerHTML = `Monthly Net Value Left on Table: $${monthlyLeftOnTableAI.toFixed(2)}`;
    document.getElementById('roi').innerHTML = `Monthly ROI with AI: ${((monthlyLeftOnTableAI - (startupCost / 12) - monthlyCost) / (startupCost + monthlyCost) * 100).toFixed(2)}%`;
    document.getElementById('time-saved-day').innerHTML = `Time Saved per Day: ${timeSavedPerDay.toFixed(2)} hours`;
    document.getElementById('time-saved-week').innerHTML = `Time Saved per Week: ${timeSavedPerWeek.toFixed(2)} hours`;
    document.getElementById('time-saved-month').innerHTML = `Time Saved per Month: ${timeSavedPerMonth.toFixed(2)} hours`;

    document.getElementById('discount-btn').style.display = 'block';

    generateCumulativeChartMonthly(monthlyCost, monthlyLeftOnTableAI, monthlyLeftOnTableAI * 0.7, startupCost);
    generateTimeSavedChart(timeSavedPerDay, timeSavedPerWeek, timeSavedPerMonth);
    generateSpeedToLeadChart(humanResponseTime, closeRate);
}

function generateCumulativeChartMonthly(monthlySimpleTalkFee, monthlySalesWithAI, monthlySalesWithoutAI, startupCost, discountedSimpleTalkFee = null) {
    const roiCtx = document.getElementById('roiChart').getContext('2d');
    if (roiChart) roiChart.destroy();

    if (originalCumulativeCost.length === 0) {
        let cumulativeCost = [startupCost];
        for (let i = 1; i < 12; i++) {
            cumulativeCost.push(cumulativeCost[i - 1] + monthlySimpleTalkFee);
        }
        originalCumulativeCost = cumulativeCost;
    }

    let cumulativeSalesWithAI = [monthlySalesWithAI];
    let cumulativeSalesWithoutAI = [monthlySalesWithoutAI];
    let cumulativeDiscountedCost = discountedSimpleTalkFee ? [startupCost] : null;

    for (let i = 1; i < 12; i++) {
        cumulativeSalesWithAI.push(cumulativeSalesWithAI[i - 1] + monthlySalesWithAI);
        cumulativeSalesWithoutAI.push(cumulativeSalesWithoutAI[i - 1] + monthlySalesWithoutAI);

        if (discountedSimpleTalkFee) {
            cumulativeDiscountedCost.push(cumulativeDiscountedCost[i - 1] + discountedSimpleTalkFee);
        }
    }

    const datasets = [
        {
            label: 'Cumulative SimpleTalk Monthly Fees ($)',
            data: originalCumulativeCost,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        },
        {
            label: 'Cumulative Projected Sales with AI ($)',
            data: cumulativeSalesWithAI,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        },
        {
            label: 'Cumulative Projected Sales without AI ($)',
            data: cumulativeSalesWithoutAI,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }
    ];

    if (discountedSimpleTalkFee) {
        datasets.push({
            label: 'Cumulative Discounted SimpleTalk Fees ($)',
            data: cumulativeDiscountedCost,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        });
    }

    roiChart = new Chart(roiCtx, {
        type: 'line',
        data: {
            labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'],
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (Months)'
                    }
                }
            },
            plugins: {
                datalabels: {
                    align: 'top',
                    anchor: 'end',
                    formatter: function (value) {
                        return `$${value.toFixed(2)}`;
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function generateTimeSavedChart(timeSavedPerDay, timeSavedPerWeek, timeSavedPerMonth) {
    const timeCtx = document.getElementById('timeChart').getContext('2d');
    if (timeChart) timeChart.destroy();

    timeChart = new Chart(timeCtx, {
        type: 'line',
        data: {
            labels: ['Per Day', 'Per Week', 'Per Month'],
            datasets: [{
                label: 'Time Saved (hours)',
                data: [timeSavedPerDay, timeSavedPerWeek, timeSavedPerMonth],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            plugins: {
                datalabels: {
                    align: 'top',
                    anchor: 'end',
                    formatter: function (value) {
                        return `${value.toFixed(2)} hours`;
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function generateSpeedToLeadChart(humanResponseTime, closeRate) {
    const speedToLeadCtx = document.getElementById('speedToLeadChart').getContext('2d');
    if (speedToLeadChart) speedToLeadChart.destroy();

    const aiConversionRate = closeRate * 1.5; // AI conversion rate is 150% of the inputted close rate
    const humanConversionRate = closeRate;

    speedToLeadChart = new Chart(speedToLeadCtx, {
        type: 'bar',
        data: {
            labels: ['AI Response (1 min)', `Human Response (${humanResponseTime} min)`],
            datasets: [{
                label: 'Conversion Rate (%)',
                data: [aiConversionRate * 100, humanConversionRate * 100],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    }
                }
            },
            plugins: {
                datalabels: {
                    align: 'top',
                    anchor: 'end',
                    formatter: function (value) {
                        return `${value.toFixed(2)}%`;
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function showDiscount() {
    document.getElementById('pricing-fields').style.display = 'block';
    document.getElementById('startup-cost').addEventListener('change', applyDiscount);
    document.getElementById('monthly-cost').addEventListener('change', applyDiscount);
}

function applyDiscount() {
    let startupCost = parseFloat(document.getElementById('startup-cost').value) || 0;
    let monthlyCost = parseFloat(document.getElementById('monthly-cost').value) || 0;

    let clientValue = parseFloat(document.getElementById('client-value').value) || 0;
    let missedCalls = parseFloat(document.getElementById('missed-calls').value) || 0;
    let closeRate = parseFloat(document.getElementById('close-rate').value) / 100 || 0;

    let missedCallsPerMonth = missedCalls * 4;
    let monthlyLeftOnTableAI = clientValue * missedCallsPerMonth * closeRate;

    if (document.getElementById('recurring-checkbox').checked) {
        monthlyLeftOnTableAI *= 12;
    }

    generateCumulativeChartMonthly(monthlyCost, monthlyLeftOnTableAI, monthlyLeftOnTableAI * 0.7, startupCost, monthlyCost);
}

function handleRecurringCheckbox() {
    const currentTab = document.getElementById('inbound').style.display !== 'none' ? 'inbound' : 'outbound';
    if (currentTab === 'inbound') {
        calculateInboundROI();
    } else {
        calculateOutboundROI();
    }
}