export const chapter4Module = {
  id: 'frequency-domain-filtering',
  chapter: 'Chapter 4',
  title: 'Filtering in the Frequency Domain',
  routeTitle: 'Frequency Domain Enhancement',
  overview:
    'This module follows Gonzalez Chapter 4: Fourier foundations, DFT properties, frequency-domain filtering design, selective filtering, and FFT efficiency.',
  hideReferenceCode: true,

  lessons: [
    {
      topic: 'Frequency Domain Image Processing (Background)',
      conceptOverview: [
        'Spatial processing modifies pixels directly, while frequency processing modifies spectral components.',
        'The key frequency workflow is: DFT -> multiply by transfer function H(u,v) -> inverse DFT.',
      ],
      intuition:
        'Think of an audio equalizer for images: instead of changing pixel values directly, you tune low/high frequency bands.',
      mathematicalModel: [
        'Core equation: g(x,y) = F^{-1}[H(u,v)F(u,v)].',
        'f(x,y): input image, F(u,v): Fourier transform, H(u,v): filter transfer function, g(x,y): output.',
      ],
      algorithmExplanation: [
        'Transform image to frequency domain.',
        'Build filter mask H(u,v) for desired effect.',
        'Multiply spectrum by mask.',
        'Inverse transform to get filtered spatial image.',
      ],
      example:
        'Apply lowpass in frequency domain to suppress fine detail and noise in a grainy grayscale image.',
      practicalNotes: [
        'Advantage: direct control over frequency bands.',
        'Disadvantage: transform overhead and parameter tuning complexity.',
        'Limitation: global filters may not adapt to local content variation.',
      ],
      visualizerExperiments: [
        'Run Fourier Spectrum, Low-Pass, High-Pass to connect the pipeline.',
      ],
    },
    {
      topic: 'Convolution Theorem (Important Derivation)',
      conceptOverview: [
        'Convolution in spatial domain corresponds to multiplication in frequency domain.',
        'This theorem is the mathematical foundation for frequency-domain filtering.',
      ],
      intuition:
        'A difficult local convolution in image space becomes a simple pointwise product in spectral space.',
      mathematicalModel: [
        'If g(x,y) = f(x,y) * h(x,y), then G(u,v) = F(u,v)H(u,v).',
        'Therefore g(x,y) = F^{-1}[F(u,v)H(u,v)].',
      ],
      algorithmExplanation: [
        'Define spatial convolution g=f*h.',
        'Take Fourier transform of both sides.',
        'Use convolution theorem identity to obtain G=F.H.',
        'Apply inverse transform to return to image domain.',
      ],
      example:
        'Gaussian blur can be implemented via spatial convolution or via spectrum multiplication with Gaussian transfer function.',
      practicalNotes: [
        'Advantage: often computationally efficient for large kernels.',
        'Disadvantage: requires careful padding and frequency centering.',
        'Limitation: round-off and edge handling can affect exact equivalence in finite images.',
      ],
      visualizerExperiments: [
        'Compare large-radius Low-Pass output with strong spatial Gaussian-style smoothing in other modules.',
      ],
    },
    {
      topic: 'Fourier Transform Basics (Preliminary Concepts)',
      conceptOverview: [
        'A digital image f(x,y) of size MxN is decomposed into sinusoidal frequency components.',
        'Low frequency represents smooth intensity variation; high frequency represents sharp transitions/details.',
      ],
      intuition:
        'Any image can be represented as a weighted sum of 2D waves at different frequencies and orientations.',
      mathematicalModel: [
        'Spectrum has magnitude |F(u,v)| and phase angle F(u,v).',
        'Magnitude indicates strength of frequency components; phase carries structural arrangement information.',
      ],
      algorithmExplanation: [
        'Compute DFT.',
        'Visualize log-magnitude for interpretability.',
        'Observe strong low-frequency energy near origin/center.',
      ],
      example:
        'Natural images usually show concentrated low-frequency energy and sparse high-frequency energy.',
      practicalNotes: [
        'Advantage: gives interpretable decomposition for filter design.',
        'Disadvantage: raw spectra are hard to interpret without centering/log scaling.',
        'Limitation: phase omission severely damages structural reconstruction.',
      ],
      visualizerExperiments: [
        'Use Fourier Spectrum and compare smooth vs textured images.',
      ],
    },
    {
      topic: 'Sampling and Aliasing',
      conceptOverview: [
        'Sampling a continuous function replicates its spectrum periodically in frequency domain.',
        'If replicas overlap, aliasing occurs.',
      ],
      intuition:
        'Sampling is like taking sparse snapshots of a fast-moving object; too sparse causes false motion patterns.',
      mathematicalModel: [
        'Sampled signal: f_s(x,y)=f(x,y)s(x,y), with impulse-train sampler s(x,y).',
        'Sampling in space -> periodic replication in frequency.',
        'Nyquist condition: f_s >= 2f_max to avoid overlap/aliasing.',
      ],
      algorithmExplanation: [
        'Sample at chosen spacing Tx, Ty.',
        'Inspect resulting replicated spectra conceptually.',
        'Increase sampling rate or pre-lowpass to reduce aliasing.',
      ],
      example:
        'Checkerboard textures can produce moire artifacts when downsampled without antialias filtering.',
      practicalNotes: [
        'Advantage: lower sampling reduces storage and compute.',
        'Disadvantage: aliasing introduces irreversible distortions.',
        'Limitation: post-processing cannot perfectly recover aliased frequencies.',
      ],
      visualizerExperiments: [
        'In Module 2, compare Resolution Reduction with and without smoothing context; relate effects back to Chapter 4 aliasing.',
      ],
    },
    {
      topic: 'Discrete Fourier Transform (1-D)',
      conceptOverview: [
        'The 1-D DFT maps finite-length discrete signals into discrete frequency components.',
      ],
      intuition:
        'It projects a signal onto orthogonal complex exponential basis vectors.',
      mathematicalModel: [
        'Forward DFT: F(u) = sum_{x=0..N-1} f(x) e^{-j2piux/N}.',
        'Inverse DFT: f(x) = (1/N) sum_{u=0..N-1} F(u) e^{j2piux/N}.',
      ],
      algorithmExplanation: [
        'For each frequency index u, compute weighted sum of all samples.',
        'Use complex exponentials as basis.',
        'Use inverse equation to reconstruct.',
      ],
      example:
        'A pure sinusoid produces a sharp spectral peak at its corresponding frequency bin.',
      practicalNotes: [
        'Advantage: exact invertible transform for finite periodic sequences.',
        'Disadvantage: direct implementation is O(N^2).',
        'Limitation: finite length introduces spectral leakage effects for non-bin-aligned frequencies.',
      ],
      visualizerExperiments: [
        'Use Fourier Spectrum on simple patterned images to infer dominant frequencies.',
      ],
    },
    {
      topic: '2-D DFT (Extensions to Two Variables)',
      conceptOverview: [
        '2-D DFT extends 1-D DFT to images with two spatial indices.',
        'It can be computed as row-wise then column-wise 1-D DFTs.',
      ],
      intuition:
        'Analyze horizontal and vertical frequency content jointly rather than in a single direction.',
      mathematicalModel: [
        'F(u,v)=sum_{x=0..M-1} sum_{y=0..N-1} f(x,y)e^{-j2pi(ux/M + vy/N)}.',
        'Inverse: f(x,y)=(1/MN)sum_u sum_v F(u,v)e^{j2pi(ux/M + vy/N)}.',
      ],
      algorithmExplanation: [
        'Apply 1-D DFT along one axis.',
        'Apply 1-D DFT along the other axis to intermediate result.',
        'Use inverse in reverse order for reconstruction.',
      ],
      example:
        'Horizontal stripe patterns produce concentrated energy at specific vertical-frequency coordinates.',
      practicalNotes: [
        'Advantage: natural fit for 2D image analysis and filtering.',
        'Disadvantage: large images increase memory and compute pressure.',
        'Limitation: assumes periodic extension at boundaries unless padded/windowed.',
      ],
      visualizerExperiments: [
        'Run Fourier Spectrum on directional textures to observe orientation-dependent peaks.',
      ],
    },
    {
      topic: 'Separability of 2-D DFT (Important Derivation)',
      conceptOverview: [
        '2-D DFT is separable into two successive 1-D transforms.',
      ],
      intuition:
        'A big 2D transform can be decomposed into simpler steps along rows and columns.',
      mathematicalModel: [
        'Rewrite F(u,v)=sum_x [sum_y f(x,y)e^{-j2pivy/N}] e^{-j2piux/M}.',
        'Inner sum is 1-D DFT in y; outer sum is 1-D DFT in x.',
      ],
      algorithmExplanation: [
        'Compute row transforms first.',
        'Compute column transforms on row-transformed result.',
        'Equivalent to full 2-D formula.',
      ],
      example:
        'Most FFT libraries exploit separability for efficient 2D processing.',
      practicalNotes: [
        'Advantage: enables practical large-scale computation.',
        'Disadvantage: still expensive without FFT acceleration.',
        'Limitation: cache/memory layout influences runtime significantly.',
      ],
      visualizerExperiments: [
        'Interpret FFT Spectrum generation as separable implementation under the hood.',
      ],
    },
    {
      topic: 'Properties of the DFT (Linearity, Translation, Periodicity)',
      conceptOverview: [
        'DFT properties simplify analysis and filter design.',
        'Most used in DIP: linearity, translation-phase relationship, scaling duality, periodicity.',
      ],
      intuition:
        'Shifting an image does not move spectral magnitude much, but changes spectral phase systematically.',
      mathematicalModel: [
        'Linearity: F(af1+bf2)=aF1+bF2.',
        'Translation: f(x-x0,y-y0) <-> F(u,v)e^{-j2pi(ux0/M + vy0/N)}.',
        'Periodicity: DFT repeats with periods M and N.',
      ],
      algorithmExplanation: [
        'Apply linear combinations and verify spectral superposition.',
        'Shift image and observe phase factor effect.',
        'Use periodic indexing for implementation convenience.',
      ],
      example:
        'Image alignment shifts mainly alter phase while preserving magnitude distribution patterns.',
      practicalNotes: [
        'Advantage: properties guide robust implementation decisions.',
        'Disadvantage: misinterpreting phase effects leads to reconstruction errors.',
        'Limitation: discrete finite setting introduces edge/boundary artifacts.',
      ],
      visualizerExperiments: [
        'Compare outputs after different masks while observing how detail changes align with DFT properties.',
      ],
    },
    {
      topic: 'Frequency Domain Filtering (Centering and Workflow)',
      conceptOverview: [
        'Filtering uses G(u,v)=H(u,v)F(u,v), then inverse DFT to return image.',
        'Centering (fftshift) places low frequencies at center for intuitive mask construction.',
      ],
      intuition:
        'Centering puts the important low-frequency region in the middle like a target, making circular masks easier to design.',
      mathematicalModel: [
        'Centering by multiplication in space: f(x,y)(-1)^{x+y}.',
        'Equivalent to frequency shift by (M/2,N/2).',
      ],
      algorithmExplanation: [
        'Compute DFT and shift zero-frequency to center.',
        'Build mask around centered origin.',
        'Multiply spectrum and inverse shift + inverse DFT.',
      ],
      example:
        'Circular low-pass mask around centered origin blurs fine texture.',
      practicalNotes: [
        'Advantage: easy geometric filter design in frequency plane.',
        'Disadvantage: wrong centering/uncentering order yields incorrect output.',
        'Limitation: abrupt masks can cause ringing in spatial domain.',
      ],
      visualizerExperiments: [
        'Use Low-Pass, High-Pass, and FFT Spectrum to observe centered-mask behavior.',
      ],
    },
    {
      topic: 'Lowpass Filters (Smoothing)',
      conceptOverview: [
        'Lowpass filters preserve low frequencies and attenuate high frequencies.',
        'Used for noise reduction and smoothing.',
      ],
      intuition:
        'Keep broad intensity trends, remove rapid fluctuations.',
      mathematicalModel: [
        'Ideal LPF: H=1 for D<=D0, else 0.',
        'Distance from center: D(u,v)=sqrt((u-M/2)^2 + (v-N/2)^2).',
      ],
      algorithmExplanation: [
        'Choose cutoff D0.',
        'Construct LPF mask in frequency plane.',
        'Multiply and invert to produce smoothed image.',
      ],
      example:
        'Ideal LPF with small cutoff strongly blurs texture and fine edges.',
      practicalNotes: [
        'Advantage: effective noise/detail suppression control via cutoff.',
        'Disadvantage: ideal cutoff causes ringing from sharp discontinuity.',
        'Limitation: over-smoothing removes meaningful edges.',
      ],
      visualizerExperiments: [
        'Run Low-Pass Filter with varying radius and compare blur strength.',
      ],
    },
    {
      topic: 'Butterworth and Gaussian Filters',
      conceptOverview: [
        'Butterworth and Gaussian filters provide smoother transitions than ideal filters.',
        'Smoother transition reduces ringing artifacts.',
      ],
      intuition:
        'Instead of hard cutoff walls, these filters use smooth ramps between pass and stop regions.',
      mathematicalModel: [
        'Butterworth LPF: H=1/(1+(D/D0)^{2n}).',
        'Gaussian LPF: H=exp(-D^2/(2D0^2)).',
        'Highpass forms commonly use complement: H_hp = 1 - H_lp.',
      ],
      algorithmExplanation: [
        'Set cutoff D0 and Butterworth order n (if applicable).',
        'Construct mask with smooth roll-off.',
        'Apply filtering and compare ringing against ideal masks.',
      ],
      example:
        'Gaussian low-pass often gives natural smoothing with less ripple artifacts around sharp edges.',
      practicalNotes: [
        'Advantage: smoother spatial results than ideal filters.',
        'Disadvantage: parameter interpretation may be less intuitive than hard cutoff.',
        'Limitation: still global and non-adaptive to local texture differences.',
      ],
      visualizerExperiments: [
        'Compare Butterworth LP/HP and Gaussian LP/HP using same cutoff scale.',
      ],
    },
    {
      topic: 'Highpass Filters (Sharpening)',
      conceptOverview: [
        'Highpass filters attenuate low frequencies and preserve/enhance high-frequency details.',
        'Used for edge emphasis and sharpening effects.',
      ],
      intuition:
        'Suppress smooth background, keep abrupt transitions.',
      mathematicalModel: [
        'Complement relation: H_hp = 1 - H_lp.',
        'Ideal HPF: H=0 for D<=D0, H=1 for D>D0.',
        'Butterworth/Gaussian HPF derived from LPF complements.',
      ],
      algorithmExplanation: [
        'Choose HPF design and cutoff.',
        'Multiply spectrum and invert.',
        'Assess edge gain and noise amplification tradeoff.',
      ],
      example:
        'High-pass filtering can reveal small scratches on manufactured surfaces.',
      practicalNotes: [
        'Advantage: stronger edge/detail perception.',
        'Disadvantage: boosts noise and grain if not controlled.',
        'Limitation: often needs pre-smoothing or hybrid pipelines.',
      ],
      visualizerExperiments: [
        'Run High-Pass, Gaussian High-Pass, and Butterworth High-Pass and compare artifacts.',
      ],
    },
    {
      topic: 'Selective Filtering (Bandpass, Bandreject, Notch)',
      conceptOverview: [
        'Selective filters target specific frequency bands or localized frequency pairs.',
        'Bandreject suppresses a ring band; bandpass keeps a ring band; notch reject removes specific periodic spikes.',
      ],
      intuition:
        'Like muting only one annoying hum frequency in audio while keeping the rest.',
      mathematicalModel: [
        'Bandreject and bandpass are ring-based masks around center frequency.',
        'Notch reject typically uses symmetric notches at (+u0,+v0) and (-u0,-v0).',
        'Composite notch masks are products of individual notch responses.',
      ],
      algorithmExplanation: [
        'Inspect spectrum to locate unwanted periodic peaks.',
        'Design notch centers and radius.',
        'Apply reject mask and invert transform.',
      ],
      example:
        'Periodic striping noise appears as symmetric bright spikes in spectrum; notch reject suppresses them.',
      practicalNotes: [
        'Advantage: precise removal of periodic interference.',
        'Disadvantage: requires careful frequency peak identification.',
        'Limitation: poorly placed notches may remove useful structural content.',
      ],
      visualizerExperiments: [
        'Use Band-Pass and Band-Reject to understand ring selection.',
        'Use Notch Reject Filter for localized periodic-noise suppression experiments.',
      ],
    },
    {
      topic: 'Fast Fourier Transform (FFT) and Complexity Derivation',
      conceptOverview: [
        'FFT computes DFT efficiently by recursive decomposition.',
        'This enables practical frequency-domain processing for real images.',
      ],
      intuition:
        'Split a big problem into even and odd index subproblems repeatedly until tiny transforms remain.',
      mathematicalModel: [
        'Naive DFT complexity: O(N^2).',
        'Cooley-Tukey split: F(k)=sum f(2n)e^{-j2pikn/N} + e^{-j2pik/N}sum f(2n+1)e^{-j2pikn/N}.',
        'Recurrence leads to O(N log N).',
      ],
      algorithmExplanation: [
        'Partition sequence into even and odd samples.',
        'Compute smaller DFTs recursively.',
        'Combine with twiddle factors to form full transform.',
      ],
      example:
        'Large 2D image filtering is feasible in real time only because FFT lowers transform cost dramatically.',
      practicalNotes: [
        'Advantage: major speedup for transform-domain workflows.',
        'Disadvantage: implementation details (padding, radix choices) can affect performance.',
        'Limitation: FFT speed does not remove need for good filter design choices.',
      ],
      visualizerExperiments: [
        'Run multiple frequency filters and observe that complex operations remain interactive due to FFT-based implementations.',
      ],
    },
  ],

  codeSnippet: '# Use Visualizer + Get Code for experiment-specific runnable scripts.',

  lab: {
    tools: [
      { id: 'lowpass', label: 'Low-Pass Filter', type: 'api', endpoint: '/api/frequency/low-pass', methodName: 'Frequency Low-Pass', defaultParam: 35, paramLabel: 'Radius', paramKey: 'radius', paramMin: 5, paramStep: 1 },
      { id: 'highpass', label: 'High-Pass Filter', type: 'api', endpoint: '/api/frequency/high-pass', methodName: 'Frequency High-Pass', defaultParam: 25, paramLabel: 'Radius', paramKey: 'radius', paramMin: 3, paramStep: 1 },
      { id: 'fft', label: 'Fourier Spectrum', type: 'api', endpoint: '/api/frequency/fft-spectrum', methodName: 'FFT Spectrum' },
      {
        id: 'bandpass',
        label: 'Band-Pass Filter',
        type: 'api',
        endpoint: '/api/frequency/band-pass',
        methodName: 'Band-Pass Filter',
        params: [
          { key: 'r1', label: 'Inner Radius', type: 'number', default: 20, min: 1, step: 1 },
          { key: 'r2', label: 'Outer Radius', type: 'number', default: 60, min: 2, step: 1 },
        ],
      },
      {
        id: 'bandreject',
        label: 'Band-Reject Filter',
        type: 'api',
        endpoint: '/api/frequency/band-reject',
        methodName: 'Band-Reject Filter',
        params: [
          { key: 'r1', label: 'Inner Radius', type: 'number', default: 20, min: 1, step: 1 },
          { key: 'r2', label: 'Outer Radius', type: 'number', default: 60, min: 2, step: 1 },
        ],
      },
      {
        id: 'notch-reject',
        label: 'Notch Reject Filter',
        type: 'api',
        endpoint: '/api/frequency/notch-reject',
        methodName: 'Notch Reject Filter',
        params: [
          { key: 'u0', label: 'Notch U Offset', type: 'number', default: 30, min: 0, step: 1 },
          { key: 'v0', label: 'Notch V Offset', type: 'number', default: 30, min: 0, step: 1 },
          { key: 'radius', label: 'Notch Radius', type: 'number', default: 8, min: 1, step: 1 },
        ],
      },
      { id: 'gaussian-lp', label: 'Gaussian Low-Pass', type: 'api', endpoint: '/api/frequency/gaussian-low-pass', methodName: 'Gaussian Low-Pass', defaultParam: 30, paramLabel: 'Sigma', paramKey: 'sigma', paramMin: 1, paramStep: 0.5 },
      { id: 'gaussian-hp', label: 'Gaussian High-Pass', type: 'api', endpoint: '/api/frequency/gaussian-high-pass', methodName: 'Gaussian High-Pass', defaultParam: 30, paramLabel: 'Sigma', paramKey: 'sigma', paramMin: 1, paramStep: 0.5 },
      {
        id: 'butterworth-lp',
        label: 'Butterworth Low-Pass',
        type: 'api',
        endpoint: '/api/frequency/butterworth-low-pass',
        methodName: 'Butterworth Low-Pass',
        params: [
          { key: 'd0', label: 'Cutoff (D0)', type: 'number', default: 40, min: 1, step: 1 },
          { key: 'n', label: 'Order (n)', type: 'number', default: 2, min: 1, step: 1 },
        ],
      },
      {
        id: 'butterworth-hp',
        label: 'Butterworth High-Pass',
        type: 'api',
        endpoint: '/api/frequency/butterworth-high-pass',
        methodName: 'Butterworth High-Pass',
        params: [
          { key: 'd0', label: 'Cutoff (D0)', type: 'number', default: 40, min: 1, step: 1 },
          { key: 'n', label: 'Order (n)', type: 'number', default: 2, min: 1, step: 1 },
        ],
      },
    ],
  },
};