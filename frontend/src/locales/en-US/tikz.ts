export const tikz = {
  // Auto complete related
  autoComplete: {
    completeExample: 'Complete Example',
    categories: {
      draw: 'Draw',
      shape: 'Shape',
      node: 'Node',
      style: 'Style',
      transform: 'Transform',
      math: 'Math',
      greek: 'Greek',
      symbol: 'Symbol',
      arrow: 'Arrow'
    }
  },
  
  // Content editor
  contentEditor: {
    title: 'TikZ Graphics',
    count: '({count}/3)',
    edit: 'Edit',
    preview: 'Preview',
    add: 'Add',
    addFirst: 'Add First Graphic',
    addDescription: 'Add TikZ graphics to enhance question expression',
    delete: 'Delete',
    graphNumber: 'Graphic {number}',
    placeholder: 'Enter TikZ code...'
  },
  
  // Content preview
  contentPreview: {
    title: 'Question Graphics',
    graphNumber: 'Graphic {number}'
  },
  
  // Editor
  editor: {
    title: 'TikZ Graphics Management',
    count: '{current}/{max}',
    addTikZ: 'Add TikZ Graphic',
    tikzNumber: 'TikZ Graphic #{number}',
    format: 'Format',
    svg: 'SVG',
    png: 'PNG',
    delete: 'Delete',
    tikzCode: 'TikZ Code',
    frontendPreview: 'Frontend Simulation Preview',
    noTikZ: 'No TikZ Graphics Yet',
    noTikZDescription: 'Click the button above to add your first TikZ graphic',
    maxTikZAlert: 'Maximum {max} TikZ graphics allowed'
  },
  
  // Editor panel
  editorPanel: {
    title: 'TikZ Graphics Editor',
    count: '({count}/3)',
    hidePreview: 'Hide Preview',
    showPreview: 'Show Preview',
    addGraph: 'Add Graphic',
    noTikZ: 'No TikZ graphics added yet',
    addFirst: 'Add First Graphic',
    graphNumber: 'Graphic {number}',
    edit: 'Edit',
    delete: 'Delete',
    tikzCode: 'TikZ Code',
    realtimePreview: 'Real-time Preview',
    size: {
      small: 'Small',
      medium: 'Medium',
      large: 'Large'
    },
    editGraph: 'Edit Graphic {number}'
  },
  
  // Highlight input
  highlightInput: {
    placeholder: 'Enter TikZ code...',
    commonCommands: {
      draw: 'Draw Path',
      fill: 'Fill Shape',
      node: 'Node',
      path: 'Path Command',
      clip: 'Clip Area',
      rectangle: 'Rectangle',
      circle: 'Circle',
      ellipse: 'Ellipse',
      sinFunction: 'Sine Function',
      quadFunction: 'Quadratic Function',
      cubicFunction: 'Cubic Function'
    }
  },
  
  // Renderer
  renderer: {
    tikzNumber: 'TikZ #{number}',
    format: '{format} Format',
    simulateRender: 'Simulate Render',
    realRender: 'Real Render',
    download: 'Download Image',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    rendering: 'Rendering...',
    renderComplete: 'Render Complete',
    waitingRender: 'Waiting for Render',
    renderError: 'Render Failed',
    realRenderError: 'Real Render Failed',
    waitingRenderDescription: 'Click render button to generate graphic',
    simulateRenderDescription: 'Simulate Render',
    realRenderDescription: 'Real Render',
    simulateDescription: 'Generate simulation graphics based on code analysis, no backend required',
    realDescription: 'Call backend LaTeX compilation to generate real TikZ graphics',
    simulationResults: {
      circle: 'Simulated Circle Graphics ({format})',
      rectangle: 'Simulated Rectangle Graphics ({format})',
      line: 'Simulated Line Graphics ({format})',
      node: 'Simulated Node Graphics ({format})',
      generic: 'Generic Simulation Graphics ({format})'
    }
  },
  
  // Preview component
  preview: {
    title: 'Graphics Preview Area',
    description: 'Auto-render after entering TikZ code',
    frontendRender: 'Frontend Simulation',
    noBackend: 'No Backend Required'
  }
};
