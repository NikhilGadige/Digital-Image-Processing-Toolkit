export const chapter2Module = {
  id: 'digital-image-fundamentals',
  chapter: 'Chapter 2',
  title: 'Digital Image Fundamentals',
  routeTitle: 'Foundations of Digital Images',
  overview:
    'This module follows Chapter 2 of Gonzalez: perception, spectrum, sensing/acquisition, sampling and quantization, pixel relationships, and core mathematical tools used in digital image processing.',
  hideReferenceCode: true,

  lessons: [
    {
      topic: 'Elements of Visual Perception',
      conceptOverview: [
        'Digital image processing is designed for human observers, so perception matters as much as raw pixel values.',
        'The human visual system (HVS) responds strongly to local contrast and edges, and less strongly to absolute brightness.',
        'Perceived brightness is nonlinear: a small change in dark regions may be more noticeable than the same change in bright regions.',
      ],
      intuition:
        'If two rooms differ by 20 lux, that difference feels large in a dim corridor but small in a brightly lit hall. The eye judges relative change more than absolute change.',
      mathematicalModel: [
        'Luminance adaptation (conceptual): perceived response R is a nonlinear function of intensity I, often approximated as R proportional to I^gamma (gamma < 1 for compressive perception).',
        'Weber-style sensitivity idea: Delta I / I = k. Detection threshold Delta I grows with background intensity I.',
        'Contrast (basic local form): C = (I_foreground - I_background) / I_background.',
      ],
      algorithmExplanation: [
        'Measure intensity distribution (histogram, min/max, dynamic range).',
        'Choose perceptual enhancement objective: reveal shadows, reduce glare, or improve edge visibility.',
        'Apply intensity mapping (for example stretching/equalization) to redistribute tones.',
        'Validate visually and numerically (histogram spread, clipping count, local contrast).',
      ],
      example:
        'In a low-contrast chest X-ray, remapping the grayscale range improves boundary visibility of soft tissue without changing anatomy.',
      practicalNotes: [
        'Advantage: perceptual enhancement improves interpretability for humans.',
        'Disadvantage: over-enhancement amplifies noise or creates artificial-looking regions.',
        'Limitation: what looks better to the eye is not always best for machine analysis.',
      ],
      visualizerExperiments: [
        'Gray-Level Reduction: compare 256, 64, 16, and 4 levels; note where tone detail disappears first.',
        'Bit Plane Slicing: inspect which bit planes preserve major perceptual structure.',
        'Sampling + Quantization: keep sampling fixed and vary levels to isolate perceptual quantization effects.',
      ],
    },
    {
      topic: 'Light and the Electromagnetic Spectrum',
      conceptOverview: [
        'An image is produced from electromagnetic radiation reflected or emitted by objects.',
        'Visible imaging uses roughly 400-700 nm, but DIP also uses infrared, ultraviolet, X-ray, microwave, and others.',
        'Different bands emphasize different physical properties (temperature, density, material behavior).',
      ],
      intuition:
        'Think of sensors as radios tuned to different channels. Human vision listens only to the visible channel, but sensors can tune to IR or X-ray channels.',
      mathematicalModel: [
        'Wave relation: c = lambda * f, where c is light speed, lambda wavelength, f frequency.',
        'Photon energy: E = h * f. Higher frequency means higher photon energy.',
        'Sensor output (simplified): g(x, y) = integral(S(lambda) * R(x, y, lambda) d lambda), where S is sensor spectral response and R is scene radiance/reflectance.',
      ],
      algorithmExplanation: [
        'Capture data from the chosen spectral band using a suitable sensor.',
        'Normalize raw intensity into displayable range.',
        'Optionally map grayscale measurements to pseudo-color for easier interpretation.',
        'Analyze how conclusions change across bands.',
      ],
      example:
        'Thermal inspection of electrical equipment highlights overheating parts that are not obvious in a visible RGB image.',
      practicalNotes: [
        'Advantage: non-visible imaging reveals hidden information.',
        'Disadvantage: higher cost, calibration complexity, and modality-specific noise.',
        'Limitation: cross-modality interpretation needs domain expertise and careful units.',
      ],
      visualizerExperiments: [
        'Bit Plane Slicing: analyze encoded intensity detail that would later be color-mapped.',
        'Interpolation Compare: zoom spectral-like grayscale data and compare aliasing across methods.',
      ],
    },
    {
      topic: 'Image Sensing and Acquisition',
      conceptOverview: [
        'Acquisition pipeline: illumination -> scene interaction -> optics -> sensor array -> analog electronics -> A/D conversion -> digital image.',
        'Each pixel value represents sampled radiant energy converted to a number.',
        'Quality depends on optics, sensor noise, exposure, digitizer precision, and geometric alignment.',
      ],
      intuition:
        'Imagine a rain gauge grid. Each tiny cup (pixel) collects rain (photons), and electronics report how full each cup is.',
      mathematicalModel: [
        'Common formation model: g(x, y) = h(x, y) * f(x, y) + n(x, y), where h is blur/PSF, f is ideal scene image, n is noise.',
        'Quantizer model: g_q = Q(g), mapping continuous/analog values to finite digital levels.',
        'Bit depth relation: L = 2^b levels for b-bit sampling.',
      ],
      algorithmExplanation: [
        'Acquire or load sensor output image.',
        'Inspect metadata: size, channels, dynamic range, and potential clipping.',
        'Perform basic quality checks (noise, blur, under/overexposure).',
        'Apply correction/preprocessing before advanced DIP steps.',
      ],
      example:
        'Two shots of the same scene at different exposure settings show that underexposure loses shadow information that later processing cannot fully recover.',
      practicalNotes: [
        'Advantage: digital acquisition enables repeatable computational pipelines.',
        'Disadvantage: poor acquisition propagates errors to all downstream processing.',
        'Limitation: severe saturation and missing detail are fundamentally irreversible.',
      ],
      visualizerExperiments: [
        'Resolution Reduction: simulate limited sensor spatial sampling.',
        'Sampling + Quantization: test acquisition tradeoffs between spatial detail and intensity precision.',
      ],
    },
    {
      topic: 'Image Sampling and Quantization',
      conceptOverview: [
        'Sampling discretizes the spatial coordinates of an image.',
        'Quantization discretizes amplitude/intensity values.',
        'Together they determine spatial resolution, tonal detail, storage cost, and aliasing/banding artifacts.',
      ],
      intuition:
        'Sampling is selecting how many grid points you draw. Quantization is deciding how many crayons you are allowed to color those points.',
      mathematicalModel: [
        'Spatial sampling: f(x, y) -> f[m, n] with x = m * Delta_x, y = n * Delta_y.',
        'Uniform quantization: q = floor(I / Delta) * Delta, with Delta = range / levels.',
        'Bit-depth relation: levels L = 2^b.',
        'Nyquist idea (1D intuition): sampling frequency must be >= 2 * highest signal frequency to reduce aliasing.',
      ],
      algorithmExplanation: [
        'Downsample image by factor r (space reduction).',
        'Upsample for display and observe jagged/block artifacts.',
        'Quantize to L levels and inspect false contouring/banding.',
        'Vary r and L systematically and compare distortions.',
      ],
      example:
        'At factor 4 and 16 gray levels, edges become blocky and smooth gradients become staircase-like.',
      practicalNotes: [
        'Advantage: lower memory and faster processing.',
        'Disadvantage: loss of fine detail and smooth tonal transitions.',
        'Limitation: once aliasing/quantization error is severe, exact original recovery is impossible.',
      ],
      visualizerExperiments: [
        'Sampling + Quantization: sweep downsample_factor and levels.',
        'Interpolation Compare: nearest vs linear vs cubic after resizing.',
        'Gray-Level Reduction and Resolution Reduction individually to isolate each effect.',
      ],
    },
    {
      topic: 'Some Basic Relationships Between Pixels',
      conceptOverview: [
        'Pixel relationships describe neighborhood, adjacency, connectivity, and distance in discrete image grids.',
        'These relationships are foundational for region growing, segmentation, morphology, contour extraction, and component labeling.',
        'Choice of neighborhood (4- or 8-neighborhood) changes topology and resulting object counts.',
      ],
      intuition:
        'In a city map, 4-neighborhood is moving only up/down/left/right; 8-neighborhood also allows diagonals. Connectivity rules decide if two houses belong to the same block.',
      mathematicalModel: [
        '4-neighborhood of p(x, y): N4(p) = {(x+1,y),(x-1,y),(x,y+1),(x,y-1)}.',
        'Diagonal neighbors: ND(p) = {(x+1,y+1),(x+1,y-1),(x-1,y+1),(x-1,y-1)}.',
        '8-neighborhood: N8(p) = N4(p) union ND(p).',
        'Distance measures between p(x,y) and q(s,t):',
        'City-block (D4): |x-s| + |y-t|.',
        'Chessboard (D8): max(|x-s|, |y-t|).',
        'Euclidean (De): sqrt((x-s)^2 + (y-t)^2).',
      ],
      algorithmExplanation: [
        'Threshold image into binary foreground/background.',
        'Choose connectivity rule (4 or 8).',
        'Run connected-component labeling.',
        'Measure component count, size, and shape descriptors.',
      ],
      example:
        'Diagonal-touching pixels are disconnected in 4-connectivity but connected in 8-connectivity, producing different object counts.',
      practicalNotes: [
        'Advantage: formal pixel relationships enable robust region-level analysis.',
        'Disadvantage: noise and threshold choice can fragment or merge components.',
        'Limitation: thin bridges or touching objects can cause ambiguous connectivity outcomes.',
      ],
      visualizerExperiments: [
        'Bit Plane Slicing: create pseudo-binary structures and reason about connectivity.',
        'Resolution Reduction: observe how adjacency/shape changes with coarser grids.',
      ],
    },
    {
      topic: 'Introduction to the Basic Mathematical Tools Used in Digital Image Processing',
      conceptOverview: [
        'Chapter 2 math tools prepare students for enhancement, restoration, segmentation, and recognition.',
        'Core tools include set/logic operations, linear algebra, convolution/correlation, probability/statistics, and basic transforms.',
        'Operators in DIP are commonly grouped as point operators, neighborhood operators, geometric operators, and transform-domain operators.',
      ],
      intuition:
        'An image is a matrix. Operators are recipes: some modify each pixel alone, some mix neighboring pixels, and some move to another domain (like frequency) before processing.',
      mathematicalModel: [
        'Point operator: g(x,y) = T(f(x,y)). Example: intensity remapping.',
        'Neighborhood operator (filter): g(x,y) = sum_i sum_j h(i,j) f(x-i, y-j).',
        'Correlation form: g(x,y) = sum_i sum_j h(i,j) f(x+i, y+j).',
        'Image statistics: mean mu = (1/MN) sum_x sum_y f(x,y), variance sigma^2 = (1/MN) sum_x sum_y (f(x,y)-mu)^2.',
        '2D DFT (intro): F(u,v) = sum_x sum_y f(x,y) exp(-j 2 pi (ux/M + vy/N)).',
      ],
      algorithmExplanation: [
        'Choose operator class based on task (point, neighborhood, geometric, transform).',
        'Define parameters/kernel/transform settings.',
        'Apply operator and compute output image.',
        'Evaluate result with both visual criteria and simple quantitative metrics.',
      ],
      example: [
        'Point operation: gamma correction to brighten dark regions.',
        'Neighborhood operation: mean or Gaussian filter for noise suppression.',
        'Geometric operation: interpolation during scaling/rotation.',
        'Transform operation: frequency-domain filtering (covered deeply in later modules).',
      ],
      practicalNotes: [
        'Advantage: mathematical operators are systematic and reproducible.',
        'Disadvantage: incorrect assumptions (noise model, kernel size, etc.) degrade results.',
        'Limitation: no single operator works best for all image types and objectives.',
      ],
      visualizerExperiments: [
        'Interpolation Compare for geometric/resampling operators.',
        'Sampling + Quantization for discretization mathematics.',
        'Gray-Level Reduction and Bit Plane Slicing for point-level intensity operators.',
      ],
    },
  ],

  codeSnippet: '# Use Visualizer + Get Code for experiment-specific runnable scripts.',

  lab: {
    tools: [
      {
        id: 'sample-quantize',
        label: 'Sampling + Quantization',
        type: 'api',
        endpoint: '/api/fundamentals/sampling-quantization',
        methodName: 'Sampling and Quantization Demo',
        params: [
          { key: 'downsample_factor', label: 'Downsample Factor', type: 'number', default: 4, min: 1, max: 16, step: 1 },
          { key: 'levels', label: 'Gray Levels', type: 'number', default: 16, min: 2, max: 256, step: 1 },
        ],
      },
      {
        id: 'interpolation',
        label: 'Interpolation Compare',
        type: 'api',
        endpoint: '/api/fundamentals/interpolation-compare',
        methodName: 'Interpolation Demo',
        params: [
          { key: 'scale', label: 'Scale', type: 'number', default: 2, min: 1.2, max: 6, step: 0.1 },
          {
            key: 'method',
            label: 'Method',
            type: 'select',
            default: 'linear',
            options: [
              { label: 'Linear', value: 'linear' },
              { label: 'Nearest', value: 'nearest' },
              { label: 'Cubic', value: 'cubic' },
            ],
          },
        ],
      },
      {
        id: 'bit-plane',
        label: 'Bit Plane Slicing',
        type: 'api',
        endpoint: '/api/fundamentals/bit-plane',
        methodName: 'Bit Plane Slicing',
        params: [{ key: 'plane', label: 'Bit Plane (0-7)', type: 'number', default: 7, min: 0, max: 7, step: 1 }],
      },
      {
        id: 'gray-level-reduction',
        label: 'Gray-Level Reduction',
        type: 'api',
        endpoint: '/api/fundamentals/gray-level-reduction',
        methodName: 'Gray-Level Reduction',
        params: [{ key: 'levels', label: 'Gray Levels', type: 'number', default: 8, min: 2, max: 256, step: 1 }],
      },
      {
        id: 'reduce-resolution',
        label: 'Resolution Reduction',
        type: 'api',
        endpoint: '/api/fundamentals/reduce-resolution',
        methodName: 'Resolution Reduction',
        params: [{ key: 'factor', label: 'Reduction Factor', type: 'number', default: 2, min: 1, max: 16, step: 1 }],
      },
    ],
  },
};
