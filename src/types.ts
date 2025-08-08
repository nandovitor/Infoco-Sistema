
export type UserRole = 'admin' | 'coordinator' | 'support' | 'director';
export type TaskStatus = 'Concluída' | 'Em Andamento' | 'Pendente';
export type ExpenseType = 'Salário' | 'Vale' | 'Viagem' | 'Reembolso' | 'Outro';
export type PaymentStatus = 'Pago' | 'Pendente';
export type InternalExpenseCategory = 'Material de Escritório' | 'Contas Fixas' | 'Manutenção' | 'Marketing' | 'Outros';
export type AssetStatus = 'Em Uso' | 'Em Manutenção' | 'Danificado' | 'Descartado';
export type NotificationType = 'system' | 'reminder';
export type TransactionType = 'receivable' | 'payable';
export type TransactionStatus = 'pending' | 'paid';
export type LeaveType = 'Férias' | 'Licença Médica' | 'Outro';
export type LeaveStatus = 'Pendente' | 'Aprovada' | 'Rejeitada';
export type ExternalSystemType = 'Contábil' | 'Licitações' | 'Almoxarifado' | 'Patrimônio' | 'Outro';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  pfp?: string | null;
  passwordHash: string;
}

export type User = Profile;
export type SystemUser = Profile;

export interface Employee {
    id: number;
    name: string;
    position: string;
    department: string;
    email: string;
    baseSalary?: number | null;
}

export interface Task {
    id: number;
    employeeId: number;
    title: string;
    description: string;
    date: string;
    hours: number;
    status: TaskStatus;
}

export interface FinanceData {
    id: number;
    municipality: string;
    paid: number;
    pending: number;
    contractEndDate: string;
    coatOfArmsUrl?: string | null;
}

export interface UpdatePost {
    id: number;
    authorId: string;
    content: string;
    createdAt: string;
}

export interface EmployeeExpense {
    id: number;
    employeeId: number;
    type: ExpenseType;
    description: string;
    amount: number;
    date: string;
    status: PaymentStatus;
    receipt?: string | null;
}

export interface Supplier {
    id: number;
    name: string;
    category: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export interface InternalExpense {
    id: number;
    description: string;
    category: InternalExpenseCategory;
    amount: number;
    date: string;
    supplierId?: number | null;
}

export interface MaintenanceRecord {
    date: string;
    description: string;
    cost: number;
}

export interface Asset {
    id: number;
    name: string;
    description: string;
    purchaseDate: string;
    purchaseValue: number;
    location: string;
    status: AssetStatus;
    assignedToEmployeeId?: number | null;
    maintenanceLog?: MaintenanceRecord[];
}

export interface ManagedFile {
    id: number;
    name: string;
    type: string;
    size: number;
    url: string;
    municipalityName: string;
    folder: string;
    createdAt: string;
}

export interface PaymentNote {
    id: number;
    referenceMonth: string;
    description: string;
    uploadDate: string;
    municipalityName: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
}

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    date: string;
    eventDate?: string | null;
    read: boolean;
    link?: string | null;
}

export interface Transaction {
    id: number;
    type: TransactionType;
    description: string;
    amount: number;
    dueDate: string;
    paymentDate?: string | null;
    status: TransactionStatus;
    municipalityId?: number | null;
}

export interface PayrollRecord {
    id: number;
    employeeId: number;
    monthYear: string;
    baseSalary: number;
    benefits: number;
    deductions: number;
    netPay: number;
    payDate: string;
}

export interface LeaveRequest {
    id: number;
    employeeId: number;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
}

export interface ExternalSystem {
    id: number;
    name: string;
    type: ExternalSystemType;
    apiUrl: string;
    accessToken: string;
    tokenType: string;
}

export interface Permissions {
  [role: string]: {
    [page: string]: boolean;
  };
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    };
}

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
    published_at: string;
    summary: string;
}

export interface ZohoTokenData {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface ZohoAccountInfo {
    accountId: string;
    primaryEmailAddress: string;
}

export interface ZohoEmailListItem {
    messageId: string;
    from: { emailAddress: string; name: string; };
    to: { emailAddress: string; name: string; }[];
    subject: string;
    summary: string;
    receivedTime: string;
    isRead: boolean;
}

export interface ZohoEmailAttachment {
    attachmentId: string;
    fileName: string;
    size: number;
    contentType: string;
    downloadUrl?: string; 
}

export interface ZohoEmail extends ZohoEmailListItem {
    content: string;
    attachments: ZohoEmailAttachment[];
}
