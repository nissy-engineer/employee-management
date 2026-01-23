import React, { useState, useEffect } from 'react';
import './EmployeeList.css';
import EmployeeDetailModal from './EmployeeDetailModal';
import API_URL from '../config';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { Employee, EmployeeWithDetails } from '../types';

function EmployeeList() {

    // ====================================================
    // state定義エリア
    // ====================================================

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [exporting, setExporting] = useState<boolean>(false);

    // ====================================================
    // 初期化処理
    // ====================================================

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ====================================================
    // ハンドラー
    // ====================================================

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${API_URL}/api/employees/import`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'インポートに失敗しました');
                }

                const result = await response.json();
                alert(`インポートが完了しました\n成功: ${result.successCount}件\n失敗: ${result.failureCount}件`);

                fetchEmployees();

            } catch (error) {
                console.error('インポートエラー:', error);
                alert('インポートに失敗しました: ' + (error as Error).message);
            }
        };
        input.click();
    };

    const handleExport = async () => {
        try {
            setExporting(true);

            const response = await fetch(`${API_URL}/api/employees/export`);

            if (!response.ok) {
                throw new Error('エクスポートに失敗しました');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `社員一覧_${new Date().toISOString().split('T')[0]}.csv`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('エクスポートエラー:', error);
            alert('エクスポートに失敗しました: ' + (error as Error).message);
        } finally {
            setExporting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/employees/search?keyword=${encodeURIComponent(searchKeyword)}`
            );
            if (!response.ok) {
                throw new Error('検索に失敗しました');
            }
            const data: Employee[] = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // ====================================================
    // 各種関数
    // ====================================================

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/employees`);
            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }
            const data: Employee[] = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleRowClick = async (employee: Employee) => {
        const detailData = await fetchEmployeeDetail(employee.id);

        if (detailData) {
            setSelectedEmployee(detailData);
            setShowModal(true);
        }
    };

    const fetchEmployeeDetail = async (employeeId: number): Promise<EmployeeWithDetails | null> => {
        try {
            const response = await fetch(`${API_URL}/api/employees/${employeeId}`);
            if (!response.ok) {
                throw new Error('詳細データの取得に失敗しました');
            }
            const data: EmployeeWithDetails = await response.json();
            return data;
        } catch (err) {
            setError((err as Error).message);
            return null;
        }
    };

    // ====================================================
    // レンダリングエリア
    // ====================================================

    if (loading) {
        return <div>読み込み中...</div>;
    }
    if (error) {
        return <div>エラー: {error}</div>;
    }

    return (
        <div className="employee-list">

            {/* 1行目: タイトル */}
            <div className="employee-title-area">
                <div className="employee-title">社員情報管理システム</div>
            </div>

            {/* 2行目: 検索・各種ボタン */}
            <div className="employee-search-area">
                <div className="employee-search-content">
                    <input
                        type="text"
                        placeholder="検索..."
                        className="employee-search-input"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <button
                        className="employee-search-button"
                        onClick={handleSearch}
                    >
                        検索
                    </button>
                </div>
                <div className="employee-action-buttons">
                    <button
                        className="employee-add-button"
                        onClick={() => setShowAddModal(true)}
                    >
                        新規追加
                    </button>
                    <button
                        className="employee-import-button"
                        onClick={handleImport}
                    >
                        <FiDownload style={{ marginRight: '6px' }} />
                        インポート
                    </button>
                    <button
                        className="employee-export-button"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <FiUpload style={{ marginRight: '6px' }} />
                        {exporting ? 'エクスポート中...' : 'エクスポート'}
                    </button>
                </div>
            </div>

            {/* 3行目: テーブル */}
            <div className="employee-table-area">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>社員ID</th>
                            <th>氏名</th>
                            <th>所属部署</th>
                            <th>役職</th>
                            <th>入社日</th>
                            <th>メールアドレス</th>
                            <th>電話番号</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr
                                key={employee.id}
                                onClick={() => handleRowClick(employee)}
                                className="employee-row-clickable"
                            >
                                <td>{employee.id}</td>
                                <td>{employee.name}</td>
                                <td>{employee.department}</td>
                                <td>{employee.position}</td>
                                <td>{formatDate(employee.hireDate)}</td>
                                <td>{employee.email}</td>
                                <td>{employee.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* モーダル表示 */}
            {showModal && (
                <EmployeeDetailModal
                    employee={selectedEmployee}
                    onClose={handleCloseModal}
                />
            )}

            {/* 新規追加モーダル表示 */}
            {showAddModal && (
                <EmployeeDetailModal
                    employee={null} 
                    mode="add"
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );

}

export default EmployeeList;