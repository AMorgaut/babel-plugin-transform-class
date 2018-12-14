'use strict';

const PANELS = chrome.devtools.panels;
const SOURCES_PANEL = PANELS.sources;

// Create the Testtools nodes/focused Sidebar Panel
let focusedNodesInterval;

function createTesttoolsFocusedNodes() {
    SOURCES_PANEL.createSidebarPane(
        "Focused Nodes (testtools)",
        function(sidebarPanel) {
            sidebarPanel.onShown.addListener(() => {
                updateFocusedNodes(sidebarPanel)
                focusedNodesInterval = setInterval(
                    () => updateFocusedNodes(sidebarPanel),
                    20000 + Math.random() * 2000
                );
            });
            sidebarPanel.onHidden.addListener(() => {
                clearInterval(focusedNodesInterval);
            });
        }
    );
}

async function updateFocusedNodes(sidebarPanel) {
    console.log(sidebarPanel);
    const list = await requestTesttools(
        GET, 'v2/nodes/focused', 'FOCUSED NODES'
    );
    console.log('list: ', list);
    return sidebarPanel.setObject({ nodes: list || ['coucou'] });
}
