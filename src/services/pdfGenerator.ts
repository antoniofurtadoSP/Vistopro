import jsPDF from 'jspdf';
import { Vistoria, EmpresaInfo } from '../types';

async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateVistoriaPdf(vistoria: Vistoria, empresa: EmpresaInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${empresa.nomeFantasia} | CRECI ${empresa.creci}`, margin, 8);
    doc.text(`Laudo de Vistoria - ${vistoria.codigoVistoria}`, pageWidth - margin, 8, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 10, pageWidth - margin, 10);
  }

  // --- TOP BANNER (ANTONIO FURTADO LOGO) ---
  const bannerLogoUrl = empresa.logoUrl || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQCg77zUT43bZxFpwtQv8VnbT6iNll_bgvVVG9xRlvSVzZ6IL25hl4cjtp0ZZZh3YwIlykgT0jn5SYPBIxjMSFzzmc1YwbUBmLCY8_9hVMFX6_UhlSAe_Zmmy52tkhPuFCIRUmEWccW6r493-6dX9k6lyHbXYvWieQ21xAzo59aryPb1mcvb6juDpp0Zo/s1600/logo.jpg';
  
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 1, 1, 'S');

  try {
    const logoBase64 = await loadImageAsBase64(bannerLogoUrl);
    if (logoBase64) {
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 30, y + 2, 60, 18);
    } else {
      doc.setFont('georgia', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(11, 34, 64);
      doc.text('ANTONIO FURTADO', pageWidth / 2, y + 10, { align: 'center' });
    }
  } catch (e) {
    doc.setFont('georgia', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(11, 34, 64);
    doc.text('ANTONIO FURTADO', pageWidth / 2, y + 10, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 34, 64);
  doc.text(`CONSULTOR IMOBILIÁRIO • CRECI ${empresa.creci || '208024'}`, pageWidth / 2, y + 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('www.antoniofurtado.com.br  •  WhatsApp (11) 96904-3012', pageWidth / 2, y + 26, { align: 'center' });

  y += 32;

  // --- LAUDO HEADER ---
  doc.setFillColor(15, 23, 42); // slate-900 header block
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('LAUDO TÉCNICO DE VISTORIA IMOBILIÁRIA', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Tipo de Vistoria: ${vistoria.tipo.toUpperCase()} | Código: ${vistoria.codigoVistoria}`, margin + 6, y + 16);

  // Status Badge in Header
  doc.setFillColor(vistoria.status === 'Concluída' || vistoria.status === 'Aprovada' ? 34 : 234, vistoria.status === 'Concluída' || vistoria.status === 'Aprovada' ? 197 : 179, vistoria.status === 'Concluída' || vistoria.status === 'Aprovada' ? 94 : 8);
  doc.roundedRect(pageWidth - margin - 36, y + 6, 30, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(vistoria.status.toUpperCase(), pageWidth - margin - 21, y + 11.5, { align: 'center' });

  y += 28;

  // --- EMPRESA / IMOBILIÁRIA INFO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(empresa.razaoSocial, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`CNPJ: ${empresa.cnpj} | CRECI: ${empresa.creci} | Tel: ${empresa.telefone} | Email: ${empresa.email}`, margin, y + 4);
  doc.text(empresa.endereco, margin, y + 8);

  y += 14;

  // --- DADOS DO IMÓVEL & PARTES ---
  checkPageBreak(40);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 36, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 36, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS DO IMÓVEL E DAS PARTES', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 4;
  const col2X = margin + 95;

  doc.text(`Endereço: ${vistoria.imovel.endereco}, nº ${vistoria.imovel.numero} ${vistoria.imovel.complemento || ''}`, col1X, y + 13);
  doc.text(`Bairro / Cidade: ${vistoria.imovel.bairro} - ${vistoria.imovel.cidade}/${vistoria.imovel.estado} (CEP: ${vistoria.imovel.cep})`, col1X, y + 18);
  doc.text(`Tipo do Imóvel: ${vistoria.imovel.tipo} | Ref: ${vistoria.imovel.codigoRef}`, col1X, y + 23);
  doc.text(`Proprietário (Locador): ${vistoria.imovel.proprietarioNome}`, col1X, y + 28);

  doc.text(`Locatário (Inquilino): ${vistoria.inquilinoNome}`, col2X, y + 13);
  doc.text(`CPF/CNPJ Locatário: ${vistoria.inquilinoCpf || 'Não informado'}`, col2X, y + 18);
  doc.text(`Vistoriador Responsável: ${vistoria.vistoriadorNome}`, col2X, y + 23);
  doc.text(`Registro Vistoriador: ${vistoria.vistoriadorCreci || 'N/A'}`, col2X, y + 28);

  y += 42;

  // --- LEITURA DE CONTADORES ---
  if (vistoria.contadores && vistoria.contadores.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LEITURAS DOS CONTADORES (MEDIDORES)', margin, y);
    y += 4;

    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Tipo', margin + 4, y + 4.5);
    doc.text('Nº do Contador / Medidor', margin + 40, y + 4.5);
    doc.text('Leitura Apurada', margin + 110, y + 4.5);
    y += 6;

    vistoria.contadores.forEach((c) => {
      checkPageBreak(7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(c.tipo, margin + 4, y + 4.5);
      doc.text(c.numeroContador || 'Não informado', margin + 40, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(c.leitura, margin + 110, y + 4.5);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 6;
    });

    y += 6;
  }

  // --- DETALHAMENTO DOS AMBIENTES ---
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('INSPEÇÃO DETALHADA POR AMBIENTE', margin, y);
  y += 6;

  for (let aIdx = 0; aIdx < vistoria.ambientes.length; aIdx++) {
    const ambiente = vistoria.ambientes[aIdx];
    checkPageBreak(25);

    // Header per Room
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${aIdx + 1}. ${ambiente.nome.toUpperCase()}`, margin + 3, y + 5);

    y += 9;

    if (ambiente.observacoesGerais) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Obs. Geral: ${ambiente.observacoesGerais}`, margin + 3, y);
      y += 5;
    }

    // Room Items Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, pageWidth - margin * 2, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Item / Componente', margin + 3, y + 3.8);
    doc.text('Estado', margin + 65, y + 3.8);
    doc.text('Observações Técnicas / Apontamentos', margin + 95, y + 3.8);
    y += 5;

    for (const item of ambiente.itens) {
      checkPageBreak(8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(item.nome, margin + 3, y + 4.5);

      // Estado Tag
      if (item.estado === 'Novo') {
        doc.setTextColor(21, 128, 61); // Green
      } else if (item.estado === 'Bom') {
        doc.setTextColor(3, 105, 161); // Blue
      } else if (item.estado === 'Regular') {
        doc.setTextColor(180, 83, 9); // Amber
      } else if (item.estado === 'Avaria') {
        doc.setTextColor(185, 28, 28); // Red
      } else {
        doc.setTextColor(100, 116, 139); // Gray
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`[ ${item.estado} ]`, margin + 65, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const splitObs = doc.splitTextToSize(item.observacoes || 'Sem divergências encontradas.', pageWidth - margin - 100);
      doc.text(splitObs, margin + 95, y + 4.5);

      const rowHeight = Math.max(6, splitObs.length * 4);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

      y += rowHeight;
    }

    // Room and Item Photos Rendering in PDF (Horizontal 2-Column Grid Layout)
    const allRoomPhotos = [
      ...(ambiente.fotosGerais || []).map(f => ({ ...f, rotulo: `Cômodo: ${ambiente.nome}` })),
      ...ambiente.itens.flatMap(i => (i.fotos || []).map(f => ({ ...f, rotulo: `Item: ${i.nome}` })))
    ];

    if (allRoomPhotos.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`REGISTRO FOTOGRÁFICO DO CÔMODO (${allRoomPhotos.length} FOTO(S) ORGANIZADAS HORIZONTALMENTE):`, margin + 3, y + 5);
      y += 10;

      const colCount = 2;
      const colGap = 6;
      const cardWidth = (pageWidth - margin * 2 - (colCount - 1) * colGap) / colCount; // ~88mm
      const imgHeight = 44; // 88x44 aspect ratio ~ 2:1
      const captionHeight = 16;
      const cardHeight = imgHeight + captionHeight; // 60mm total height

      for (let pIdx = 0; pIdx < allRoomPhotos.length; pIdx++) {
        const photo = allRoomPhotos[pIdx];
        const col = pIdx % colCount;
        const xPos = margin + col * (cardWidth + colGap);

        // Check page break when starting a new row (col === 0)
        if (col === 0) {
          checkPageBreak(cardHeight + 8);
        }

        try {
          const imgBase64 = await loadImageAsBase64(photo.url);
          if (imgBase64) {
            // Card container border
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(xPos, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

            // Image
            doc.addImage(imgBase64, 'JPEG', xPos + 1, y + 1, cardWidth - 2, imgHeight - 1);

            // Caption background
            doc.setFillColor(248, 250, 252);
            doc.rect(xPos + 1, y + imgHeight, cardWidth - 2, captionHeight - 1, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.line(xPos + 1, y + imgHeight, xPos + cardWidth - 1, y + imgHeight);

            // Label text
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(30, 41, 59);
            const truncatedRotulo = photo.rotulo.length > 40 ? photo.rotulo.substring(0, 38) + '...' : photo.rotulo;
            doc.text(truncatedRotulo, xPos + 3, y + imgHeight + 4.5);

            // Description / Timestamp text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            const descStr = photo.descricao ? photo.descricao : 'Foto registrada no laudo';
            const splitDesc = doc.splitTextToSize(descStr, cardWidth - 6);
            doc.text(splitDesc[0] || '', xPos + 3, y + imgHeight + 8.5);

            if (photo.dataHora) {
              const dateStr = new Date(photo.dataHora).toLocaleString('pt-BR');
              doc.text(`Data: ${dateStr}`, xPos + 3, y + imgHeight + 12.5);
            }
          }
        } catch (e) {
          console.warn('Erro ao renderizar imagem no PDF:', e);
        }

        // If end of row or last photo, increment Y
        if (col === colCount - 1 || pIdx === allRoomPhotos.length - 1) {
          y += cardHeight + 5;
        }
      }
    }

    y += 4;
  }

  // --- ANÁLISE IA (SE DISPONÍVEL) ---
  if (vistoria.analiseIa) {
    checkPageBreak(35);
    doc.setFillColor(240, 253, 244); // light green bg
    doc.rect(margin, y, pageWidth - margin * 2, 32, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(margin, y, pageWidth - margin * 2, 32, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('ANÁLISE PERICIAL DE SÍNTESE (SISTEMA DE IA VISTORIAPRO)', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const splitResumo = doc.splitTextToSize(vistoria.analiseIa.resumoExecutivo, pageWidth - margin * 2 - 8);
    doc.text(splitResumo, margin + 4, y + 11);

    if (vistoria.analiseIa.pontosCriticos && vistoria.analiseIa.pontosCriticos.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text(`Atenções encontradas (${vistoria.analiseIa.pontosCriticos.length}): ${vistoria.analiseIa.pontosCriticos.slice(0, 2).join(' | ')}`, margin + 4, y + 25);
    }

    y += 38;
  }

  // --- OBSERVAÇÕES FINAIS ---
  if (vistoria.observacoesFinais) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('OBSERVAÇÕES FINAIS E ENTREGA DE CHAVES:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitFinal = doc.splitTextToSize(vistoria.observacoesFinais, pageWidth - margin * 2);
    doc.text(splitFinal, margin, y);
    y += splitFinal.length * 4 + 6;
  }

  // --- TERMO DE DECLARAÇÃO E ASSINATURAS ---
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMO DE ACEITE E DECLARAÇÃO LEGAL', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const termoText = 'As partes declaram que acompanharam pessoalmente a realização da presente vistoria no imóvel acima identificado, confirmando que as informações, fotos e apontamentos constantes deste laudo representam com fidelidade o exato estado de conservação e funcionamento do imóvel nesta data.';
  const splitTermo = doc.splitTextToSize(termoText, pageWidth - margin * 2);
  doc.text(splitTermo, margin, y);
  y += splitTermo.length * 3.8 + 12;

  // Signatures Lines Block
  checkPageBreak(30);
  const sigWidth = (pageWidth - margin * 2 - 20) / 2;

  // Signature 1: Vistoriador
  doc.setDrawColor(100, 116, 139);
  doc.line(margin, y, margin + sigWidth, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(vistoria.vistoriadorNome, margin, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`VISTORIADOR RESPONSÁVEL (${vistoria.vistoriadorCreci || 'CRECI/Documento'})`, margin, y + 8);

  // Signature 2: Inquilino
  const sig2X = margin + sigWidth + 20;
  doc.line(sig2X, y, sig2X + sigWidth, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(vistoria.inquilinoNome, sig2X, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`LOCATÁRIO (INQUILINO) (${vistoria.inquilinoCpf || 'CPF/CNPJ'})`, sig2X, y + 8);

  // --- FOOTER FOR ALL PAGES ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Laudo gerado pelo Sistema VistoriaPro | Autenticidade garantida por chave ${vistoria.codigoVistoria}`, margin, pageHeight - 6);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  return doc;
}
