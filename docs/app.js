/**
 * RyxoServer Architecture Core Manual Script
 * Automatically fetches and synchronizes with runtime compiled NestJS dynamic blueprints.
 */
window.onload = function() {
    
    // --- PART 1: SWAGGER LIVE ENGINE INSTANTIATION ---
    // This dynamically links to your real NestJS backend endpoints via the fixed /docs-json route
    const uiEngine = SwaggerUIBundle({
        url: "/docs-json", // Dynamically pulls 100% genuine and real backend controllers maps
        dom_id: '#swagger-ui-mount',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        persistAuthorization: true,
        docExpansion: "list",
        filter: true, // Enables high-speed live search over your actual routes
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2
    });

    // Make engine references persistent within active window contexts
    window.ui = uiEngine;

    // --- PART 2: THEME CONTEXT SWAP REACTION LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const rootHtml = document.documentElement;

    // Load custom configuration preferences from local storage systems
    const savedTheme = localStorage.getItem('ryxo_interface_theme') || 'dark';
    rootHtml.setAttribute('data-theme', savedTheme);

    // Click handler event pipeline for seamless theme shifting
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootHtml.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Execute operational modifications
        rootHtml.setAttribute('data-theme', nextTheme);
        localStorage.setItem('ryxo_interface_theme', nextTheme);
    });

    console.log("RYXO REAL-TIME BLUEPRINT SYNCHRONIZED SUCCESSFULLY WITH NESTJS EMITTER.");
};