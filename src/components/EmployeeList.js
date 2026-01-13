import React, { useState, useEffect } from 'react';
import './EmployeeList.css';
import EmployeeDetailModal from './EmployeeDetailModal';
import API_URL from '../config';  // ← 追加

function EmployeeList() {

    // バックエンドから取得した社員データ
    const [employees, setEmployees] = useState([]);

    // ローディング＆エラーのUI制御
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // モーダル制御用のstate
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 検索キーワードのstate
    const [searchKeyword, setSearchKeyword] = useState('');

    // 初回表示時のデータ読み込み
    useEffect(() => {
        fetchEmployees();
    }, []);



    // 社員データ取得関数
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/employees`);  // ← 修正
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

    // モーダルを閉じる処理
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    // 検索ボタン押下
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

            {/* 2行目: 検索エリアとボタンエリア */}
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
                    <button className="employee-import-button">インポート</button>
                    <button className="employee-export-button">エクスポート</button>
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
        </div>
    );

}

export default EmployeeList;





// import React, { useState, useEffect } from 'react';
// import './EmployeeList.css';
// import EmployeeDetailModal from './EmployeeDetailModal';

// function EmployeeList() {

//     // バックエンドから取得した社員データ
//     const [employees, setEmployees] = useState([]);

//     // ローディング＆エラーのUI制御
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // モーダル制御用のstate
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     // 検索キーワードのstate
//     const [searchKeyword, setSearchKeyword] = useState('');

//     // 初回表示時のデータ読み込み
//     useEffect(() => {
//         fetchEmployees();
//     }, []);



//     // 社員データ取得関数
//     const fetchEmployees = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch('http://localhost:5182/api/employees');
//             if (!response.ok) {
//                 throw new Error('データの取得に失敗しました');
//             }
//             const data = await response.json();
//             setEmployees(data);
//             setError(null);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 日付フォーマット関数
//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     };

//     // 行クリック時の処理
//     const handleRowClick = async (employee) => {
//         // 詳細データを取得
//         const detailData = await fetchEmployeeDetail(employee.id);

//         if (detailData) {
//             setSelectedEmployee(detailData);  // 詳細データをセット
//             setShowModal(true);
//         }
//     };

//     // 社員詳細データ取得関数
//     const fetchEmployeeDetail = async (employeeId) => {
//         try {
//             const response = await fetch(`http://localhost:5182/api/employees/${employeeId}`);
//             if (!response.ok) {
//                 throw new Error('詳細データの取得に失敗しました');
//             }
//             const data = await response.json();
//             return data;
//         } catch (err) {
//             setError(err.message);
//             return null;
//         }
//     };

//     // モーダルを閉じる処理
//     const handleCloseModal = () => {
//         setShowModal(false);
//         setSelectedEmployee(null);
//     };

//     // 検索ボタン押下
//     const handleSearch = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch(
//                 `http://localhost:5182/api/employees/search?keyword=${encodeURIComponent(searchKeyword)}`
//             );
//             if (!response.ok) {
//                 throw new Error('検索に失敗しました');
//             }
//             const data = await response.json();
//             setEmployees(data);
//             setError(null);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <div>読み込み中...</div>;
//     }
//     if (error) {
//         return <div>エラー: {error}</div>;
//     }

//     return (
//         <div className="employee-list">

//             {/* 1行目: タイトル */}
//             <div className="employee-title-area">
//                 <div className="employee-title">社員情報管理システム</div>
//             </div>

//             {/* 2行目: 検索エリアとボタンエリア */}
//             <div className="employee-search-area">
//                 <div className="employee-search-content">
//                     <input
//                         type="text"
//                         placeholder="検索..."
//                         className="employee-search-input"
//                         value={searchKeyword}
//                         onChange={(e) => setSearchKeyword(e.target.value)}
//                         onKeyPress={(e) => {
//                             if (e.key === 'Enter') {
//                                 handleSearch();
//                             }
//                         }}
//                     />
//                     <button
//                         className="employee-search-button"
//                         onClick={handleSearch}
//                     >
//                         検索
//                     </button>
//                 </div>
//                 <div className="employee-action-buttons">
//                     <button className="employee-import-button">インポート</button>
//                     <button className="employee-export-button">エクスポート</button>
//                 </div>
//             </div>

//             {/* 3行目: テーブル */}
//             <div className="employee-table-area">
//                 <table className="employee-table">
//                     <thead>
//                         <tr>
//                             <th>社員ID</th>
//                             <th>氏名</th>
//                             <th>所属部署</th>
//                             <th>役職</th>
//                             <th>入社日</th>
//                             <th>メールアドレス</th>
//                             <th>電話番号</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {employees.map((employee) => (
//                             <tr
//                                 key={employee.id}
//                                 onClick={() => handleRowClick(employee)}
//                                 className="employee-row-clickable"
//                             >
//                                 <td>{employee.id}</td>
//                                 <td>{employee.name}</td>
//                                 <td>{employee.department}</td>
//                                 <td>{employee.position}</td>
//                                 <td>{formatDate(employee.hireDate)}</td>
//                                 <td>{employee.email}</td>
//                                 <td>{employee.phone}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* モーダル表示 */}
//             {showModal && (
//                 <EmployeeDetailModal
//                     employee={selectedEmployee}
//                     onClose={handleCloseModal}
//                 />
//             )}
//         </div>
//     );

// }

// export default EmployeeList;