export const chapter2Detail = {
  moduleId: 'digital-image-fundamentals',

  deepDive: [

    {
      title: 'Sampling Theorem (Practical View)',

      text:
`Sampling converts a continuous scene into discrete pixels. 
To capture all image details, the sampling frequency must be sufficiently high.

If sampling is too low, high-frequency details cannot be represented correctly. 
This produces aliasing artifacts such as jagged edges or repeating patterns.

In practice, cameras must sample at a rate high enough to represent fine spatial variations in the scene.`,

code:
`import cv2

img = cv2.imread("input.png",0)

small = cv2.resize(img,(img.shape[1]//6,img.shape[0]//6))

aliased = cv2.resize(small,(img.shape[1],img.shape[0]),interpolation=cv2.INTER_NEAREST)`
    },


    {
      title: 'Quantization Noise',

      text:
`Quantization converts continuous intensity values into discrete levels.

If the number of intensity levels is small, smooth gradients become step-like. 
This effect is called quantization noise or false contouring.

High-quality imaging systems use 8-bit or 12-bit quantization to minimize these artifacts.`,

code:
`levels = 8
step = 256//levels

quantized = (img//step)*step`
    }

  ],


  figure: {
    title: 'Sampling vs Quantization',

svg:
`<svg width="560" height="260" xmlns="http://www.w3.org/2000/svg">

<rect width="560" height="260" fill="#f5f7fb"/>

<text x="20" y="30" font-size="18" fill="#124f73">Continuous vs Quantized Intensity</text>

<polyline fill="none" stroke="#008080" stroke-width="3"
points="20,200 80,160 140,130 200,100 260,80 320,65 380,58 440,54 500,52"/>

<polyline fill="none" stroke="#d6542a" stroke-width="2" stroke-dasharray="6,4"
points="20,200 80,200 80,150 140,150 140,110 200,110 200,90 260,90 260,70 320,70 320,60 380,60 380,55 440,55 440,52 500,52"/>

<text x="20" y="230" font-size="13">Teal: Continuous signal</text>
<text x="240" y="230" font-size="13">Orange dashed: Quantized signal</text>

</svg>`
  }
};