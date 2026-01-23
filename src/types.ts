// 社員の基本情報（employeesテーブル）
export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  hireDate: string;
  email: string;
  phone: string;
  isValid: boolean;
}

// 社員の詳細情報（employee_detailsテーブル）
export interface EmployeeDetail {
  photoUrl?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  employmentType?: string;
  managerId?: number;
  managerName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isValid?: boolean;
}

// 社員情報（基本+詳細）
export interface EmployeeWithDetails extends Employee {
  details?: EmployeeDetail;
}

// 社員更新リクエスト
export interface UpdateEmployeeRequest {
  name: string;
  department: string;
  position: string;
  hireDate: string;
  email: string;
  phone: string;
  employmentType: string;
  notes: string;
}

// APIレスポンス型
export interface ApiResponse {
  message: string;
  employeeId?: number;
}

export interface ImportResponse {
  message: string;
  successCount: number;
  failureCount: number;
  errors: string[];
}