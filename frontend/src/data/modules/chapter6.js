export const chapter6Module = {
  id: 'color-image-processing',
  chapter: 'Chapter 6',
  title: 'Color Image Processing',
  routeTitle: 'Color Models, Transformations, and Analysis',
  overview:
    'This module follows Gonzalez Chapter 6: color fundamentals, color models, pseudocolor, full-color processing, transformations, filtering, segmentation, noise handling, vector methods, and compression.',
  hideReferenceCode: true,

  lessons: [
    {
      topic: 'Color Perception Fundamentals',
      conceptOverview: [
        'Human color perception is based on trichromatic cone response across visible wavelengths (~400nm to 700nm).',
        'Most digital color representations therefore use three components.',
      ],
      intuition:
        'The eye mixes responses of three cone types, similar to combining three basis sensors to represent many colors.',
      mathematicalModel: [
        'Additive color mixture: C = rR + gG + bB.',
        'Color vector representation: C = (R, G, B).',
      ],
      algorithmExplanation: [
        'Represent each pixel as 3-channel vector.',
        'Manipulate channel weights for color operations.',
        'Map channel vectors to display devices.',
      ],
      example:
        'Increasing red channel weight warms skin tones and highlights red features.',
      practicalNotes: [
        'Advantage: compact and hardware-aligned representation.',
        'Disadvantage: perceptual uniformity is weak in raw RGB space.',
        'Limitation: equal channel changes do not mean equal perceived color changes.',
      ],
      visualizerExperiments: ['Use RGB Color Model and the 3D simulator to inspect channel-dependent color movement.'],
    },
    {
      topic: 'RGB Color Model',
      conceptOverview: [
        'RGB is the standard additive model for displays and camera sensors.',
        'Each channel usually ranges 0..255 for 8-bit representation.',
      ],
      intuition:
        'RGB cube corners correspond to extreme colors (black, white, primaries, secondaries).',
      mathematicalModel: [
        'Color vector: C = (R, G, B), R,G,B in [0,255].',
        'Euclidean color distance in RGB: D = sqrt((R1-R2)^2 + (G1-G2)^2 + (B1-B2)^2).',
      ],
      algorithmExplanation: [
        'Acquire/display RGB image.',
        'Edit channel values or thresholds.',
        'Measure resulting color distances if needed.',
      ],
      example:
        'Color-based tracking can classify objects close to a target RGB centroid.',
      practicalNotes: [
        'Advantage: simple and direct for devices.',
        'Disadvantage: intensity and chromaticity are entangled.',
        'Limitation: less robust under illumination variation.',
      ],
      visualizerExperiments: ['Run RGB Color Model experiment and compare channel changes with HEX output in the simulator.'],
    },
    {
      topic: 'CMY and CMYK Models',
      conceptOverview: [
        'CMY is subtractive and used in printing contexts.',
        'CMYK adds a black (K) channel for better ink economy and deep blacks.',
      ],
      intuition:
        'Printing starts from white paper and removes reflected light via inks (subtraction), unlike displays (addition).',
      mathematicalModel: [
        'CMY conversion (normalized): C=1-R, M=1-G, Y=1-B.',
        'CMYK key channel: K=min(C,M,Y).',
        'Adjusted channels: C\'=C-K, M\'=M-K, Y\'=Y-K.',
      ],
      algorithmExplanation: [
        'Convert RGB to CMY.',
        'Extract K and residual C\'M\'Y\' for CMYK interpretation.',
      ],
      example:
        'A dark neutral region has high K contribution in CMYK workflows.',
      practicalNotes: [
        'Advantage: printing-friendly representation.',
        'Disadvantage: conversion details depend on device profiles.',
        'Limitation: naive conversion is not color-managed output.',
      ],
      visualizerExperiments: ['Run CMY/CMYK Models experiment with mode switching between CMY and CMYK-K view.'],
    },
    {
      topic: 'HSI / HSV Color Model',
      conceptOverview: [
        'HSI/HSV separate chromatic attributes from brightness-like components.',
        'Useful for intuitive color editing and segmentation by hue/saturation thresholds.',
      ],
      intuition:
        'Hue is angle on a color wheel; saturation is purity; intensity/value controls brightness.',
      mathematicalModel: [
        'HSI intensity: I=(R+G+B)/3.',
        'Saturation form: S=1-(3/(R+G+B))*min(R,G,B).',
        'Hue from inverse-cosine geometry in normalized RGB triangle.',
      ],
      algorithmExplanation: [
        'Convert RGB/BGR to HSV/HSI-like representation.',
        'Apply operations on H/S/I(V) channels.',
        'Convert back to display space.',
      ],
      example:
        'Hue thresholding isolates orange objects even when intensity changes moderately.',
      practicalNotes: [
        'Advantage: more interpretable controls for many tasks.',
        'Disadvantage: hue becomes unstable near low saturation.',
        'Limitation: conversions can be sensitive to quantization and lighting.',
      ],
      visualizerExperiments: ['Run HSI/HSV Color Model and HSV Color Segmentation experiments.'],
    },
    {
      topic: 'Color Space Transformations',
      conceptOverview: [
        'Linear/nonlinear transforms map colors between spaces to support specific tasks.',
        'Luminance-chrominance spaces support compression and broadcast pipelines.',
      ],
      intuition:
        'Changing basis can separate what we care about (brightness) from what we can compress more (chroma).',
      mathematicalModel: [
        'Linear transform form: C\' = A C.',
        'Example RGB->YUV uses matrix multiplication with luminance/chrominance coefficients.',
      ],
      algorithmExplanation: [
        'Choose target space (YUV/YCrCb/Lab/HSV).',
        'Apply transform.',
        'Perform task-specific processing and inverse transform if needed.',
      ],
      example:
        'Skin segmentation often works better in YCrCb/HSV than in raw RGB.',
      practicalNotes: [
        'Advantage: improved separability for downstream processing.',
        'Disadvantage: extra conversion cost and potential rounding error.',
        'Limitation: no universal best color space for all tasks.',
      ],
      visualizerExperiments: ['Use Color Space Transformations with YUV, YCrCb, and Lab options.'],
    },
    {
      topic: 'Pseudocolor Processing',
      conceptOverview: [
        'Pseudocolor maps grayscale intensities into artificial colors to improve interpretability.',
      ],
      intuition:
        'Instead of many similar gray levels, map ranges to distinct colors that the eye separates more easily.',
      mathematicalModel: [
        'Mapping function: C = T(r), grayscale to color vector.',
        'Intensity slicing partitions r_k <= r < r_{k+1} and maps to color C_k.',
      ],
      algorithmExplanation: [
        'Convert source to grayscale if needed.',
        'Choose colormap and apply mapping.',
        'Inspect whether target structures become easier to distinguish.',
      ],
      example:
        'Thermal-like pseudocolor highlights subtle gradients in medical and remote sensing images.',
      practicalNotes: [
        'Advantage: improves human visual discrimination.',
        'Disadvantage: may imply false quantitative precision.',
        'Limitation: colormap choice can bias interpretation.',
      ],
      visualizerExperiments: ['Run Pseudocolor Processing and compare Jet/Hot/Turbo/Viridis maps.'],
    },
    {
      topic: 'Full-Color Image Representation',
      conceptOverview: [
        'A full-color image is a vector field: f(x,y)=[R(x,y),G(x,y),B(x,y)]^T.',
        'Processing can be per-channel or truly vector-valued.',
      ],
      intuition:
        'Each pixel is a 3D point in color space, not just a scalar intensity.',
      mathematicalModel: [
        'Vector transform: g(x,y)=T[f(x,y)].',
        'Per-channel strategy: R\'=T(R), G\'=T(G), B\'=T(B).',
      ],
      algorithmExplanation: [
        'Choose per-channel or vector method.',
        'Apply transform/filter consistently across channels.',
        'Recombine channels to final color image.',
      ],
      example:
        'Channel visualization reveals which channel carries strongest object contrast.',
      practicalNotes: [
        'Advantage: flexible representation for many algorithms.',
        'Disadvantage: channel-wise independent processing may create color artifacts.',
        'Limitation: vector methods are computationally heavier.',
      ],
      visualizerExperiments: ['Run Full-Color Image Representation to inspect separated R, G, B channel views.'],
    },
    {
      topic: 'Color Filtering Techniques',
      conceptOverview: [
        'Smoothing/sharpening can be applied per channel or vector-wise.',
        'Per-channel filtering is common in practice for simplicity.',
      ],
      intuition:
        'Filter each channel as if it were grayscale, then merge back to color output.',
      mathematicalModel: [
        'Per-channel: R\'=R*h, G\'=G*h, B\'=B*h.',
        'Vector form: g(x,y)=sum w(s,t) f(x+s,y+t), with f as 3D vectors.',
      ],
      algorithmExplanation: [
        'Pick smoothing or sharpening kernel/filter type.',
        'Apply consistently across color channels.',
        'Check detail/noise and color fidelity tradeoff.',
      ],
      example:
        'Gaussian channel smoothing reduces chroma noise; sharpening increases edge salience.',
      practicalNotes: [
        'Advantage: direct extension of grayscale filtering.',
        'Disadvantage: may shift colors if channels respond differently.',
        'Limitation: edge-aware vector approaches may be superior but costlier.',
      ],
      visualizerExperiments: ['Run Color Filtering Techniques with mean, gaussian, and sharpen modes.'],
    },
    {
      topic: 'Color Edge Detection',
      conceptOverview: [
        'Color edges can be stronger than grayscale edges because channel transitions may differ.',
      ],
      intuition:
        'An object can change color without large brightness change; grayscale edges may miss this.',
      mathematicalModel: [
        'Channel gradient magnitude aggregation: E=max(||grad R||, ||grad G||, ||grad B||) or vector norm fusion.',
      ],
      algorithmExplanation: [
        'Compute gradients per channel.',
        'Fuse channel edge responses.',
        'Map magnitude to displayable edge image.',
      ],
      example:
        'Colored boundaries on equal-intensity background are detected more reliably in color-edge processing.',
      practicalNotes: [
        'Advantage: captures chromatic boundaries missed by luminance-only edge detectors.',
        'Disadvantage: more sensitive to channel-specific noise.',
        'Limitation: requires robust channel fusion strategy.',
      ],
      visualizerExperiments: ['Run Color Edge Detection and compare against grayscale edge intuition.'],
    },
    {
      topic: 'Color-Based Segmentation',
      conceptOverview: [
        'Color cues can separate objects when intensity alone is insufficient.',
        'Common approaches threshold in HSV/HSI or compute RGB-space distance to a target color.',
      ],
      intuition:
        'Select pixels close to a desired color cluster and suppress the rest.',
      mathematicalModel: [
        'RGB Euclidean distance: D=sqrt((R1-R2)^2+(G1-G2)^2+(B1-B2)^2).',
        'HSV thresholding uses bounded intervals on H,S,V channels.',
      ],
      algorithmExplanation: [
        'Pick target color representation (HSV range or RGB target + threshold).',
        'Compute mask.',
        'Extract segmented region.',
      ],
      example:
        'Fruit detection often uses hue ranges that remain separable under moderate illumination changes.',
      practicalNotes: [
        'Advantage: often strong discriminative power.',
        'Disadvantage: illumination and white balance can shift clusters.',
        'Limitation: overlapping object colors require additional cues.',
      ],
      visualizerExperiments: ['Run HSV Color Segmentation and RGB Distance Segmentation experiments.'],
    },
    {
      topic: 'Noise in Color Images',
      conceptOverview: [
        'Noise may affect channels independently or jointly depending on acquisition chain.',
      ],
      intuition:
        'Each channel has its own noise sample, so visible artifacts can appear as chroma speckles.',
      mathematicalModel: [
        'Vector noise model: g(x,y)=f(x,y)+n(x,y), where n=[nR,nG,nB]^T.',
      ],
      algorithmExplanation: [
        'Model likely channel noise behavior.',
        'Inject/estimate noise for testing.',
        'Apply suitable color denoising method.',
      ],
      example:
        'Low-light phone images often show colored blotches due to chroma noise amplification.',
      practicalNotes: [
        'Advantage: explicit color-noise modeling improves denoising decisions.',
        'Disadvantage: channel-dependent noise estimation is harder than grayscale.',
        'Limitation: mixed Poisson-Gaussian noise needs advanced modeling.',
      ],
      visualizerExperiments: ['Run Noise in Color Images with gaussian and impulse modes.'],
    },
    {
      topic: 'Vector Filters',
      conceptOverview: [
        'Vector filters treat each pixel as a 3D color vector and optimize vector distances.',
        'Vector median is robust to outliers and impulse artifacts.',
      ],
      intuition:
        'Pick the color vector in a neighborhood that is most central to neighboring vectors.',
      mathematicalModel: [
        'Vector median criterion: fhat = argmin_i sum_j ||f_i - f_j||.',
      ],
      algorithmExplanation: [
        'For each neighborhood, compute pairwise vector distances.',
        'Choose vector with minimum total distance.',
        'Assign that vector to output pixel.',
      ],
      example:
        'Vector median filtering can remove color impulse noise while preserving chromatic edges better than scalar median-per-channel.',
      practicalNotes: [
        'Advantage: outlier robustness in full color vector space.',
        'Disadvantage: computationally expensive.',
        'Limitation: larger kernels significantly increase runtime.',
      ],
      visualizerExperiments: ['Run Vector Filters (vector median) and compare with channel-wise smoothing.'],
    },
    {
      topic: 'Color Image Compression',
      conceptOverview: [
        'Color compression exploits lower human sensitivity to chroma than luminance.',
        'Common pipeline: convert to luminance-chrominance, subsample chroma, then code transform/prediction residuals.',
      ],
      intuition:
        'Keep brightness detail sharp, reduce color detail more aggressively with less perceived quality loss.',
      mathematicalModel: [
        'Perceptual relation: sensitivity(Y) >> sensitivity(C).',
        '4:2:0 chroma subsampling keeps full luma but reduces chroma resolution.',
      ],
      algorithmExplanation: [
        'Convert RGB/BGR to YCrCb or YUV.',
        'Subsample chroma channels.',
        'Upsample for display and optionally apply coding quality parameter.',
      ],
      example:
        'JPEG-like workflows preserve luminance structure better than chroma structure at similar bitrates.',
      practicalNotes: [
        'Advantage: strong compression with good perceived quality.',
        'Disadvantage: chroma bleeding/blocks can appear at low quality.',
        'Limitation: repeated lossy re-encoding accumulates artifacts.',
      ],
      visualizerExperiments: ['Run Color Image Compression and vary quality to observe chroma-loss artifacts.'],
    },
  ],

  codeSnippet: '# Use Visualizer + Get Code for experiment-specific runnable scripts.',

  lab: {
    tools: [
      { id: 'rgb-model', label: 'RGB Color Model', type: 'api', endpoint: '/api/color/rgb-model', methodName: 'RGB Model View' },
      {
        id: 'cmy-cmyk',
        label: 'CMY / CMYK Models',
        type: 'api',
        endpoint: '/api/color/cmy-cmyk-model',
        methodName: 'CMY/CMYK Conversion',
        params: [
          {
            key: 'mode',
            label: 'Mode',
            type: 'select',
            default: 'cmy',
            options: [
              { label: 'CMY', value: 'cmy' },
              { label: 'CMYK (K Channel)', value: 'cmyk' },
            ],
          },
        ],
      },
      {
        id: 'hsv-hsi',
        label: 'HSI / HSV Color Model',
        type: 'api',
        endpoint: '/api/color/hsv-hsi-model',
        methodName: 'HSV/HSI Model',
        params: [
          {
            key: 'mode',
            label: 'Model',
            type: 'select',
            default: 'hsv',
            options: [
              { label: 'HSV', value: 'hsv' },
              { label: 'HSI-like', value: 'hsi' },
            ],
          },
        ],
      },
      {
        id: 'color-transform',
        label: 'Color Space Transformations',
        type: 'api',
        endpoint: '/api/color/color-space-transform',
        methodName: 'Color Space Transform',
        params: [
          {
            key: 'target',
            label: 'Target Space',
            type: 'select',
            default: 'yuv',
            options: [
              { label: 'YUV', value: 'yuv' },
              { label: 'YCrCb', value: 'ycrcb' },
              { label: 'Lab', value: 'lab' },
            ],
          },
        ],
      },
      { id: 'channel-repr', label: 'Full-Color Image Representation', type: 'api', endpoint: '/api/color/channel-representation', methodName: 'RGB Channel Representation' },
      { id: 'sat', label: 'Color Transformations (Saturation Boost)', type: 'api', endpoint: '/api/color/saturation-boost', methodName: 'Color Saturation Boost', defaultParam: 25, paramLabel: 'Boost', paramKey: 'boost', paramMin: 0, paramMax: 120, paramStep: 1 },
      {
        id: 'pseudo',
        label: 'Pseudocolor Processing',
        type: 'api',
        endpoint: '/api/color/pseudocolor',
        methodName: 'Pseudo-color Mapping',
        params: [
          {
            key: 'map_name',
            label: 'Color Map',
            type: 'select',
            default: 'jet',
            options: [
              { label: 'Jet', value: 'jet' },
              { label: 'Hot', value: 'hot' },
              { label: 'Turbo', value: 'turbo' },
              { label: 'Viridis', value: 'viridis' },
            ],
          },
        ],
      },
      {
        id: 'color-filter',
        label: 'Color Filtering Techniques',
        type: 'api',
        endpoint: '/api/color/color-filter',
        methodName: 'Color Filtering',
        params: [
          {
            key: 'method',
            label: 'Filter',
            type: 'select',
            default: 'gaussian',
            options: [
              { label: 'Gaussian', value: 'gaussian' },
              { label: 'Mean', value: 'mean' },
              { label: 'Sharpen', value: 'sharpen' },
            ],
          },
          { key: 'ksize', label: 'Kernel Size', type: 'number', default: 5, min: 1, step: 2 },
        ],
      },
      { id: 'color-edge', label: 'Color Edge Detection', type: 'api', endpoint: '/api/color/color-edge', methodName: 'Color Edge Detection' },
      {
        id: 'hsv-mask',
        label: 'Color-Based Segmentation (HSV)',
        type: 'api',
        endpoint: '/api/color/hsv-mask',
        methodName: 'HSV Color Masking',
        params: [
          { key: 'h_min', label: 'Hue Min', type: 'number', default: 0, min: 0, max: 179, step: 1 },
          { key: 'h_max', label: 'Hue Max', type: 'number', default: 25, min: 0, max: 179, step: 1 },
          { key: 's_min', label: 'Sat Min', type: 'number', default: 70, min: 0, max: 255, step: 1 },
          { key: 's_max', label: 'Sat Max', type: 'number', default: 255, min: 0, max: 255, step: 1 },
          { key: 'v_min', label: 'Val Min', type: 'number', default: 60, min: 0, max: 255, step: 1 },
          { key: 'v_max', label: 'Val Max', type: 'number', default: 255, min: 0, max: 255, step: 1 },
        ],
      },
      {
        id: 'rgb-segment',
        label: 'Color-Based Segmentation (RGB Distance)',
        type: 'api',
        endpoint: '/api/color/color-segment-rgb',
        methodName: 'RGB Distance Segmentation',
        params: [
          { key: 'r', label: 'Target R', type: 'number', default: 200, min: 0, max: 255, step: 1 },
          { key: 'g', label: 'Target G', type: 'number', default: 50, min: 0, max: 255, step: 1 },
          { key: 'b', label: 'Target B', type: 'number', default: 50, min: 0, max: 255, step: 1 },
          { key: 'threshold', label: 'Distance Threshold', type: 'number', default: 80, min: 1, max: 255, step: 1 },
        ],
      },
      {
        id: 'color-noise',
        label: 'Noise in Color Images',
        type: 'api',
        endpoint: '/api/color/color-noise',
        methodName: 'Color Noise Model',
        params: [
          {
            key: 'noise_type',
            label: 'Noise Type',
            type: 'select',
            default: 'gaussian',
            options: [
              { label: 'Gaussian', value: 'gaussian' },
              { label: 'Impulse', value: 'impulse' },
            ],
          },
          { key: 'amount', label: 'Noise Amount', type: 'number', default: 20, min: 0, step: 0.1 },
        ],
      },
      {
        id: 'vector-median',
        label: 'Vector Filters (Vector Median)',
        type: 'api',
        endpoint: '/api/color/vector-median',
        methodName: 'Vector Median Filter',
        defaultParam: 3,
        paramLabel: 'Kernel Size',
        paramKey: 'ksize',
        paramMin: 3,
        paramStep: 2,
      },
      {
        id: 'color-compression',
        label: 'Color Image Compression',
        type: 'api',
        endpoint: '/api/color/color-compression',
        methodName: 'Chroma Compression',
        defaultParam: 55,
        paramLabel: 'JPEG Quality',
        paramKey: 'quality',
        paramMin: 1,
        paramMax: 100,
        paramStep: 1,
      },
    ],
  },
};