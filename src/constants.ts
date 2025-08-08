import { Permissions, Notification, SystemUser, UpdatePost, Employee, Task, FinanceData, EmployeeExpense, Supplier, InternalExpense, Asset, Transaction, PayrollRecord, LeaveRequest } from './types';

// Senha padrão para todos os usuários: "Infoco@2024"
export const DEFAULT_SYSTEM_USERS: (Omit<SystemUser, 'id' | 'passwordHash'> & { password: string })[] = [
    { name: 'Admin Geral', email: 'admin@infoco.com.br', role: 'admin', department: 'Administração', pfp: null, password: 'Infoco@2024' },
    { name: 'Maria Souza', email: 'maria.souza@infoco.com.br', role: 'director', department: 'Diretoria', pfp: null, password: 'Infoco@2024' },
    { name: 'João Silva', email: 'joao.silva@infoco.com.br', role: 'coordinator', department: 'Operacional', pfp: null, password: 'Infoco@2024' },
    { name: 'Ana Pereira', email: 'ana.pereira@infoco.com.br', role: 'support', department: 'Suporte', pfp: null, password: 'Infoco@2024' },
];

export const DEFAULT_PERMISSIONS: Permissions = {
  admin: {
    canViewDashboard: true, canManageDocuments: true, canManageFinance: true, canViewReports: true,
    canManageTasks: true, canManageEmployees: true, canManageEmail: true, canManageNotes: true,
    canManageHR: true, canManageInternalExpenses: true, canManageAssets: true, canManageUsers: true, canManageSettings: true,
  },
  director: {
    canViewDashboard: true, canManageDocuments: false, canManageFinance: true, canViewReports: true,
    canManageTasks: false, canManageEmployees: false, canManageEmail: false, canManageNotes: false,
    canManageHR: false, canManageInternalExpenses: false, canManageAssets: false, canManageUsers: false, canManageSettings: false,
  },
  coordinator: {
    canViewDashboard: true, canManageDocuments: true, canManageFinance: false, canViewReports: true,
    canManageTasks: true, canManageEmployees: true, canManageEmail: true, canManageNotes: true,
    canManageHR: true, canManageInternalExpenses: true, canManageAssets: true, canManageUsers: false, canManageSettings: false,
  },
  support: {
    canViewDashboard: true, canManageDocuments: false, canManageFinance: false, canViewReports: false,
    canManageTasks: true, canManageEmployees: false, canManageEmail: false, canManageNotes: true,
    canManageHR: false, canManageInternalExpenses: false, canManageAssets: false, canManageUsers: false, canManageSettings: false,
  },
};

export const DEFAULT_UPDATE_POSTS: Omit<UpdatePost, 'id' | 'authorId'>[] = [
    { content: "Bem-vindo ao novo sistema de gestão Infoco! Explore as funcionalidades e nos dê seu feedback.", createdAt: "2024-08-01T10:00:00Z" },
    { content: "O módulo de ZOHO Mail foi integrado. Agora você pode gerenciar seus e-mails diretamente do sistema.", createdAt: "2024-08-02T14:30:00Z" },
];

export const DEFAULT_EMPLOYEES: Omit<Employee, 'id'>[] = [
    { name: 'Carlos Ferreira', position: 'Desenvolvedor', department: 'Tecnologia', email: 'carlos.f@infoco.com.br', baseSalary: 7500 },
    { name: 'Beatriz Lima', position: 'Analista de Suporte', department: 'Suporte', email: 'beatriz.l@infoco.com.br', baseSalary: 4500 },
    { name: 'Ricardo Alves', position: 'Gerente de Projetos', department: 'Operacional', email: 'ricardo.a@infoco.com.br', baseSalary: 9500 },
];

export const DEFAULT_FINANCE_DATA: Omit<FinanceData, 'id'>[] = [
    { municipality: "Cidade Exemplo", paid: 150000, pending: 25000, contractEndDate: "2025-12-31T00:00:00Z", coatOfArmsUrl: 'https://cdn-icons-png.flaticon.com/512/993/993427.png' },
    { municipality: "Vila Teste", paid: 80000, pending: 0, contractEndDate: "2026-06-30T00:00:00Z", coatOfArmsUrl: 'https://cdn-icons-png.flaticon.com/512/1/1401.png' },
];

export const DEFAULT_TASKS: (Omit<Task, 'id' | 'employeeId'> & {employeeIndex: number})[] = [
    { title: "Desenvolver tela de relatórios", description: "Criar a interface para geração de relatórios financeiros.", date: "2024-08-10T00:00:00Z", hours: 16, status: "Em Andamento", employeeIndex: 0 },
    { title: "Atender chamado #123", description: "Resolver problema do cliente com a emissão de notas.", date: "2024-08-05T00:00:00Z", hours: 2, status: "Concluída", employeeIndex: 1 },
];

export const DEFAULT_EMPLOYEE_EXPENSES: (Omit<EmployeeExpense, 'id' | 'employeeId'> & {employeeIndex: number})[] = [
    { type: 'Viagem', description: 'Visita técnica ao cliente em Vila Teste', amount: 350, date: "2024-07-20T00:00:00Z", status: 'Pago', receipt: null, employeeIndex: 2 },
];

export const DEFAULT_SUPPLIERS: Omit<Supplier, 'id'>[] = [
    { name: 'Papelaria Central', category: 'Material de Escritório', contactPerson: 'Sr. Roberto', email: 'contato@papelariacentral.com', phone: '11-5555-1234' },
    { name: 'Provedor Web S.A.', category: 'Serviços de TI', contactPerson: 'Sra. Lúcia', email: 'lucia@pweb.com', phone: '11-5555-5678' },
];

export const DEFAULT_INTERNAL_EXPENSES: (Omit<InternalExpense, 'id' | 'supplierId'> & {supplierIndex?: number})[] = [
    { description: 'Compra de resmas de papel e canetas', category: 'Material de Escritório', amount: 250, date: '2024-07-15T00:00:00Z', supplierIndex: 0 },
    { description: 'Pagamento de conta de energia elétrica', category: 'Contas Fixas', amount: 850, date: '2024-07-25T00:00:00Z' },
];

export const DEFAULT_ASSETS: (Omit<Asset, 'id' | 'assignedToEmployeeId'> & {employeeIndex?: number})[] = [
    { name: 'Notebook Dell Inspiron', description: 'Core i7, 16GB RAM', purchaseDate: '2023-01-10T00:00:00Z', purchaseValue: 6500, location: 'Escritório', status: 'Em Uso', employeeIndex: 0 },
];

export const DEFAULT_NOTIFICATIONS: Notification[] = [
    { id: 1, type: 'reminder', title: 'Contrato Próximo do Fim', description: 'O contrato com a "Cidade Exemplo" expira em breve.', date: '2025-12-01T09:00:00Z', eventDate: '2025-12-31T00:00:00Z', read: false, link: '/municipalities' },
];

export const DEFAULT_TRANSACTIONS: (Omit<Transaction, 'id' | 'municipalityId'> & {municipalityIndex?: number})[] = [
    { type: 'receivable', description: 'Fatura de Julho/2024', amount: 25000, dueDate: '2024-08-10T00:00:00Z', status: 'pending', municipalityIndex: 0 }
];

export const DEFAULT_PAYROLLS: (Omit<PayrollRecord, 'id' | 'employeeId'> & {employeeIndex: number})[] = [
    { employeeIndex: 0, monthYear: '2024-07', baseSalary: 7500, benefits: 500, deductions: 1200, netPay: 6800, payDate: '2024-08-05T00:00:00Z' }
];

export const DEFAULT_LEAVE_REQUESTS: (Omit<LeaveRequest, 'id' | 'employeeId'> & {employeeIndex: number})[] = [
    { employeeIndex: 1, type: 'Férias', startDate: '2024-09-01T00:00:00Z', endDate: '2024-09-15T00:00:00Z', reason: 'Férias anuais', status: 'Pendente' }
];