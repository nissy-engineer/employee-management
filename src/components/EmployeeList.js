import React, { useState, useEffect } from 'react';
import './EmployeeList.css';
import EmployeeDetailModal from './EmployeeDetailModal';
import API_URL from '../config';
import { FiUpload, FiDownload } from 'react-icons/fi';

function EmployeeList() {

    // ====================================================
    // state定義エリア
    // ====================================================
    // state = コンポーネントの状態（変更を監視するプロパティ）
    // 書き方: const [状態名, set状態名] = useState(初期値);
    // ----------------------------------------------------

    // バックエンドから取得した社員データ
    const [employees, setEmployees] = useState([]);

    // ローディング＆エラーのUI制御
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // モーダル制御用のstate
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // 検索キーワードのstate
    const [searchKeyword, setSearchKeyword] = useState('');

    // エクスポート用のローディングstate
    const [exporting, setExporting] = useState(false);



    // ====================================================
    // 初期化処理
    // ====================================================

    // データ読み込み（初回のみ）
    useEffect(() => {
        fetchEmployees();
    }, []);



    // ====================================================
    // ハンドラー
    // ====================================================

    // インポートボタン
    const handleImport = () => {
        // ファイル選択ダイアログを開く
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
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

                // 一覧を再読み込み
                fetchEmployees();

            } catch (error) {
                console.error('インポートエラー:', error);
                alert('インポートに失敗しました: ' + error.message);
            }
        };
        input.click();
    };

    // エクスポートボタン
    const handleExport = async () => {
        try {
            setExporting(true); // loadingではなくexportingを使う

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
            alert('エクスポートに失敗しました: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    // モーダル閉じる
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    // 検索ボタン
    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/employees/search?keyword=${encodeURIComponent(searchKeyword)}`  // ← 修正
            );
            if (!response.ok) {
                throw new Error('検索に失敗しました');
            }
            const data = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // ====================================================
    // 各種関数
    // ====================================================

    // 社員データ取得関数
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/employees`);
            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }
            const data = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 日付フォーマット関数
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 行クリック時の処理
    const handleRowClick = async (employee) => {
        // 詳細データを取得
        const detailData = await fetchEmployeeDetail(employee.id);

        if (detailData) {
            setSelectedEmployee(detailData);  // 詳細データをセット
            setShowModal(true);
        }
    };

    // 社員詳細データ取得関数
    const fetchEmployeeDetail = async (employeeId) => {
        try {
            const response = await fetch(`${API_URL}/api/employees/${employeeId}`);  // ← 修正
            if (!response.ok) {
                throw new Error('詳細データの取得に失敗しました');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
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
                <>
                    <EmployeeDetailModal
                        mode="add"
                        onClose={() => setShowAddModal(false)}
                    />
                </>
            )}
        </div>
    );

}

export default EmployeeList;