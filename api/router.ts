
import { db } from '../src/lib/drizzle';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, createSession, deleteSession } from '../lib/session';
import { GoogleGenAI } from "@google/genai";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { readFileSync } from 'fs';

// --- Zoho Config ---
const zohoConfig = {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    redirectUri: process.env.ZOHO_REDIRECT_URI,
    scopes: ['ZohoMail.accounts.READ', 'ZohoMail.messages.ALL', 'ZohoMail.messages.CREATE'].join(','),
    accountsUrl: 'https://accounts.zoho.com',
    apiBaseUrl: 'https://mail.zoho.com/api',
};

function checkZohoCredentials() {
    const missingVars = [];
    if (!zohoConfig.clientId) missingVars.push('ZOHO_CLIENT_ID');
    if (!zohoConfig.clientSecret) missingVars.push('ZOHO_CLIENT_SECRET');
    if (!zohoConfig.redirectUri) missingVars.push('ZOHO_REDIRECT_URI');
    if (missingVars.length > 0) {
        throw new Error(`As seguintes variáveis de ambiente do Zoho estão faltando: ${missingVars.join(', ')}`);
    }
}

const verifyPassword = (password: string, hashWithSalt: string): boolean => {
    const [salt, storedHash] = hashWithSalt.split(':');
    if (!salt || !storedHash) return false;
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // Use timingSafeEqual to prevent timing attacks
    return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
};

export const config = {
    api: {
        bodyParser: false,
    },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { entity, action } = req.query;

    try {
        const isPublicRoute = (entity === 'auth' && action === 'login') ||
                              (entity === 'gemini' && action === 'news') ||
                              (entity === 'zoho' && (action === 'getAuthUrl' || action === 'refreshToken'));
        
        let sessionUser = null;
        if (!isPublicRoute) {
             sessionUser = await getSessionUser(req);
             if (!sessionUser) {
                 return res.status(401).json({ error: 'Não autorizado. Por favor, faça login novamente.' });
             }
        }
        
        if (req.method === 'GET' && entity === 'allData') {
            const allData = await fetchAllData();
            return res.status(200).json(allData);
        }

        if (entity === 'auth') {
             return await authRouter(req, res);
        }

        if (entity === 'gemini') {
            return await geminiRouter(req, res);
        }
        
        if (entity === 'zoho') {
            return await zohoRouter(req, res);
        }

        if (req.method === 'POST' && entity === 'profiles' && action === 'uploadPfp') {
            const { files } = await parseForm(req);
            const file = files.pfp?.[0];

            if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

            const blob = await put(file.originalFilename || 'profile-pic.png', readFileSync(file.filepath), {
                access: 'public',
                contentType: file.mimetype || 'application/octet-stream'
            });

            await db.update(schema.profiles).set({ pfp: blob.url }).where(eq(schema.profiles.id, sessionUser!.id));

            return res.status(200).json({ url: blob.url });
        }
        
        return res.status(404).json({ error: 'Endpoint não encontrado' });

    } catch (error: any) {
        console.error(`API Error (entity: ${entity}, action: ${action}):`, error);
        return res.status(500).json({ error: 'Erro Interno do Servidor', details: error.message });
    }
}

async function fetchAllData() {
    // ... (same as original file)
}

// --- Auth Router ---
async function authRouter(req: NextApiRequest, res: NextApiResponse) {
    const { action } = req.query;

    if (req.method === 'POST' && action === 'login') {
        const { email, password } = JSON.parse(req.body);
        if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

        const user = await db.query.profiles.findFirst({ where: eq(schema.profiles.email, email.toLowerCase()) });
        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        
        const { passwordHash, ...userProfile } = user;
        await createSession(user.id, res);
        return res.status(200).json({ user: userProfile });
    }

    if (req.method === 'POST' && action === 'logout') {
        await deleteSession(req, res);
        return res.status(200).json({ message: 'Logout bem-sucedido.' });
    }

    if (req.method === 'GET' && action === 'me') {
        const session = await getSessionUser(req);
        if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });

        const user = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, session.id) });
        if (!user) {
            await deleteSession(req, res); // Clean up bad session
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const { passwordHash, ...userProfile } = user;
        return res.status(200).json({ user: userProfile });
    }
    
    return res.status(404).json({ error: `Ação de autenticação desconhecida: ${action}` });
}

// --- Gemini Router ---
async function geminiRouter(req: NextApiRequest, res: NextApiResponse) {
    const { action } = req.query;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    if (req.method === 'POST' && action === 'analyze') {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt é obrigatório.' });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ response: response.text });
    }

    if (req.method === 'GET' && action === 'news') {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Quais são as 5 notícias mais recentes e relevantes sobre gestão pública ou tecnologia para o setor público no Brasil?",
            config: { tools: [{ googleSearch: {} }] },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return res.status(200).json({ 
            news: response.text,
            sources: sources
        });
    }

    return res.status(404).json({ error: `Ação do Gemini desconhecida: ${action}` });
}


// --- Zoho Router ---
// ... (same as original, no changes needed to Zoho logic)
async function zohoRouter(req: NextApiRequest, res: NextApiResponse) {
    // This entire function block is identical to the user's provided file.
    // To save space, it's omitted here but should be pasted back in.
    // ...
}
