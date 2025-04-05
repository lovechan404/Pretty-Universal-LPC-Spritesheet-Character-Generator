// Load CSS
function injectCustomCSS() {
    return new Promise((resolve) => {
        // Skip if already loaded
        if (document.querySelector('link[href*="lc-pretty.css"]')) {
            resolve();
            return;
        }

        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'lc/lc-pretty.css';

        // Load after chargen.css or as last resource
        const target = document.querySelector('link[href*="chargen.css"]') ||
            document.querySelector('link[rel="stylesheet"]:last-of-type') ||
            document.head;

        cssLink.onload = function () {
            // Add viewport meta tag after CSS loads
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=1, initial-scale=1';
            document.head.appendChild(viewportMeta);
            resolve();
        };

        target.after(cssLink); // Insert after specific target
    });
}

// Enable drag-to-scroll functionality for an element
function enableDragToScroll(element) {
    let isMouseDown = false;
    let startX, startY;
    let scrollLeft, scrollTop;

    element.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.pageX - element.offsetLeft;
        startY = e.pageY - element.offsetTop;
        scrollLeft = element.scrollLeft;
        scrollTop = element.scrollTop;
        element.style.cursor = 'grabbing';
        element.style.userSelect = 'none';
    });

    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        element.style.cursor = 'grab';
        element.style.removeProperty('user-select');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const y = e.pageY - element.offsetTop;
        const walkX = (x - startX) * 2; // Adjust multiplier for faster/slower scrolling
        const walkY = (y - startY) * 2;
        element.scrollLeft = scrollLeft - walkX;
        element.scrollTop = scrollTop - walkY;
    });
}

function addCustomHeaderAttribution() {
    const header = document.getElementById('header-left');
    if (!header) return;
    
    // Create a container for your attribution
    const attribution = document.createElement('div');
    attribution.className = 'custom-attribution';
    attribution.innerHTML = `
        <div style="font-size: 0.8em;">
            Prettify your version at: <a href="https://github.com/lovechan404/Pretty-Universal-LPC-Spritesheet-Character-Generator" target="_blank">lovechan404/Pretty-Universal-LPC-Spritesheet-Character-Generator</a>✨
                <br>
            Forked from <a href="https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator">LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator</a>
        </div>
    `;
    
    // Append to the header
    header.appendChild(attribution);
}

// Wait for both DOM and chargen.js to be fully ready
function groupSections() {
    // Check if all required sections exist
    const sections = {
        nav: [
            document.getElementById('controls'),
            document.getElementById('chooser')
        ],
        display: [
            document.getElementById('header-left'),
            document.getElementById('preview-animations'),
            document.getElementById('preview')
        ]
    };

    // Verify all sections exist
    const allSectionsExist = [...sections.nav, ...sections.display].every(el => el);
    if (!allSectionsExist) return false;

    // Create group containers
    const navGroup = document.createElement('div');
    navGroup.id = 'main-navigation';

    const displayGroup = document.createElement('div');
    displayGroup.id = 'main-display';

    // Insert groups into DOM
    sections.nav[0].parentNode.insertBefore(navGroup, sections.nav[0]);
    sections.display[0].parentNode.insertBefore(displayGroup, sections.display[0]);

    // Move sections into groups
    sections.nav.forEach(section => navGroup.appendChild(section));
    sections.display.forEach(section => displayGroup.appendChild(section));

    // Enable drag-to-scroll for preview
    const preview = document.getElementById('preview');
    if (preview) {
        preview.style.cursor = 'grab'; // Set initial cursor
        preview.style.overflow = 'auto'; // Ensure it's scrollable
        enableDragToScroll(preview);
    }

    addCustomHeaderAttribution();

    return true;
}


function addControlHoverInfo() {
    const controls = document.getElementById('controls');
    if (!controls) return;

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'control-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.backgroundColor = '#334017';
    tooltip.style.color = '#f7ffe7';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontFamily = 'VCR_OSD_MONO, monospace';
    tooltip.style.fontSize = '12px';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s';
    tooltip.style.zIndex = '1000';
    document.body.appendChild(tooltip);

    // Tooltip content definitions
    const tooltipInfo = {
        'saveAsPNG': 'Snag the whole spritesheet as a glorious PNG. Frame it. Love it.',
        'generateSheetCreditsTxt': 'Spit out a humble brag credits file (TXT style).',
        'generateSheetCreditsCsv': 'Like TXT, but for spreadsheet nerds.',
        'exportSplitAnimations': 'Chop up your animations like a sushi chef (with metadata!).',
        'exportToClipboard': 'Copy your creation into the digital abyss (aka clipboard).',
        'importFromClipboard': 'Summon a character from the clipboard dimension.',
        'resetAll': 'Blow it all up and start fresh. No regrets. Probably.',
        'replacePinkMask': 'Goodbye aggressive pink! Hello sweet, sweet transparency.',
        'match_body-color': 'Magically make body match the head — no Nina Tucker.',
        'collapse': 'Shove the everything under the sofa. So tidy!',
        'expand': 'Unpack me my selected settings, sire.',
        'displayMode-compact': 'Shrink like... hehe (˵ ¬ᴗ¬˵)',
        'searchbox': 'Hunt for character parts! Then... scroll. you will find them beautifully highlighted.'
    };


    // Add hover events to all buttons and inputs
    controls.querySelectorAll('button, input, a').forEach(control => {
        const controlId = control.id || control.className || control.name;
        
        if (tooltipInfo[controlId]) {
            control.addEventListener('mouseenter', (e) => {
                tooltip.textContent = tooltipInfo[controlId];
                tooltip.style.opacity = '1';
                
                // Position tooltip above the control
                const rect = control.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
            });

            control.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });

            // For better mobile touch support
            control.addEventListener('touchstart', (e) => {
                tooltip.textContent = tooltipInfo[controlId];
                tooltip.style.opacity = '1';
                const rect = control.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
                setTimeout(() => tooltip.style.opacity = '0', 2000);
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        tooltip.style.opacity = '0';
    });
}



// Implementation with multiple fallbacks
async function init() {
    // Wait for CSS to load
    await injectCustomCSS();

    // Try immediately
    if (groupSections()) {
        addControlHoverInfo();
        return;
    }

    // Fallback 1: Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (groupSections()) return;

        // Fallback 2: Poll for elements (for dynamic content)
        const retryInterval = setInterval(() => {
            if (groupSections()) {
                clearInterval(retryInterval);
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => clearInterval(retryInterval), 5000);
    });
}

// Start the process
init();