export const chapter3Module = {
  id: 'intensity-and-spatial-filtering',
  chapter: 'Chapter 3',
  title: 'Intensity Transformations and Spatial Filtering',
  routeTitle: 'Image Enhancement in the Spatial Domain',
  overview:
    'This module follows Chapter 3 of Gonzalez and explains spatial-domain enhancement from point operations to neighborhood filtering, with mathematical foundations and practical workflow guidance.',
  hideReferenceCode: true,

  lessons: [
    {
      topic: 'Spatial Domain Image Enhancement',
      conceptOverview: [
        'Spatial-domain enhancement operates directly on pixels in the image plane.',
        'Two broad classes are used: point processing (single pixel mapping) and neighborhood processing (filtering with surrounding pixels).',
        'Goal is to improve visual quality or task-specific quality (for example edge visibility, contrast, or noise suppression).',
      ],
      intuition:
        'Point processing is like changing each student\'s score independently using a formula. Neighborhood processing is like grading each student based on nearby classmates too.',
      mathematicalModel: [
        'General spatial enhancement model: g(x,y) = T[f(x,y)].',
        'Point transform form: s = T(r), where r is input gray level and s is output gray level.',
        'Neighborhood form: g(x,y) = T{f(s,t) | (s,t) in neighborhood of (x,y)}.',
      ],
      algorithmExplanation: [
        'Choose enhancement objective: brighten dark image, suppress noise, or sharpen detail.',
        'Select point transform or filter family.',
        'Tune parameters, inspect artifacts, and iterate.',
        'Validate with visual result plus histogram/edge behavior.',
      ],
      example:
        'A noisy low-contrast image can be improved by smoothing first and then applying sharpening or contrast enhancement.',
      practicalNotes: [
        'Advantage: simple and fast methods with interpretable effects.',
        'Disadvantage: aggressive tuning may create halos or amplify noise.',
        'Limitation: one fixed transform rarely works for every region of an image.',
      ],
      visualizerExperiments: [
        'Run Negative, Log Transform, Gamma Correction for point operations.',
        'Run Mean/Median/Gaussian for smoothing and Laplacian/Unsharp/Sharpen for detail enhancement.',
      ],
    },
    {
      topic: 'Intensity Transformations',
      conceptOverview: [
        'Intensity transformations map each pixel value to a new value without using neighbors.',
        'They are used for contrast control, dynamic-range compression, brightness correction, and emphasis of dark or bright regions.',
      ],
      intuition:
        'Imagine a lookup table that says: if input brightness is 40, output 80; if input is 200, output 220. Every pixel follows the same rule.',
      mathematicalModel: [
        'Point transform: s = T(r).',
        'Monotonic T preserves order of intensities; non-monotonic T can reorder tones.',
        'Piecewise linear transforms are common for contrast stretching and threshold-like behavior.',
      ],
      algorithmExplanation: [
        'Define a transfer function T over gray range [0, L-1].',
        'Apply T to each pixel independently.',
        'Check histogram shift/spread and perceived contrast.',
      ],
      example:
        'Gamma correction with gamma < 1 can brighten shadow regions in underexposed images.',
      practicalNotes: [
        'Advantage: computationally cheap and easy to control.',
        'Disadvantage: does not remove spatial noise patterns by itself.',
        'Limitation: global mapping may overcorrect some regions while undercorrecting others.',
      ],
      visualizerExperiments: [
        'Compare Negative, Log, and Gamma on the same image and note which tones each transform emphasizes.',
      ],
    },
    {
      topic: 'Image Negatives',
      conceptOverview: [
        'Image negative reverses intensities so bright becomes dark and dark becomes bright.',
        'Useful when dark details in bright regions are hard to interpret in original polarity.',
      ],
      intuition:
        'Like photographic film negatives: inversion can make hidden structures pop out due to contrast reversal.',
      mathematicalModel: [
        'For L gray levels: s = (L - 1) - r.',
        'For 8-bit images (L = 256): s = 255 - r.',
      ],
      algorithmExplanation: [
        'Take each pixel value r.',
        'Compute inverted value 255-r (8-bit).',
        'Display and compare visibility of previously subtle structures.',
      ],
      example:
        'A chest scan with bright background and subtle dark tissue boundaries can become easier to inspect after inversion.',
      practicalNotes: [
        'Advantage: immediate enhancement in specific diagnostic/inspection contexts.',
        'Disadvantage: not universally preferred for human viewing.',
        'Limitation: does not inherently improve SNR or recover lost detail.',
      ],
      visualizerExperiments: [
        'Use Negative Transform and compare edges/textures against original.',
      ],
    },
    {
      topic: 'Log Transformations',
      conceptOverview: [
        'Log transforms expand low-intensity values and compress high-intensity values.',
        'Useful for images where important information lies in darker ranges.',
      ],
      intuition:
        'Like turning up shadows more than highlights with a nonlinear brightness knob.',
      mathematicalModel: [
        's = c * log(1 + r), where c is scaling constant.',
        'Typical normalization: c = (L - 1) / log(1 + (L - 1)).',
      ],
      algorithmExplanation: [
        'Convert intensity to float for stable computation.',
        'Apply log(1+r) transform.',
        'Normalize back to display range [0,255].',
      ],
      example:
        'Log transform is commonly used to visualize Fourier spectrum magnitudes with very large dynamic range.',
      practicalNotes: [
        'Advantage: reveals detail in dark regions and compresses highlights.',
        'Disadvantage: can flatten bright areas too much.',
        'Limitation: sensitivity to scaling/normalization choice.',
      ],
      visualizerExperiments: [
        'Run Log Transform on dark and high-contrast images; observe shadow expansion.',
      ],
    },
    {
      topic: 'Power Law Transformations',
      conceptOverview: [
        'Power-law (gamma) transforms control brightness nonlinearly.',
        'They are fundamental in display correction and perceptual tone control.',
      ],
      intuition:
        'Gamma is a curve: gamma < 1 lifts shadows, gamma > 1 darkens mid-tones and shadows.',
      mathematicalModel: [
        's = c * r^gamma with r normalized to [0,1].',
        'gamma < 1 -> brighter dark regions; gamma > 1 -> darker output.',
      ],
      algorithmExplanation: [
        'Normalize input intensities to [0,1].',
        'Apply exponent gamma.',
        'Rescale to [0,255] and convert back to 8-bit.',
      ],
      example:
        'Display gamma correction ensures image appearance remains consistent across capture/display devices.',
      practicalNotes: [
        'Advantage: flexible and intuitive brightness control.',
        'Disadvantage: poor gamma choice can wash out details.',
        'Limitation: global gamma may not suit images with mixed illumination.',
      ],
      visualizerExperiments: [
        'Run Gamma Correction with gamma values 0.5, 1.0, 1.5, 2.2 and compare.',
      ],
    },
    {
      topic: 'Histogram Processing',
      conceptOverview: [
        'Histogram processing uses intensity distribution to design enhancement operations.',
        'It helps detect low-contrast images and guides redistribution of gray levels.',
      ],
      intuition:
        'Histogram is like population density of brightness values: crowding in a narrow range means poor contrast.',
      mathematicalModel: [
        'Histogram count h(r_k): number of pixels at gray level r_k.',
        'Normalized histogram: p(r_k) = h(r_k) / (MN), interpreted as probability mass function.',
        'Cumulative distribution function (CDF): c(r_k) = sum_{j=0..k} p(r_j).',
      ],
      algorithmExplanation: [
        'Compute histogram of image intensities.',
        'Identify spread, peaks, and skew.',
        'Apply suitable remapping (stretching/equalization).',
        'Recompute histogram and compare contrast changes.',
      ],
      example:
        'A foggy scene often has a narrow histogram cluster; stretching or equalization broadens useful tones.',
      practicalNotes: [
        'Advantage: data-driven enhancement design.',
        'Disadvantage: global histogram ignores local context.',
        'Limitation: can over-enhance noise in sparse regions.',
      ],
      visualizerExperiments: [
        'Run Histogram Equalization and compare outputs for low-contrast versus already-high-contrast images.',
      ],
    },
    {
      topic: 'Histogram Equalization',
      conceptOverview: [
        'Histogram equalization remaps intensities using CDF to spread gray levels more uniformly.',
        'It is a standard global contrast enhancement technique.',
      ],
      intuition:
        'Imagine redistributing students from crowded benches to empty benches so everyone has more space; equalization redistributes intensity occupancy.',
      mathematicalModel: [
        'Transform: s_k = (L - 1) * sum_{j=0..k} p(r_j).',
        'This CDF-based mapping is monotonic and stretches densely populated ranges.',
      ],
      algorithmExplanation: [
        'Compute normalized histogram p(r_k).',
        'Compute cumulative sum (CDF).',
        'Map each input level through CDF-based transform.',
        'Generate enhanced image and inspect histogram spread.',
      ],
      example:
        'A dull grayscale road image becomes clearer after equalization, revealing lane boundaries and texture.',
      practicalNotes: [
        'Advantage: effective, automatic global contrast improvement.',
        'Disadvantage: may produce unnatural appearance in some scenes.',
        'Limitation: global equalization can over-brighten dark noise or suppress local tone intent.',
      ],
      visualizerExperiments: [
        'Run Histogram Equalization and compare before/after local detail visibility.',
      ],
    },
    {
      topic: 'Spatial Filtering Theory',
      conceptOverview: [
        'Spatial filtering modifies each pixel using a local neighborhood and a mask/kernel.',
        'Linear filters are weighted sums; nonlinear filters (for example median) use order statistics.',
      ],
      intuition:
        'A kernel is a stencil sliding over the image; at each position it computes a new value from nearby pixels.',
      mathematicalModel: [
        'Linear filtering (convolution form): g(x,y) = sum_i sum_j h(i,j) f(x-i, y-j).',
        'Correlation form differs in sign of indices and is often used in implementations.',
        'Kernel sum impacts brightness preservation (sum=1 for averaging).',
      ],
      algorithmExplanation: [
        'Choose kernel based on objective: smooth or sharpen.',
        'Slide kernel across image and compute output at each location.',
        'Handle borders (replicate/reflect/constant).',
      ],
      example:
        'A 3x3 mean mask smooths random noise but blurs sharp edges.',
      practicalNotes: [
        'Advantage: highly flexible local enhancement framework.',
        'Disadvantage: parameter/kernel choice is task dependent.',
        'Limitation: linear filters cannot handle all noise types optimally.',
      ],
      visualizerExperiments: [
        'Compare Mean, Gaussian, Median, Laplacian, Sharpen, and Unsharp to understand filter families.',
      ],
    },
    {
      topic: 'Smoothing Filters',
      conceptOverview: [
        'Smoothing suppresses noise and small intensity fluctuations.',
        'Common methods: mean/box filter, Gaussian filter, and median filter (nonlinear).',
      ],
      intuition:
        'Like averaging nearby measurements to reduce random fluctuations in a sensor stream.',
      mathematicalModel: [
        'Mean filter kernel h(i,j)=1/(mn) over m x n window.',
        'Median filter output is median of neighborhood set (order statistic).',
      ],
      algorithmExplanation: [
        'Pick window size and smoothing type.',
        'Apply filter over full image.',
        'Measure noise reduction and edge blurring tradeoff.',
      ],
      example:
        'Salt-and-pepper noise is better handled by median filter than mean filter.',
      practicalNotes: [
        'Advantage: improved visual cleanliness and downstream stability.',
        'Disadvantage: excessive smoothing removes texture/edges.',
        'Limitation: no single smoother is best for all noise models.',
      ],
      visualizerExperiments: [
        'Compare Mean vs Median vs Gaussian on noisy inputs.',
      ],
    },
    {
      topic: 'Gaussian Filtering',
      conceptOverview: [
        'Gaussian filtering is weighted smoothing with strongest weight at center and decaying weights outward.',
        'It is widely used because it reduces noise with fewer artifacts than plain box averaging.',
      ],
      intuition:
        'Nearby pixels influence output more than far pixels, like trust decreasing with distance.',
      mathematicalModel: [
        '2D Gaussian kernel: G(x,y) = (1/(2*pi*sigma^2)) * exp(-(x^2 + y^2)/(2*sigma^2)).',
        'Larger sigma gives stronger blur.',
      ],
      algorithmExplanation: [
        'Choose sigma and kernel size (often odd dimensions).',
        'Construct Gaussian mask and normalize.',
        'Convolve with image.',
      ],
      example:
        'Pre-smoothing with Gaussian before edge detection often stabilizes Canny edges.',
      practicalNotes: [
        'Advantage: smooth, natural noise suppression.',
        'Disadvantage: still blurs edges as sigma increases.',
        'Limitation: not edge-preserving compared with advanced nonlinear methods.',
      ],
      visualizerExperiments: [
        'Run Gaussian Blur with different kernel sizes and inspect detail loss versus noise reduction.',
      ],
    },
    {
      topic: 'Sharpening Filters',
      conceptOverview: [
        'Sharpening emphasizes intensity transitions, making edges and fine detail more prominent.',
        'Often implemented using derivatives or highpass kernels.',
      ],
      intuition:
        'Sharpening boosts local differences, like increasing the contrast at boundaries between regions.',
      mathematicalModel: [
        'First derivative responds to ramps/edges; second derivative responds strongly to fine transitions.',
        'Typical highpass-like kernel example: [[0,-1,0],[-1,5,-1],[0,-1,0]].',
      ],
      algorithmExplanation: [
        'Compute edge/detail emphasis using highpass or derivative mask.',
        'Add or blend detail-enhanced result with original.',
        'Control gain to avoid overshoot artifacts.',
      ],
      example:
        'Mild sharpening after denoising often improves perceived clarity in document scans.',
      practicalNotes: [
        'Advantage: stronger edge definition and detail perception.',
        'Disadvantage: amplifies noise if applied before denoising.',
        'Limitation: excessive sharpening causes ringing/halo artifacts.',
      ],
      visualizerExperiments: [
        'Run Sharpen filter and compare with Laplacian and Unsharp outputs.',
      ],
    },
    {
      topic: 'Laplacian Filtering',
      conceptOverview: [
        'Laplacian is a second-derivative operator used for isotropic edge/detail emphasis.',
        'It highlights rapid intensity changes irrespective of direction.',
      ],
      intuition:
        'Laplacian reacts where intensity curvature is high, similar to detecting bending in a signal surface.',
      mathematicalModel: [
        'Continuous Laplacian: del^2 f = (d^2 f / dx^2) + (d^2 f / dy^2).',
        'Discrete masks include forms such as [[0,1,0],[1,-4,1],[0,1,0]] or [[1,1,1],[1,-8,1],[1,1,1]].',
        'Sharpening via addition/subtraction depending on mask sign convention.',
      ],
      algorithmExplanation: [
        'Convert image to grayscale if needed.',
        'Apply Laplacian operator.',
        'Scale absolute response for display or combine with original for sharpening.',
      ],
      example:
        'Laplacian response reveals fine edges of text strokes and object boundaries.',
      practicalNotes: [
        'Advantage: direction-independent edge emphasis.',
        'Disadvantage: very sensitive to noise.',
        'Limitation: usually requires pre-smoothing for stable results.',
      ],
      visualizerExperiments: [
        'Run Laplacian alone, then compare with Gaussian+Laplacian workflow.',
      ],
    },
    {
      topic: 'Unsharp Masking',
      conceptOverview: [
        'Unsharp masking sharpens by subtracting a blurred version to extract high-frequency detail, then adding it back.',
        'High-boost filtering is a generalized form with tunable detail gain.',
      ],
      intuition:
        'Blurred image is the low-frequency base; subtracting it isolates detail. Re-adding amplified detail increases sharpness.',
      mathematicalModel: [
        'Mask: m(x,y) = f(x,y) - f_blur(x,y).',
        'Unsharp result: g(x,y) = f(x,y) + k * m(x,y).',
        'k=1 gives standard unsharp masking; k>1 gives high-boost behavior.',
      ],
      algorithmExplanation: [
        'Blur the original image (often Gaussian).',
        'Compute detail mask original - blurred.',
        'Add scaled mask back to original and clip range.',
      ],
      example:
        'Portrait image sharpening uses small-radius blur and moderate gain to improve perceived detail without heavy artifacts.',
      practicalNotes: [
        'Advantage: controllable detail enhancement with intuitive parameters.',
        'Disadvantage: can amplify noise and create halos around high-contrast edges.',
        'Limitation: parameter tuning depends heavily on image content.',
      ],
      visualizerExperiments: [
        'Run Unsharp Mask and compare against Sharpen kernel and Laplacian.',
      ],
    },
    {
      topic: 'Highpass / Bandpass Filter Construction',
      conceptOverview: [
        'Highpass filters suppress slowly varying background and keep rapid intensity changes (detail/edges).',
        'Bandpass behavior can be approximated in spatial workflows by combining smoothing and sharpening responses to keep mid-frequency structures.',
      ],
      intuition:
        'Think of an audio equalizer: low frequencies are removed (highpass), or only a middle frequency band is emphasized (bandpass).',
      mathematicalModel: [
        'Highpass-by-subtraction idea: f_high = f - f_low.',
        'Difference of Gaussians (DoG) approximation to bandpass: DoG = G(sigma1) * f - G(sigma2) * f, sigma2 > sigma1.',
        'Unsharp masking is a practical highpass enhancement form.',
      ],
      algorithmExplanation: [
        'Generate lowpass image via Gaussian/mean smoothing.',
        'Subtract lowpass from original to extract high-frequency content.',
        'Optionally combine multiple scales (DoG-style) for band-like emphasis.',
      ],
      example:
        'Surface defect inspection often benefits from removing smooth background shading and emphasizing local texture changes.',
      practicalNotes: [
        'Advantage: strong local detail emphasis and background suppression.',
        'Disadvantage: noisy images can become harsh if high frequencies are over-amplified.',
        'Limitation: true frequency-selective bandpass design is more direct in frequency-domain methods.',
      ],
      visualizerExperiments: [
        'Approximate highpass by comparing original with Gaussian-smoothed and Unsharp outputs.',
        'For explicit bandpass masks, continue with Chapter 4 frequency-domain visualizer tools.',
      ],
    },
    {
      topic: 'Combining Enhancement Techniques',
      conceptOverview: [
        'Practical enhancement pipelines combine multiple methods in sequence.',
        'Typical order: denoise -> contrast adjustment -> sharpening -> edge emphasis as needed.',
      ],
      intuition:
        'Like photo editing workflow: clean noise first, then tone adjustment, then final crispness.',
      mathematicalModel: [
        'Pipeline composition: g = T_n(...T_2(T_1(f))...).',
        'Order matters because transforms are generally non-commutative: T_a(T_b(f)) != T_b(T_a(f)).',
      ],
      algorithmExplanation: [
        'Define task objective and artifact tolerance.',
        'Apply smoothing (if noisy), then intensity/histogram transform.',
        'Apply sharpening with controlled gain.',
        'Validate visually and tune parameters iteratively.',
      ],
      example:
        'For a dim noisy image: median filter -> gamma correction -> unsharp mask often yields balanced readability.',
      practicalNotes: [
        'Advantage: better results than single-step enhancement.',
        'Disadvantage: parameter search space grows quickly.',
        'Limitation: overprocessing may produce artificial appearance and lose authenticity.',
      ],
      visualizerExperiments: [
        'Try sequence experiments manually: Gaussian or Median first, then Histogram Equalization or Gamma, then Unsharp or Sharpen.',
        'Compare with direct sharpening without pre-smoothing to observe noise amplification.',
      ],
    },
  ],

  codeSnippet: '# Use Visualizer + Get Code for experiment-specific runnable scripts.',

  lab: {
    tools: [
      { id: 'hist-eq', label: 'Histogram Equalization', type: 'api', endpoint: '/api/enhance/histogram-eq', methodName: 'Histogram Equalization' },
      { id: 'gaussian', label: 'Gaussian Blur', type: 'api', endpoint: '/api/enhance/gaussian-blur', methodName: 'Gaussian Smoothing', defaultParam: 5, paramLabel: 'Kernel Size', paramKey: 'kernel' },
      { id: 'edge', label: 'Edge Detection', type: 'api', endpoint: '/api/enhance/edge-detect', methodName: 'Canny Edge Detection' },
      { id: 'negative', label: 'Negative Transform', type: 'api', endpoint: '/api/enhance/negative', methodName: 'Negative Transform' },
      { id: 'log-transform', label: 'Log Transform', type: 'api', endpoint: '/api/enhance/log-transform', methodName: 'Log Transform' },
      {
        id: 'gamma',
        label: 'Gamma Correction',
        type: 'api',
        endpoint: '/api/enhance/gamma',
        methodName: 'Gamma Transform',
        params: [{ key: 'gamma', label: 'Gamma', type: 'number', default: 1.5, min: 0.1, max: 5, step: 0.1 }],
      },
      {
        id: 'median',
        label: 'Median Filter',
        type: 'api',
        endpoint: '/api/enhance/median-filter',
        methodName: 'Median Filter',
        params: [{ key: 'kernel', label: 'Kernel Size', type: 'number', default: 5, min: 1, max: 31, step: 2 }],
      },
      { id: 'laplacian', label: 'Laplacian', type: 'api', endpoint: '/api/enhance/laplacian', methodName: 'Laplacian' },
      {
        id: 'mean',
        label: 'Mean Filter',
        type: 'api',
        endpoint: '/api/enhance/mean-filter',
        methodName: 'Mean Filter',
        params: [{ key: 'kernel', label: 'Kernel Size', type: 'number', default: 5, min: 1, max: 31, step: 2 }],
      },
      { id: 'unsharp', label: 'Unsharp Mask', type: 'api', endpoint: '/api/enhance/unsharp-mask', methodName: 'Unsharp Mask' },
      { id: 'sharpen', label: 'Sharpen', type: 'api', endpoint: '/api/enhance/sharpen', methodName: 'Sharpen Filter' },
    ],
  },
};
