/**
 * Otimizador e Compressor de Imagens para Vistorias Imobiliárias
 * 
 * Evita travamentos e fechamentos no celular ao reduzir fotos de 12MP-48MP (10MB-25MB)
 * para um tamanho ideal de alta nitidez para laudo (~150KB - 250KB, máx 1280px).
 * Isso reduz o consumo de memória em 95%+, impedindo que navegadores móveis fechem a aba.
 */

export interface OptimizedImageResult {
  url: string; // Base64 JPEG otimizado
  largura: number;
  altura: number;
  tamanhoKb: number;
}

/**
 * Comprime e redimensiona um arquivo de imagem mantendo proporção e nitidez
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.78
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // Se o arquivo for muito pequeno (menos de 80KB) e já for jpeg/png, podemos manter ou processar
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calcular novas dimensões mantendo proporção
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Não foi possível obter contexto do canvas');
        }

        // Desenhar com interpolação suave
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido
        const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
        const approxKb = Math.round((optimizedBase64.length * 3) / 4 / 1024);

        // Liberar recursos
        URL.revokeObjectURL(objectUrl);
        canvas.width = 0;
        canvas.height = 0;

        resolve({
          url: optimizedBase64,
          largura: width,
          altura: height,
          tamanhoKb: approxKb,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar a imagem para compressão'));
    };

    img.src = objectUrl;
  });
}

/**
 * Processa múltiplos arquivos sequencialmente para não sobrecarregar a memória RAM do celular
 */
export async function optimizeMultipleImageFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<OptimizedImageResult[]> {
  const results: OptimizedImageResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total);
    }
    try {
      const optimized = await optimizeImageFile(files[i]);
      results.push(optimized);
    } catch (err) {
      console.warn(`Erro ao otimizar imagem ${files[i].name}, tentando fallback direto:`, err);
      // Fallback: tentar ler direto se a compressão falhar
      try {
        const rawBase64 = await fileToDataUrl(files[i]);
        results.push({
          url: rawBase64,
          largura: 800,
          altura: 600,
          tamanhoKb: Math.round(files[i].size / 1024),
        });
      } catch (fallbackErr) {
        console.error('Falha crítica ao ler imagem:', fallbackErr);
      }
    }
    // Breve pausa para permitir Garbage Collection e manter a UI responsiva
    await new Promise((r) => setTimeout(r, 40));
  }

  return results;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
