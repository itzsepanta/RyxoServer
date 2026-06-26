/**
 * RyxoServer Frontend Telemetry Interface Client Engine
 * Dynamically queries the Versioned REST API and parses cluster status structures.
 */

const ENDPOINT_URI = '/v1/monitor/status-pool';

async function synchronizeClusterTelemetry() {
    const container = document.getElementById('telemetry-nodes-container');
    
    try {
        const response = await fetch(ENDPOINT_URI);
        if (!response.ok) throw new Error(`HTTP network error. Status: ${response.status}`);
        
        const clusterData = await response.json();
        
        // 1. Update Core Metadata Panel Badges
        document.getElementById('global-ratio').innerText = `${clusterData.globalUptimeRatio}%`;
        document.getElementById('metric-active-count').innerText = clusterData.activeMonitorsCount;
        
        const incidentCountElement = document.getElementById('metric-incident-count');
        incidentCountElement.innerText = clusterData.incidentMonitorsCount;
        
        if (clusterData.incidentMonitorsCount > 0) {
            incidentCountElement.className = 'has-incidents';
        } else {
            incidentCountElement.className = 'zero-incidents';
        }

        // 2. Clear loader template and evaluate inner loops
        container.innerHTML = '';
        
        if (!clusterData.monitors || clusterData.monitors.length === 0) {
            container.innerHTML = `<div class="skeleton-loader">No active monitoring targets mapped inside RyxoServer.</div>`;
            return;
        }

        // 3. Compile structural interface rows dynamically
        clusterData.monitors.forEach(monitor => {
            
            // Build the exact modular micro timeline bit elements
            let timelineBarsHtml = '';
            monitor.heartbeats24h.forEach(bit => {
                const labelTitle = bit === 1 ? 'Pulse Check: Operational [UP]' : 'Pulse Check: System Outage Event [DOWN]';
                timelineBarsHtml += `<div class="pulse-bar bit-${bit}" title="${labelTitle}"></div>`;
            });

            const monitorRowElement = document.createElement('div');
            monitorRowElement.className = 'monitor-row';
            
            monitorRowElement.innerHTML = `
                <div class="node-meta">
                    <h4>${escapeHtml(monitor.name)}</h4>
                    <span>${monitor.protocol} ➔ ${escapeHtml(monitor.target)}</span>
                </div>
                <div>
                    <div class="status-badge ${monitor.status}">${monitor.status}</div>
                </div>
                <div class="pulse-timeline">
                    ${timelineBarsHtml}
                </div>
                <div class="node-analytics">
                    <div class="node-latency" style="color: ${monitor.status === 'UP' ? '#06b6d4' : '#ef4444'}">
                        ${monitor.status === 'UP' ? monitor.currentLatencyMs + ' ms' : '--'}
                    </div>
                    <div class="node-ratio">Ratio: ${monitor.uptimeRatio}%</div>
                </div>
            `;
            
            container.appendChild(monitorRowElement);
        });

    } catch (error) {
        console.error("Critical stream mapping fault encountered:", error);
        container.innerHTML = `
            <div class="skeleton-loader" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3)">
                Failed to bridge communications with RyxoServer Telemetry Pipelines. Re-attempting handshake...
            </div>
        `;
    }
}

/**
 * XSS Mitigation Engine to secure layout strings parsing
 */
function escapeHtml(unsafeString) {
    return unsafeString
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Instantiate automated cyclic synchronization intervals (Every 5 seconds)
synchronizeClusterTelemetry();
setInterval(synchronizeClusterTelemetry, 5000);