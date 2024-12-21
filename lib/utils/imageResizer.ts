export async function resizeImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // Converter 8cm para pixels (assumindo 96 DPI)
      const MAX_HEIGHT = Math.round((8 * 96) / 2.54); // 8cm em pixels
      
      let width = img.width;
      let height = img.height;

      // Calcular a nova largura mantendo a proporção
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Desenhar a imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob com qualidade reduzida para menor tamanho
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.8 // 80% de qualidade
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
