import React, { useState } from 'react';
import './EmployeeDetailModal.css';

function EmployeeDetailModal({ employee, onClose }) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState(null);

    if (!employee) return null;

    // 日付フォーマット関数
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 写真変更処理
    const handlePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch(
                `http://localhost:5182/api/employees/${employee.id}/upload-photo`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('画像のアップロードに失敗しました');
            }

            const data = await response.json();
            alert('画像をアップロードしました！');

            onClose();
            window.location.reload();
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    };

    // 編集ボタン押下
    const handleEditClick = () => {
        setEditedEmployee({
            ...employee,
            details: { ...employee.details }
        });
        setIsEditing(true);
    };

    // 保存ボタン押下
    const handleSave = async () => {
        try {
            const response = await fetch(
                `http://localhost:5182/api/employees/${employee.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: editedEmployee.name,
                        department: editedEmployee.department,
                        position: editedEmployee.position,
                        hireDate: editedEmployee.hireDate,
                        email: editedEmployee.email,
                        phone: editedEmployee.phone,
                        employmentType: editedEmployee.details?.employmentType || '',
                        notes: editedEmployee.details?.notes || ''
                    })
                }
            );

            if (!response.ok) {
                throw new Error('更新に失敗しました');
            }

            alert('社員情報を更新しました！');
            setIsEditing(false);

            // モーダルを閉じて再読み込み
            onClose();
            window.location.reload();
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    };

    // キャンセルボタン押下
    const handleCancel = () => {
        setIsEditing(false);
        setEditedEmployee(null);
    };

    // 入力値変更
    const handleInputChange = (field, value) => {
        setEditedEmployee({
            ...editedEmployee,
            [field]: value
        });
    };

    // 詳細情報の入力値変更
    const handleDetailInputChange = (field, value) => {
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
        if (!window.confirm('本当にこの社員を削除しますか？')) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5182/api/employees/${employee.id}`,
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
            alert('エラー: ' + error.message);
        }
    };

    // 表示用データ（編集中は編集データ、通常時は元データ）
    const displayEmployee = isEditing ? editedEmployee : employee;

    return (
        <div className="employee-detail-modal-overlay" onClick={onClose}>
            <div className="employee-detail-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* ヘッダー */}
                <div className="employee-detail-modal-header">
                    <h2>社員詳細情報</h2>
                    <button className="employee-detail-modal-close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* 本文 */}
                <div className="employee-detail-modal-body">

                    {/* プロフィール写真エリア */}
                    <div className="employee-detail-profile-photo-section">
                        <div className="employee-detail-profile-photo">
                            {displayEmployee.details?.photoUrl ? (
                                <img
                                    src={`http://localhost:5182${displayEmployee.details.photoUrl}`}
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
                                    onClick={() => document.getElementById('photo-upload-input').click()}
                                >
                                    写真を変更
                                </button>
                            </>
                        )}
                    </div>

                    {/* 基本情報 */}
                    <div className="employee-detail-section">
                        <h3 className="employee-detail-section-title">基本情報</h3>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">社員ID:</span>
                            <span className="employee-detail-value">{displayEmployee.id}</span>
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">氏名:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.name}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">所属部署:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.department}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">役職:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="employee-detail-input"
                                    value={displayEmployee.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.position}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">入社日:</span>
                            {isEditing ? (
                                <input
                                    type="date"
                                    className="employee-detail-input"
                                    value={displayEmployee.hireDate.split('T')[0]}
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
                            <span className="employee-detail-label">メールアドレス:</span>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="employee-detail-input"
                                    value={displayEmployee.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.email}</span>
                            )}
                        </div>

                        <div className="employee-detail-row">
                            <span className="employee-detail-label">電話番号:</span>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="employee-detail-input"
                                    value={displayEmployee.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            ) : (
                                <span className="employee-detail-value">{displayEmployee.phone}</span>
                            )}
                        </div>
                    </div>

                    {/* 雇用情報 (オプション) */}
                    {displayEmployee.details && (
                        <div className="employee-detail-section">
                            <h3 className="employee-detail-section-title">雇用情報</h3>

                            {(displayEmployee.details.employmentType || isEditing) && (
                                <div className="employee-detail-row">
                                    <span className="employee-detail-label">雇用形態:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="employee-detail-input"
                                            value={displayEmployee.details.employmentType || ''}
                                            onChange={(e) => handleDetailInputChange('employmentType', e.target.value)}
                                        />
                                    ) : (
                                        <span className="employee-detail-value">{displayEmployee.details.employmentType}</span>
                                    )}
                                </div>
                            )}

                            {displayEmployee.details.managerName && (
                                <div className="employee-detail-row">
                                    <span className="employee-detail-label">直属の上司:</span>
                                    <span className="employee-detail-value">{displayEmployee.details.managerName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 備考 (オプション) */}
                    {(displayEmployee.details?.notes || isEditing) && (
                        <div className="employee-detail-section">
                            <h3 className="employee-detail-section-title">備考</h3>
                            {isEditing ? (
                                <textarea
                                    className="employee-detail-textarea"
                                    value={displayEmployee.details?.notes || ''}
                                    onChange={(e) => handleDetailInputChange('notes', e.target.value)}
                                    rows="4"
                                />
                            ) : (
                                <div className="employee-detail-notes">
                                    {displayEmployee.details.notes}
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
                                保存
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