import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../src/lib/drizzle';
import * as schema from '../src/lib/schema';
import { eq, sql } from 'drizzle-orm';
import {
    DEFAULT_SYSTEM_USERS, DEFAULT_UPDATE_POSTS, DEFAULT_EMPLOYEES, DEFAULT_TASKS,
    DEFAULT_FINANCE_DATA, DEFAULT_EMPLOYEE_EXPENSES, DEFAULT_SUPPLIERS,
    DEFAULT_INTERNAL_EXPENSES, DEFAULT_ASSETS, DEFAULT_NOTIFICATIONS, DEFAULT_TRANSACTIONS,
    DEFAULT_PAYROLLS, DEFAULT_LEAVE_REQUESTS, DEFAULT_PERMISSIONS
} from '../src/constants';
import { pbkdf2Sync, randomBytes } from 'crypto';

const hashPassword = (password: string): string => {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { secret } = req.query;
    const setupSecret = process.env.SETUP_SECRET;

    if (!setupSecret || secret !== setupSecret) {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    try {
        console.log('Verificando se o setup já foi executado...');
        const seededConfig = await db.select().from(schema.config).where(eq(schema.config.key, 'app_seeded_v3'));
        if (seededConfig.length > 0) {
            return res.status(409).json({ message: 'O banco de dados já foi populado com a versão mais recente.' });
        }

        console.log('Iniciando o povoamento (seeding) do banco de dados Neon...');

        await db.transaction(async (tx) => {
            // Users
            const usersToCreate = DEFAULT_SYSTEM_USERS.map(user => {
                const { email, password, ...rest } = user;
                return { ...rest, email: email.toLowerCase(), passwordHash: hashPassword(password || 'defaultPassword') };
            });
            const createdUsers = await tx.insert(schema.profiles).values(usersToCreate).returning();
            console.log(`${createdUsers.length} usuários criados.`);
            const adminUser = createdUsers.find(u => u.role === 'admin');

            // Employees
            const createdEmployees = await tx.insert(schema.employees).values(DEFAULT_EMPLOYEES.map((e, i) => ({...e, id: i+1}))).returning();
            console.log(`${createdEmployees.length} funcionários criados.`);
            
            // Finance Data (Municipalities)
            const createdFinanceData = await tx.insert(schema.financeData).values(DEFAULT_FINANCE_DATA.map((fd, i) => ({...fd, id: i+1}))).returning();
            console.log(`${createdFinanceData.length} municípios criados.`);

            // Suppliers
            const createdSuppliers = await tx.insert(schema.suppliers).values(DEFAULT_SUPPLIERS.map((s, i) => ({...s, id: i+1}))).returning();
            console.log(`${createdSuppliers.length} fornecedores criados.`);
            
            // Dependent data
            if (adminUser) {
                const posts = DEFAULT_UPDATE_POSTS.map((p, i) => ({ ...p, id: i+1, authorId: adminUser.id, createdAt: new Date(p.createdAt).toISOString() }));
                await tx.insert(schema.updatePosts).values(posts);
                console.log('Notas de atualização criadas.');
            }

            const tasks = DEFAULT_TASKS.map((t, i) => ({...t, id: i+1, employeeId: createdEmployees[t.employeeIndex].id, date: new Date(t.date).toISOString() }));
            await tx.insert(schema.tasks).values(tasks);
            console.log('Tarefas criadas.');

            const employeeExpenses = DEFAULT_EMPLOYEE_EXPENSES.map((e, i) => ({...e, id: i+1, employeeId: createdEmployees[e.employeeIndex].id, date: new Date(e.date).toISOString()}));
            await tx.insert(schema.employeeExpenses).values(employeeExpenses);
            console.log('Despesas de funcionários criadas.');

            const internalExpenses = DEFAULT_INTERNAL_EXPENSES.map((e, i) => ({
                ...e, id: i+1,
                supplierId: e.supplierIndex !== undefined ? createdSuppliers[e.supplierIndex].id : null,
                date: new Date(e.date).toISOString()
            }));
            await tx.insert(schema.internalExpenses).values(internalExpenses);
            console.log('Despesas internas criadas.');

            const assets = DEFAULT_ASSETS.map((a, i) => ({
                ...a, id: i+1,
                assignedToEmployeeId: a.employeeIndex !== undefined ? createdEmployees[a.employeeIndex].id : null,
                purchaseDate: new Date(a.purchaseDate).toISOString()
            }));
            await tx.insert(schema.assets).values(assets);
            console.log('Patrimônios criados.');
            
            const transactions = DEFAULT_TRANSACTIONS.map((t, i) => ({
                ...t, id: i+1,
                municipalityId: t.municipalityIndex !== undefined ? createdFinanceData[t.municipalityIndex].id : null,
                dueDate: new Date(t.dueDate).toISOString(),
                paymentDate: t.paymentDate ? new Date(t.paymentDate).toISOString() : null
            }));
            await tx.insert(schema.transactions).values(transactions);
            console.log('Transações criadas.');
            
            const payrolls = DEFAULT_PAYROLLS.map((p, i) => ({...p, id: i+1, employeeId: createdEmployees[p.employeeIndex].id, payDate: new Date(p.payDate).toISOString() }));
            await tx.insert(schema.payrolls).values(payrolls);
            console.log('Folhas de pagamento criadas.');
            
            const leaveRequests = DEFAULT_LEAVE_REQUESTS.map((l, i) => ({...l, id: i+1, employeeId: createdEmployees[l.employeeIndex].id, startDate: new Date(l.startDate).toISOString(), endDate: new Date(l.endDate).toISOString() }));
            await tx.insert(schema.leaveRequests).values(leaveRequests);
            console.log('Solicitações de férias criadas.');
            
            // Config data
            await tx.insert(schema.config).values([
                { key: 'permissions', value: DEFAULT_PERMISSIONS },
                { key: 'notifications', value: DEFAULT_NOTIFICATIONS },
                { key: 'app_seeded_v3', value: true }
            ]).onConflictDoUpdate({ target: schema.config.key, set: { value: sql`EXCLUDED.value` } });
            console.log('Configurações salvas.');
        });
        
        console.log('✅ Povoamento concluído com sucesso!');
        return res.status(200).json({ 
            message: 'Configuração concluída! Os dados iniciais foram inseridos no Neon DB. Por segurança, remova o segredo da URL de setup.' 
        });

    } catch (error: any) {
        console.error('Erro durante o setup:', error);
        return res.status(500).json({ 
            error: 'Ocorreu um erro durante a configuração.', 
            details: error.message 
        });
    }
}