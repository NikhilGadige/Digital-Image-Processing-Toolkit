export const chapter5Module = {
  id: 'image-restoration',
  chapter: 'Chapter 5',
  title: 'Image Restoration and Reconstruction',
  routeTitle: 'Restoration, Deconvolution, and Reconstruction',
  overview:
    'This module follows Gonzalez Chapter 5: degradation modeling, noise statistics, restoration filters, inverse/MMSE/regularized methods, and projection-based reconstruction concepts.',
  hideReferenceCode: true,

  lessons: [
    {
      topic: 'Image Degradation Model',
      conceptOverview: [
        'Restoration starts from a physical/algorithmic model of how the image was degraded.',
        'Observed image is modeled as blur (PSF convolution) plus additive noise.',
      ],
      intuition:
        'Imagine viewing a scene through a smeared lens while random sensor fluctuations are added.',
      mathematicalModel: [
        'Spatial model: g(x,y) = h(x,y) * f(x,y) + n(x,y).',
        'Frequency form: G(u,v) = H(u,v)F(u,v) + N(u,v).',
      ],
      algorithmExplanation: [
        'Choose or estimate degradation function h.',
        'Model/estimate noise statistics.',
        'Design restoration filter based on H and noise prior.',
      ],
      example:
        'Motion blur + Gaussian sensor noise in handheld low-light imaging.',
      practicalNotes: [
        'Advantage: model-based restoration is principled and interpretable.',
        'Disadvantage: inaccurate model estimates degrade restoration quality.',
        'Limitation: real systems may violate ideal linear assumptions.',
      ],
      visualizerExperiments: ['Run Image Degradation Model to simulate blur + noise and inspect recoverability.'],
    },
    {
      topic: 'Noise Models',
      conceptOverview: [
        'Different acquisition/transmission processes induce different noise distributions.',
        'Filter choice depends on noise type, not just noise strength.',
      ],
      intuition:
        'Not all randomness is the same: some is bell-shaped (Gaussian), some is sparse spikes (impulse).',
      mathematicalModel: [
        'Gaussian PDF: p(z) = (1/sqrt(2pi sigma^2)) exp(-(z-mu)^2/(2sigma^2)).',
        'Mean: mu = integral z p(z) dz; variance: sigma^2 = integral (z-mu)^2 p(z) dz.',
        'Impulse noise is sparse corruption to near-0/near-255 values.',
      ],
      algorithmExplanation: [
        'Identify plausible noise model from image characteristics/hardware.',
        'Estimate parameters (mean, variance, impulse density, etc.).',
        'Choose corresponding denoising strategy.',
      ],
      example:
        'Salt-and-pepper noise appears as isolated white/black dots from transmission errors.',
      practicalNotes: [
        'Advantage: model-aware denoising improves restoration fidelity.',
        'Disadvantage: misclassification of noise type hurts results.',
        'Limitation: real images often contain mixed noise models.',
      ],
      visualizerExperiments: ['Use Noise Models tool and switch between Gaussian, Uniform, Rayleigh, Gamma, Exponential, and Impulse noise.'],
    },
    {
      topic: 'Spatial Noise Reduction Filters',
      conceptOverview: [
        'Local spatial filters reduce noise directly in image domain.',
        'Mean/gaussian filters average neighborhoods; median filter uses robust order statistic.',
      ],
      intuition:
        'A noisy pixel is corrected using nearby votes from its neighborhood.',
      mathematicalModel: [
        'Arithmetic mean filter: fhat(x,y) = (1/mn) sum_{(s,t) in S} g(s,t).',
        'Median filter: fhat(x,y) = median({g(s,t) in S}).',
      ],
      algorithmExplanation: [
        'Choose filter family and window size.',
        'Apply neighborhood operation to every pixel.',
        'Compare residual noise and edge preservation.',
      ],
      example:
        'Median filter outperforms mean filter on impulse noise while preserving edges better.',
      practicalNotes: [
        'Advantage: simple and fast denoising baseline.',
        'Disadvantage: strong smoothing removes fine details.',
        'Limitation: fixed kernels are not locally adaptive.',
      ],
      visualizerExperiments: ['Run Spatial Noise Reduction Filters with method=mean/gaussian/median and vary kernel size.'],
    },
    {
      topic: 'Adaptive Noise Filtering',
      conceptOverview: [
        'Adaptive filtering varies denoising strength based on local image statistics.',
        'Flat noisy regions are smoothed more; high-variance detail regions are preserved more.',
      ],
      intuition:
        'Treat smooth sky and textured leaves differently instead of using one global smoothing strength.',
      mathematicalModel: [
        'Adaptive estimate: fhat = g - (sigma_n^2 / sigma_L^2) (g - mu_L).',
        'mu_L: local mean, sigma_L^2: local variance, sigma_n^2: noise variance.',
      ],
      algorithmExplanation: [
        'Estimate local mean/variance in a moving window.',
        'Estimate or set noise variance.',
        'Apply adaptive correction term per pixel.',
      ],
      example:
        'Adaptive filter can smooth background while preserving object boundaries better than mean filter.',
      practicalNotes: [
        'Advantage: better detail-noise tradeoff than fixed smoothing.',
        'Disadvantage: requires reliable noise variance estimate.',
        'Limitation: weak local variance estimates may cause artifacts.',
      ],
      visualizerExperiments: ['Use Adaptive Noise Filtering and vary ksize and noise variance to observe behavior changes.'],
    },
    {
      topic: 'Periodic Noise Removal',
      conceptOverview: [
        'Periodic interference appears as discrete peaks/spikes in frequency domain.',
        'Notch reject filters suppress selected periodic components.',
      ],
      intuition:
        'If a repeated stripe contaminates the image, remove its specific frequency signature.',
      mathematicalModel: [
        'Composite notch form: H(u,v) = product_k H_k(u,v).',
        'Setting H(uk,vk)=0 removes targeted periodic component.',
      ],
      algorithmExplanation: [
        'Inspect FFT magnitude and locate symmetric spike pairs.',
        'Place notch reject masks at corresponding frequencies.',
        'Inverse transform to obtain cleaned image.',
      ],
      example:
        'Mains hum-like stripe patterns in scanned images can be attenuated with notch filters.',
      practicalNotes: [
        'Advantage: precise suppression of periodic artifacts.',
        'Disadvantage: requires careful notch placement.',
        'Limitation: can suppress real texture if notches are overbroad.',
      ],
      visualizerExperiments: ['Run Periodic Noise Removal (Notch Reject) and tune u0, v0, and notch radius.'],
    },
    {
      topic: 'Linear Position-Invariant Degradation Systems',
      conceptOverview: [
        'If a system is linear and shift-invariant, degradation is modeled by convolution with PSF.',
      ],
      intuition:
        'Same local blur behavior applies everywhere in the image, independent of location.',
      mathematicalModel: [
        'LTI model: g = h * f.',
        'Shift invariance implies shifted input yields equally shifted output.',
      ],
      algorithmExplanation: [
        'Assume/estimate PSF h.',
        'Apply convolution model for degradation or inversion-based restoration.',
      ],
      example:
        'Uniform camera shake approximated by a spatially invariant motion kernel.',
      practicalNotes: [
        'Advantage: enables frequency-domain closed-form restorers.',
        'Disadvantage: real optics may be only approximately shift-invariant.',
        'Limitation: spatially varying blur needs more advanced models.',
      ],
      visualizerExperiments: ['Run Linear Degradation Systems and compare motion vs gaussian models.'],
    },
    {
      topic: 'Estimating Blur Functions (PSF Estimation)',
      conceptOverview: [
        'Practical restoration needs H(u,v), but h(x,y) is often unknown.',
        'PSF can be estimated by observation, calibration, or physical modeling.',
      ],
      intuition:
        'Before undoing blur, estimate what blur kernel created it.',
      mathematicalModel: [
        'Observation model in frequency: G = HF + N; unknown H must be approximated.',
        'PSF normalization condition: sum h(x,y)=1 (energy-conserving blur kernels).',
      ],
      algorithmExplanation: [
        'Pick parametric model (motion/gaussian).',
        'Fit/choose parameters from image behavior.',
        'Validate by simulated degradation consistency.',
      ],
      example:
        'Use estimated motion length as kernel size for subsequent inverse-like restoration.',
      practicalNotes: [
        'Advantage: improves restoration realism vs blind assumptions.',
        'Disadvantage: bad PSF estimate can be worse than mild denoising.',
        'Limitation: blind deconvolution is generally ill-posed.',
      ],
      visualizerExperiments: ['Run Estimating Blur Functions to visualize motion/gaussian PSF kernels.'],
    },
    {
      topic: 'Motion Blur Modeling',
      conceptOverview: [
        'Uniform linear motion during exposure leads to characteristic blur and sinc-like frequency response.',
      ],
      intuition:
        'A moving camera smears each point along a direction during shutter time.',
      mathematicalModel: [
        'Typical frequency response form: H(u,v) proportional to sin(pi(ua+vb))/(pi(ua+vb)) * exp(-jpi(ua+vb)).',
        'Parameters a,b encode motion direction; T exposure time scales response.',
      ],
      algorithmExplanation: [
        'Define motion kernel length/direction.',
        'Convolve image with kernel to simulate blur.',
        'Use model for inverse/Wiener/regularized restoration.',
      ],
      example:
        'Horizontal motion kernel produces horizontal streaking artifacts.',
      practicalNotes: [
        'Advantage: physically grounded blur simulation.',
        'Disadvantage: real motion is often nonuniform/rotational.',
        'Limitation: simple kernels may underfit real camera shake.',
      ],
      visualizerExperiments: ['Run Motion Blur Modeling and vary kernel size.'],
    },
    {
      topic: 'Inverse Filtering',
      conceptOverview: [
        'Inverse filtering attempts direct algebraic inversion of degradation.',
      ],
      intuition:
        'If blur multiplies by H in frequency, divide by H to recover F.',
      mathematicalModel: [
        'From G=HF, estimate Fhat = G/H.',
        'In practice use epsilon stabilization when |H| is near zero.',
      ],
      algorithmExplanation: [
        'Estimate degradation transfer H.',
        'Compute G/H with numerical stabilization.',
        'Inverse transform to reconstructed image.',
      ],
      example:
        'Inverse filter can recover blur in low-noise settings with accurate PSF.',
      practicalNotes: [
        'Advantage: conceptually simple and sometimes effective.',
        'Disadvantage: highly noise-sensitive near H zeros.',
        'Limitation: unstable under practical noisy conditions.',
      ],
      visualizerExperiments: ['Run Inverse Filtering and tune epsilon to see instability vs stabilization.'],
    },
    {
      topic: 'Wiener Filtering (MMSE)',
      conceptOverview: [
        'Wiener filter minimizes mean-square estimation error using signal/noise power priors.',
      ],
      intuition:
        'Balance between inversion and noise suppression based on confidence in frequencies.',
      mathematicalModel: [
        'Hw(u,v)=H*(u,v) / (|H(u,v)|^2 + Sn(u,v)/Sf(u,v)).',
        'MMSE objective: minimize E[(f-fhat)^2].',
      ],
      algorithmExplanation: [
        'Estimate/assume H and noise-to-signal ratio.',
        'Construct Wiener transfer function.',
        'Apply in frequency domain and invert.',
      ],
      example:
        'Wiener often restores blurred noisy images better than pure inverse filter.',
      practicalNotes: [
        'Advantage: robust restoration under noise.',
        'Disadvantage: requires spectral ratio assumptions.',
        'Limitation: suboptimal if Sf/Sn estimates are poor.',
      ],
      visualizerExperiments: ['Run Wiener Filtering and compare against Inverse Filtering on noisy/blurred input.'],
    },
    {
      topic: 'Constrained Least Squares Filtering',
      conceptOverview: [
        'CLS restoration balances fidelity to observed data with smoothness regularization.',
      ],
      intuition:
        'Recover the image that both explains the observation and avoids unrealistic roughness.',
      mathematicalModel: [
        'Objective: min ||Hf-g||^2 + gamma ||Cf||^2.',
        'Frequency solution: Hcls = H* / (|H|^2 + gamma |P|^2).',
      ],
      algorithmExplanation: [
        'Choose regularization gamma and smoothing operator C (often Laplacian).',
        'Construct CLS filter in frequency domain.',
        'Recover image via inverse transform.',
      ],
      example:
        'CLS reduces noise amplification compared with raw inverse filtering.',
      practicalNotes: [
        'Advantage: stable inversion with tunable regularization.',
        'Disadvantage: gamma tuning is data dependent.',
        'Limitation: over-regularization oversmooths details.',
      ],
      visualizerExperiments: ['Run Constrained Least Squares Filtering and vary gamma.'],
    },
    {
      topic: 'Geometric Mean Filtering',
      conceptOverview: [
        'Geometric mean filtering blends inverse and Wiener behaviors.',
        'Interpolation parameter controls tradeoff between sharp inversion and noise-robust MMSE behavior.',
      ],
      intuition:
        'A continuum between aggressive deblurring and conservative denoising-restoration.',
      mathematicalModel: [
        'Hgm = [H*/|H|^2]^alpha [H*/(|H|^2 + Sn/Sf)]^(1-alpha), 0<=alpha<=1.',
        'alpha=1 -> inverse-like; alpha=0 -> Wiener-like.',
      ],
      algorithmExplanation: [
        'Build inverse and Wiener components.',
        'Combine via geometric exponent weighting.',
        'Apply and evaluate balance of sharpness vs noise.',
      ],
      example:
        'Moderate alpha can preserve more detail than Wiener while avoiding full inverse instability.',
      practicalNotes: [
        'Advantage: flexible hybrid restoration behavior.',
        'Disadvantage: extra hyperparameters increase tuning complexity.',
        'Limitation: still depends on degradation/noise assumptions.',
      ],
      visualizerExperiments: ['Run Geometric Mean Filtering and vary alpha and K.'],
    },
    {
      topic: 'Radon Transform',
      conceptOverview: [
        'Radon transform represents an image by line integrals over many projection angles.',
      ],
      intuition:
        'Imagine shining X-rays through an object from many directions and measuring total attenuation along each ray.',
      mathematicalModel: [
        'p_theta(s) = integral f(x,y) delta(x cos theta + y sin theta - s) dx dy.',
      ],
      algorithmExplanation: [
        'Rotate coordinate system by angle theta.',
        'Integrate image values along lines for each detector position s.',
        'Stack projections into sinogram.',
      ],
      example:
        'CT scanners acquire sinograms that are later reconstructed into slices.',
      practicalNotes: [
        'Advantage: physically meaningful projection representation.',
        'Disadvantage: acquisition/reconstruction sensitive to noise and sampling.',
        'Limitation: limited-angle projections produce reconstruction artifacts.',
      ],
      visualizerExperiments: ['Run Radon Transform and vary number of projection angles.'],
    },
    {
      topic: 'Fourier Slice Theorem',
      conceptOverview: [
        'The 1-D Fourier transform of a projection equals a radial slice of the 2-D Fourier transform.',
      ],
      intuition:
        'Each projection contributes one line in frequency space; many angles fill the spectrum.',
      mathematicalModel: [
        'P_theta(omega) = F(omega cos theta, omega sin theta).',
      ],
      algorithmExplanation: [
        'Compute projection at angle theta.',
        'Take 1-D FFT of that projection.',
        'Relate it to corresponding line through 2-D image spectrum.',
      ],
      example:
        'Increasing projection angles fills frequency plane more densely, improving reconstruction quality.',
      practicalNotes: [
        'Advantage: foundational bridge between tomography and Fourier analysis.',
        'Disadvantage: sparse slices leave missing frequency information.',
        'Limitation: practical interpolation in Fourier space introduces errors.',
      ],
      visualizerExperiments: ['Run Fourier Slice Theorem demo and inspect 2D spectrum with 1D projection spectrum slice.'],
    },
    {
      topic: 'Image Reconstruction from Projections',
      conceptOverview: [
        'Reconstruction estimates image from projections, commonly by filtered back-projection (FBP).',
      ],
      intuition:
        'Back-project each view and combine them; filtering corrects over-blurring caused by raw back-projection.',
      mathematicalModel: [
        'FBP pipeline: filter projections (often Ram-Lak) -> back-project over all angles.',
        'Slice theorem provides theoretical basis for why this works.',
      ],
      algorithmExplanation: [
        'Acquire/compute sinogram.',
        'Apply frequency-domain ramp filter to each projection.',
        'Back-project filtered projections and normalize.',
      ],
      example:
        'CT reconstruction from multiple projection angles.',
      practicalNotes: [
        'Advantage: standard, interpretable reconstruction method.',
        'Disadvantage: noisy/limited-angle projections cause streak artifacts.',
        'Limitation: advanced iterative methods may outperform FBP in difficult scenarios.',
      ],
      visualizerExperiments: ['Run Image Reconstruction from Projections and vary number of angles to observe artifact reduction.'],
    },
  ],

  codeSnippet: '# Use Visualizer + Get Code for experiment-specific runnable scripts.',

  lab: {
    tools: [
      {
        id: 'degradation-model',
        label: 'Image Degradation Model',
        type: 'api',
        endpoint: '/api/restore/degradation-model',
        methodName: 'Degradation Model',
        params: [
          { key: 'blur_sigma', label: 'Blur Sigma', type: 'number', default: 2.0, min: 0.1, step: 0.1 },
          { key: 'noise_sigma', label: 'Noise Sigma', type: 'number', default: 10.0, min: 0, step: 0.1 },
        ],
      },
      {
        id: 'noise-model',
        label: 'Noise Models',
        type: 'api',
        endpoint: '/api/restore/noise-model',
        methodName: 'Noise Models',
        params: [
          {
            key: 'noise_type',
            label: 'Noise Type',
            type: 'select',
            default: 'gaussian',
            options: [
              { label: 'Gaussian', value: 'gaussian' },
              { label: 'Uniform', value: 'uniform' },
              { label: 'Rayleigh', value: 'rayleigh' },
              { label: 'Gamma', value: 'gamma' },
              { label: 'Exponential', value: 'exponential' },
              { label: 'Impulse', value: 'impulse' },
            ],
          },
          { key: 'amount', label: 'Noise Amount', type: 'number', default: 20.0, min: 0, step: 0.1 },
        ],
      },
      {
        id: 'spatial-noise-filter',
        label: 'Spatial Noise Reduction Filters',
        type: 'api',
        endpoint: '/api/restore/spatial-noise-filter',
        methodName: 'Spatial Noise Filter',
        params: [
          {
            key: 'method',
            label: 'Filter Type',
            type: 'select',
            default: 'median',
            options: [
              { label: 'Median', value: 'median' },
              { label: 'Mean', value: 'mean' },
              { label: 'Gaussian', value: 'gaussian' },
            ],
          },
          { key: 'ksize', label: 'Kernel Size', type: 'number', default: 5, min: 1, step: 2 },
        ],
      },
      {
        id: 'adaptive-noise-filter',
        label: 'Adaptive Noise Filtering',
        type: 'api',
        endpoint: '/api/restore/adaptive-local-filter',
        methodName: 'Adaptive Local Filter',
        params: [
          { key: 'ksize', label: 'Kernel Size', type: 'number', default: 7, min: 3, step: 2 },
          { key: 'noise_var', label: 'Noise Variance', type: 'number', default: 80.0, min: 0, step: 0.1 },
        ],
      },
      {
        id: 'periodic-noise-removal',
        label: 'Periodic Noise Removal',
        type: 'api',
        endpoint: '/api/frequency/notch-reject',
        methodName: 'Notch Reject for Periodic Noise',
        params: [
          { key: 'u0', label: 'Notch U Offset', type: 'number', default: 30, min: 0, step: 1 },
          { key: 'v0', label: 'Notch V Offset', type: 'number', default: 30, min: 0, step: 1 },
          { key: 'radius', label: 'Notch Radius', type: 'number', default: 8, min: 1, step: 1 },
        ],
      },
      {
        id: 'linear-degradation',
        label: 'Linear Degradation Systems',
        type: 'api',
        endpoint: '/api/restore/linear-degradation',
        methodName: 'Linear LSI Degradation',
        params: [
          {
            key: 'model',
            label: 'Degradation Model',
            type: 'select',
            default: 'motion',
            options: [
              { label: 'Motion', value: 'motion' },
              { label: 'Gaussian', value: 'gaussian' },
            ],
          },
          { key: 'ksize', label: 'Kernel Size', type: 'number', default: 15, min: 3, step: 2 },
        ],
      },
      {
        id: 'estimate-psf',
        label: 'Estimating Blur Functions',
        type: 'api',
        endpoint: '/api/restore/estimate-psf',
        methodName: 'PSF Estimation Demo',
        params: [
          {
            key: 'model',
            label: 'PSF Model',
            type: 'select',
            default: 'motion',
            options: [
              { label: 'Motion PSF', value: 'motion' },
              { label: 'Gaussian PSF', value: 'gaussian' },
            ],
          },
          { key: 'size', label: 'PSF Size', type: 'number', default: 15, min: 3, step: 2 },
        ],
      },
      {
        id: 'motion-modeling',
        label: 'Motion Blur Modeling',
        type: 'api',
        endpoint: '/api/restore/motion-blur',
        methodName: 'Motion Blur Modeling',
        defaultParam: 15,
        paramLabel: 'Kernel Size',
        paramKey: 'size',
        paramMin: 3,
        paramStep: 2,
      },
      {
        id: 'inverse-filter',
        label: 'Inverse Filtering',
        type: 'api',
        endpoint: '/api/restore/inverse-filter',
        methodName: 'Inverse Filtering',
        params: [
          { key: 'motion_size', label: 'Motion Kernel', type: 'number', default: 15, min: 3, step: 2 },
          { key: 'eps', label: 'Stability Epsilon', type: 'number', default: 0.01, min: 0.0001, step: 0.001 },
        ],
      },
      { id: 'wiener', label: 'Wiener Filtering', type: 'api', endpoint: '/api/restore/wiener-filter', methodName: 'Wiener Filter' },
      {
        id: 'cls-filter',
        label: 'Constrained Least Squares Filtering',
        type: 'api',
        endpoint: '/api/restore/cls-filter',
        methodName: 'CLS Filtering',
        params: [
          { key: 'motion_size', label: 'Motion Kernel', type: 'number', default: 15, min: 3, step: 2 },
          { key: 'gamma', label: 'Regularization Gamma', type: 'number', default: 0.002, min: 0.0001, step: 0.0005 },
        ],
      },
      {
        id: 'geometric-mean-filter',
        label: 'Geometric Mean Filtering',
        type: 'api',
        endpoint: '/api/restore/geometric-mean-filter',
        methodName: 'Geometric Mean Filter',
        params: [
          { key: 'motion_size', label: 'Motion Kernel', type: 'number', default: 15, min: 3, step: 2 },
          { key: 'alpha', label: 'Alpha (0-1)', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
          { key: 'k', label: 'K (Noise Ratio)', type: 'number', default: 0.01, min: 0.0001, step: 0.001 },
        ],
      },
      {
        id: 'radon-transform',
        label: 'Radon Transform',
        type: 'api',
        endpoint: '/api/restore/radon-transform',
        methodName: 'Radon Transform',
        defaultParam: 90,
        paramLabel: 'Number of Angles',
        paramKey: 'num_angles',
        paramMin: 10,
        paramMax: 180,
        paramStep: 1,
      },
      {
        id: 'fourier-slice',
        label: 'Fourier Slice Theorem',
        type: 'api',
        endpoint: '/api/restore/fourier-slice',
        methodName: 'Fourier Slice Theorem',
        defaultParam: 45,
        paramLabel: 'Slice Angle',
        paramKey: 'angle',
        paramMin: 0,
        paramMax: 179,
        paramStep: 1,
      },
      {
        id: 'reconstruct-projections',
        label: 'Image Reconstruction from Projections',
        type: 'api',
        endpoint: '/api/restore/reconstruct-projections',
        methodName: 'Filtered Back Projection',
        defaultParam: 90,
        paramLabel: 'Number of Angles',
        paramKey: 'num_angles',
        paramMin: 10,
        paramMax: 180,
        paramStep: 1,
      },
    ],
  },
};