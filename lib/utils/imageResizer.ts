export async function resizeImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // Define uma altura máxima maior para melhor qualidade (15cm a 300 DPI)
      const MAX_HEIGHT = Math.round((15 * 300) / 2.54); // 15cm em pixels a 300 DPI
      
      let width = img.width;
      let height = img.height;

      // Mantém a resolução original se for menor que o máximo
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      // Usa um multiplicador para aumentar a qualidade do canvas
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Configurações para melhor qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Desenha a imagem redimensionada com escala aumentada
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob com alta qualidade
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.95 // 95% de qualidade
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
