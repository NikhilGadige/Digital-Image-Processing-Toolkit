function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function dataUrlToImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function drawToCanvas(dataUrl) {
  const img = await dataUrlToImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
}

function toDataUrl(canvas) {
  return canvas.toDataURL('image/png');
}

function grayscaleAt(data, index) {
  return Math.round((data[index] + data[index + 1] + data[index + 2]) / 3);
}

export async function runLocalOperation(inputDataUrl, operation, param = 1) {
  const { canvas, ctx } = await drawToCanvas(inputDataUrl);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  if (operation === 'sample-quantize') {
    const factor = Math.max(1, Math.floor(param));
    const levels = 16;
    for (let y = 0; y < height; y += factor) {
      for (let x = 0; x < width; x += factor) {
        const base = (y * width + x) * 4;
        const r = data[base];
        const g = data[base + 1];
        const b = data[base + 2];
        for (let yy = y; yy < Math.min(y + factor, height); yy += 1) {
          for (let xx = x; xx < Math.min(x + factor, width); xx += 1) {
            const idx = (yy * width + xx) * 4;
            data[idx] = Math.floor((r / 255) * levels) * (255 / levels);
            data[idx + 1] = Math.floor((g / 255) * levels) * (255 / levels);
            data[idx + 2] = Math.floor((b / 255) * levels) * (255 / levels);
          }
        }
      }
    }
  } else if (operation === 'saturation-boost') {
    const boost = Math.max(0, Math.floor(param));
    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      data[i] = clamp(data[i] + (data[i] === max ? boost : 0));
      data[i + 1] = clamp(data[i + 1] + (data[i + 1] === max ? boost : 0));
      data[i + 2] = clamp(data[i + 2] + (data[i + 2] === max ? boost : 0));
    }
  } else if (operation === 'contour-outline') {
    const threshold = Math.max(0, Math.min(255, Math.floor(param)));
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const idx = (y * width + x) * 4;
        const g = grayscaleAt(data, idx);
        if (g < threshold) {
          continue;
        }
        const left = grayscaleAt(data, idx - 4);
        const right = grayscaleAt(data, idx + 4);
        const top = grayscaleAt(data, idx - width * 4);
        const bottom = grayscaleAt(data, idx + width * 4);
        if (left < threshold || right < threshold || top < threshold || bottom < threshold) {
          data[idx] = 255;
          data[idx + 1] = 70;
          data[idx + 2] = 20;
        }
      }
    }
  } else if (operation === 'feature-view') {
    const threshold = Math.max(0, Math.min(255, Math.floor(param)));
    for (let i = 0; i < data.length; i += 4) {
      const g = grayscaleAt(data, i);
      if (g > threshold) {
        data[i] = 255;
        data[i + 1] = 180;
        data[i + 2] = 80;
      } else {
        data[i] = 30;
        data[i + 1] = 50;
        data[i + 2] = 80;
      }
    }
  } else if (operation === 'frequency-lowpass') {
    const block = Math.max(1, Math.floor(param / 4));
    for (let y = 0; y < height; y += block) {
      for (let x = 0; x < width; x += block) {
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let count = 0;
        for (let yy = y; yy < Math.min(y + block, height); yy += 1) {
          for (let xx = x; xx < Math.min(x + block, width); xx += 1) {
            const idx = (yy * width + xx) * 4;
            sr += data[idx];
            sg += data[idx + 1];
            sb += data[idx + 2];
            count += 1;
          }
        }
        const ar = Math.round(sr / count);
        const ag = Math.round(sg / count);
        const ab = Math.round(sb / count);
        for (let yy = y; yy < Math.min(y + block, height); yy += 1) {
          for (let xx = x; xx < Math.min(x + block, width); xx += 1) {
            const idx = (yy * width + xx) * 4;
            data[idx] = ar;
            data[idx + 1] = ag;
            data[idx + 2] = ab;
          }
        }
      }
    }
  } else if (operation === 'pyramid') {
    const levels = Math.max(1, Math.floor(param));
    const divisor = Math.min(8, levels + 1);
    const step = divisor * 2;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const base = grayscaleAt(data, idx);
        for (let yy = y; yy < Math.min(y + step, height); yy += 1) {
          for (let xx = x; xx < Math.min(x + step, width); xx += 1) {
            const outIdx = (yy * width + xx) * 4;
            data[outIdx] = clamp(base + 12);
            data[outIdx + 1] = clamp(base + 6);
            data[outIdx + 2] = clamp(base + 18);
          }
        }
      }
    }
  } else if (operation === 'jpeg-sim') {
    const quality = Math.max(1, Math.min(100, Math.floor(param)));
    const step = Math.max(2, Math.floor((110 - quality) / 6));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / step) * step;
      data[i + 1] = Math.round(data[i + 1] / step) * step;
      data[i + 2] = Math.round(data[i + 2] / step) * step;
    }
  } else {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = grayscaleAt(data, i);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return toDataUrl(canvas);
}
