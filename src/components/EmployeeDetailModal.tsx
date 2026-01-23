import React, { useState } from 'react';
import './EmployeeDetailModal.css';
import API_URL from '../config';
import { EmployeeWithDetails, UpdateEmployeeRequest } from '../types';

interface EmployeeDetailModalProps {
    employee?: EmployeeWithDetails | null;
    onClose: () => void;
    mode?: 'view' | 'add';
}

function EmployeeDetailModal({ employee, onClose, mode = 'view' }: EmployeeDetailModalProps) {
    
    // mode: 'view' = 表示/編集モード, 'add' = 新規追加モード

    const [isEditing, setIsEditing] = useState<boolean>(mode === 'add');
    const [editedEmployee, setEditedEmployee] = useState<EmployeeWithDetails | null>(
        mode === 'add'
            ? {
                id: 0,
                name: '',
                department: '',
                position: '',
                hireDate: '',
                email: '',
                phone: '',
                isValid: true,
                details: {
                    employmentType: '',
                    notes: ''
                }
            }
            : null
    );

    if (!employee && mode !== 'add') return null;

    // 日付フォーマット関数
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 写真変更処理
    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !employee) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch(
                `${API_URL}/api/employees/${employee.id}/upload-photo`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('画像のアップロードに失敗しました');
            }

            const data = await response.json();
            console.log(data);
            alert('画像をアップロードしました！');

            onClose();
            window.location.reload();
        } catch (error) {
            alert('エラー: ' + (error as Error).message);
        }
    };

    // 編集ボタン押下
    const handleEditClick = () => {
        if (!employee) return;
        setEditedEmployee({
            ...employee,
            details: { ...employee.details }
        });
        setIsEditing(true);
    };

    // 保存ボタン押下（新規追加 or 更新）
    const handleSave = async () => {
        console.log('=== handleSave 開始 ===');
        console.log('mode:', mode);
        console.log('editedEmployee:', editedEmployee);

        if (!editedEmployee) return;

        // バリデーション
        if (!editedEmployee.name || !editedEmployee.department ||
            !editedEmployee.position || !editedEmployee.hireDate ||
            !editedEmployee.email || !editedEmployee.phone) {
            console.log('バリデーションエラー');
            alert('必須項目を入力してください');
            return;
        }

        console.log('バリデーションOK');

        try {
            const url = mode === 'add'
                ? `${API_URL}/api/employees`
                : `${API_URL}/api/employees/${employee?.id}`;

            console.log('送信先URL:', url);

            const method = mode === 'add' ? 'POST' : 'PUT';
            console.log('HTTPメソッド:', method);

            const requestBody: UpdateEmployeeRequest = {
                name: editedEmployee.name,
                department: editedEmployee.department,
                position: editedEmployee.position,
                hireDate: editedEmployee.hireDate,
                email: editedEmployee.email,
                phone: editedEmployee.phone,
                employmentType: editedEmployee.details?.employmentType || '',
                notes: editedEmployee.details?.notes || ''
            };

            console.log('送信データ:', requestBody);

            console.log('fetch開始...');
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('fetch完了');
            console.log('response.ok:', response.ok);
            console.log('response.status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.log('エラーレスポンス:', errorData);
                throw new Error(mode === 'add' ? '登録に失敗しました' : '更新に失敗しました');
            }

            const data = await response.json();
            console.log('成功レスポンス:', data);

            alert(mode === 'add' ? '社員を登録しました！' : '社員情報を更新しました！');
            setIsEditing(false);

            // モーダルを閉じて再読み込み
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('エラー発生:', error);
            alert('エラー: ' + (error as Error).message);
        }
    };

    // キャンセルボタン押下
    const handleCancel = () => {
        if (mode === 'add') {
            onClose();
        } else {
            setIsEditing(false);
            setEditedEmployee(null);
        }
    };

    // 入力値変更
    const handleInputChange = (field: keyof EmployeeWithDetails, value: string) => {
        if (!editedEmployee) return;
        setEditedEmployee({
            ...editedEmployee,
            [field]: value
        });
    };

    // 詳細情報の入力値変更
    const handleDetailInputChange = (field: string, value: string) => {
        if (!editedEmployee) return;
        setEditedEmployee({
            ...editedEmployee,
            details: {
                ...editedEmployee.details,
                [field]: value
            }
        });
    };

    // 削除ボタン押下
    const handleDelete = async () => {
        if (!employee) return;
        
        if (!window.confirm('本当にこの社員を削除しますか？')) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/employees/${employee.id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('削除に失敗しました');
            }

            alert('社員を削除しました');
            onClose();
            window.location.reload();
        } catch (error) {
            alert('エラー: ' + (error as Error).message);
        }
    };

    // 表示用データ（編集中は編集データ、通常時は元データ、新規追加時は編集データ）
    const displayEmployee = mode === 'add'
        ? editedEmployee
        : (isEditing ? editedEmployee : employee);

    if (!displayEmployee) return null;

    return (
        <div className="employee-detail-modal-overlay" onClick={onClose}>
            <div className="employee-detail-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* ヘッダー */}
                <div className="employee-detail-modal-header">
                    <h2>{mode === 'add' ? '新規社員登録' : '社員詳細情報'}</h2>
                    <button className="employee-detail-modal-close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* 本文 */}
                <div className="employee-detail-modal-body">

                    {/* プロフィール写真エリア（新規追加時は非表示） */}
                    {mode !== 'add' && (
                        <div className="employee-detail-profile-photo-section">
                            <div className="employee-detail-profile-photo">
                                {displayEmployee.details?.photoUrl ? (
                                    <img
                                        src={`${API_URL}${displayEmployee.details.photoUrl}`}
                                        alt={`${displayEmployee.name}のプロフィール写真`}
                                    />
                                ) : (
                                    <div className="employee-detail-profile-photo-placeholder">
                                        写真未登録
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <>
                                    <input
                                        type="file"
                                        id="photo-upload-input"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                    <button
                                        className="employee-detail-photo-upload-button"
                                        onClick={() => document.getElementById('photo-upload-input')?.click()}
                                    >
                                        写真を変更
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* 基本情報 */}
                    <div className="employee-detail-section">
                        <h3 className="employee-detail-section-title">基本情報</h3>

                        {/* 社員ID（新規追加時は非表示） */}
                        {mode !== 'add' && (
                            <div className="employee-detail-row">
                                <span className="employee-detail-label">社員ID:</span>
                                <span className="employee-detail-value">{displayEmployee.id}</span>
                            </div>
                        )}

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">氏名: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="山田 太郎"
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.name}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">所属部署: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    placeholder="営業部"
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.department}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">役職: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    placeholder="課長"
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.position}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">入社日: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="date"
                                    className="employee-detail-input"
                                    value={displayEmployee.hireDate ? displayEmployee.hireDate.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{formatDate(displayEmployee.hireDate)}</span>
                            )}
                        </div>
                    </div>

                    {/* 連絡先情報 */}
                    <div className="employee-detail-section">
                        <h3 className="employee-detail-section-title">連絡先</h3>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">メールアドレス: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="employee-detail-input"
                                    value={displayEmployee.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="yamada@example.com"
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.email}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">電話番号: {isEditing && '*'}</span>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="employee-detail-input"
                                    value={displayEmployee.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="090-1234-5678"
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.phone}</span>
                            )}
                        </div>
                    </div>

                    {/* 雇用情報 */}
                    {(displayEmployee.details || isEditing) && (
                        <div className="employee-detail-section">
                            <h3 className="employee-detail-section-title">雇用情報</h3>

                            {(displayEmployee.details?.employmentType || isEditing) && (
                                <div className="employee-detail-row">
                                    <span className="employee-detail-label">雇用形態:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="employee-detail-input"
                                            value={displayEmployee.details?.employmentType || ''}
                                            onChange={(e) => handleDetailInputChange('employmentType', e.target.value)}
                                            placeholder="正社員"
                                        />
                                    ) : (
                                        <span className="employee-detail-value">{displayEmployee.details?.employmentType}</span>
                                    )}
                                </div>
                            )}

                            {mode !== 'add' && displayEmployee.details?.managerName && (
                                <div className="employee-detail-row">
                                    <span className="employee-detail-label">直属の上司:</span>
                                    <span className="employee-detail-value">{displayEmployee.details.managerName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 備考 */}
                    {(displayEmployee.details?.notes || isEditing) && (
                        <div className="employee-detail-section">
                            <h3 className="employee-detail-section-title">備考</h3>
                            {isEditing ? (
                                <textarea
                                    className="employee-detail-textarea"
                                    value={displayEmployee.details?.notes || ''}
                                    onChange={(e) => handleDetailInputChange('notes', e.target.value)}
                                    rows={4}
                                    placeholder="備考を入力..."
                                />
                            ) : (
                                <div className="employee-detail-notes">
                                    {displayEmployee.details?.notes}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* フッター */}
                <div className="employee-detail-modal-footer">
                    {isEditing ? (
                        <>
                            <button className="employee-detail-save-button" onClick={handleSave}>
                                {mode === 'add' ? '登録' : '保存'}
                            </button>
                            <button className="employee-detail-cancel-edit-button" onClick={handleCancel}>
                                キャンセル
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="employee-detail-edit-button" onClick={handleEditClick}>
                                編集
                            </button>
                            <button
                                className="employee-detail-delete-button"
                                onClick={handleDelete}
                            >
                                削除
                            </button>
                            <button className="employee-detail-cancel-button" onClick={onClose}>
                                閉じる
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default EmployeeDetailModal;