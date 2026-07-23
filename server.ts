import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_VISTORIAS, DEFAULT_EMPRESA } from './src/data/seedData';
import { Vistoria, EmpresaInfo, Imovel } from './src/types';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));

// Explicitly serve /public files with proper MIME types and CORS
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Database Persistence File Setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DbSchema {
  vistorias: Vistoria[];
  empresa: EmpresaInfo;
}

function initDb(): DbSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        vistorias: data.vistorias || INITIAL_VISTORIAS,
        empresa: data.empresa || DEFAULT_EMPRESA,
      };
    }
  } catch (err) {
    console.error('Erro lendo banco de dados, usando inicial:', err);
  }

  const initialDb: DbSchema = {
    vistorias: INITIAL_VISTORIAS,
    empresa: DEFAULT_EMPRESA,
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(dbData: DbSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro salvando banco de dados:', err);
  }
}

let db = initDb();

// Lazy Gemini AI setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// REST API Endpoints

// GET /api/vistorias
app.get('/api/vistorias', (req, res) => {
  res.json({ success: true, data: db.vistorias });
});

// GET /api/vistorias/:id
app.get('/api/vistorias/:id', (req, res) => {
  const vistoria = db.vistorias.find((v) => v.id === req.params.id);
  if (!vistoria) {
    return res.status(404).json({ success: false, error: 'Vistoria não encontrada' });
  }
  res.json({ success: true, data: vistoria });
});

// POST /api/vistorias
app.post('/api/vistorias', (req, res) => {
  const novaVistoria: Vistoria = req.body;
  
  if (!novaVistoria.id) {
    novaVistoria.id = 'vis-' + Date.now();
  }
  if (!novaVistoria.codigoVistoria) {
    novaVistoria.codigoVistoria = `VIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  }

  novaVistoria.dataCriacao = novaVistoria.dataCriacao || new Date().toISOString();
  novaVistoria.dataAtualizacao = new Date().toISOString();

  const idx = db.vistorias.findIndex((v) => v.id === novaVistoria.id);
  if (idx >= 0) {
    db.vistorias[idx] = novaVistoria;
  } else {
    db.vistorias.unshift(novaVistoria);
  }

  saveDb(db);
  res.json({ success: true, data: novaVistoria });
});

// PUT /api/vistorias/:id
app.put('/api/vistorias/:id', (req, res) => {
  const id = req.params.id;
  const idx = db.vistorias.findIndex((v) => v.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Vistoria não encontrada' });
  }

  const updated: Vistoria = {
    ...db.vistorias[idx],
    ...req.body,
    dataAtualizacao: new Date().toISOString(),
  };

  db.vistorias[idx] = updated;
  saveDb(db);
  res.json({ success: true, data: updated });
});

// DELETE /api/vistorias/:id
app.delete('/api/vistorias/:id', (req, res) => {
  const id = req.params.id;
  db.vistorias = db.vistorias.filter((v) => v.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Vistoria removida com sucesso' });
});

// GET /api/empresa
app.get('/api/empresa', (req, res) => {
  res.json({ success: true, data: db.empresa });
});

// PUT /api/empresa
app.put('/api/empresa', (req, res) => {
  db.empresa = { ...db.empresa, ...req.body };
  saveDb(db);
  res.json({ success: true, data: db.empresa });
});

// POST /api/vistorias/analyze - Gemini AI Analysis Endpoint
app.post('/api/vistorias/analyze', async (req, res) => {
  try {
    const vistoria: Vistoria = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not supplied
      return res.json({
        success: true,
        data: {
          resumoExecutivo: `Laudo de vistoria do imóvel ${vistoria.imovel.endereco}, ${vistoria.imovel.numero}. Total de ${vistoria.ambientes.length} ambientes inspecionados.`,
          pontosCriticos: vistoria.ambientes.flatMap(a => 
            a.itens.filter(i => i.estado === 'Avaria').map(i => `${a.nome}: ${i.nome} - ${i.observacoes || 'Com avaria registrada'}`)
          ),
          estimativaUrgencia: vistoria.ambientes.some(a => a.itens.some(i => i.estado === 'Avaria')) ? 'Média' : 'Baixa',
          sugestoesContrato: [
            'Conferir fotos anexadas no laudo impresso.',
            'Inquilino deve aprovar e assinar em até 5 dias úteis.',
          ]
        }
      });
    }

    const itemsSummary = vistoria.ambientes.map(a => {
      const itemDetails = a.itens.map(i => `- ${i.nome}: [Estado: ${i.estado}] - Obs: ${i.observacoes || 'Nenhuma'}`).join('\n');
      return `Ambiente: ${a.nome}\n${itemDetails}\nObservações Gerais: ${a.observacoesGerais || 'Nenhuma'}`;
    }).join('\n\n');

    const prompt = `Você é um perito vistoriador de imóveis no Brasil especializado em laudos técnicos de locação e compra e venda.
Analise os dados abaixo da vistoria de tipo "${vistoria.tipo}" para o imóvel localizado em ${vistoria.imovel.endereco}, ${vistoria.imovel.numero} - ${vistoria.imovel.cidade}/${vistoria.imovel.estado}.

DADOS DOS AMBIENTES E ITENS:
${itemsSummary}

Por favor, responda estritamente em formato JSON com o seguinte esquema:
{
  "resumoExecutivo": "string com síntese técnica imparcial do estado de conservação do imóvel",
  "pontosCriticos": ["array de strings com avarias ou atenções imediatas encontradas"],
  "estimativaUrgencia": "Baixa" | "Média" | "Alta" | "Crítica",
  "sugestoesContrato": ["array de recomendações práticas para o contrato de locação/termo de vistoria"],
  "responsabilidadeSugerida": "string com recomendação sobre quem deve arcar com os reparos (Locatário, Locador ou Avaria pré-existente)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Erro na análise da IA:', err);
    res.status(500).json({ success: false, error: 'Não foi possível gerar a análise por IA no momento.' });
  }
});

// POST /api/db/reset - Reset Database to initial state
app.post('/api/db/reset', (req, res) => {
  db = {
    vistorias: INITIAL_VISTORIAS,
    empresa: DEFAULT_EMPRESA,
  };
  saveDb(db);
  res.json({ success: true, message: 'Banco de dados restaurado para o estado inicial.' });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
