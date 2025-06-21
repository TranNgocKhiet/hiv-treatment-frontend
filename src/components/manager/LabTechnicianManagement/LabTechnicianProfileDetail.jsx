import React from 'react';
import { Modal, Descriptions, Tag, Spin, Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, ExperimentOutlined, TeamOutlined } from '@ant-design/icons';
import './LabTechnicianProfileDetail.css';

const LabTechnicianProfileDetail = ({ visible, labTechnician, statistics, loading, onClose }) => {
    if (!labTechnician) return null;

    return (
        <Modal
            title="Thông tin chi tiết kỹ thuật viên"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="lab-technician-profile-modal"
        >
            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div className="profile-header">
                        <div className="avatar-section">
                            {labTechnician.avatarUrl ? (
                                <img src={labTechnician.avatarUrl} alt="Lab technician avatar" className="lab-technician-avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <UserOutlined />
                                </div>
                            )}
                        </div>
                        <div className="basic-info">
                            <h2>{labTechnician.fullName}</h2>
                            <p>{labTechnician.position}</p>
                            <Tag color="blue">{labTechnician.department}</Tag>
                        </div>
                    </div>

                    {statistics && (
                        <Row gutter={16} className="statistics-section">
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Số xét nghiệm đã thực hiện"
                                        value={statistics.totalTests}
                                        prefix={<ExperimentOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Giờ làm việc"
                                        value={statistics.workingHours}
                                        suffix="h"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Số bệnh nhân đã phục vụ"
                                        value={statistics.totalPatients}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Descriptions
                        bordered
                        column={1}
                        className="lab-technician-details"
                    >
                        <Descriptions.Item label="Email">
                            {labTechnician.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {labTechnician.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban">
                            {labTechnician.department}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí">
                            {labTechnician.position}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học vấn">
                            {labTechnician.education || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày vào làm">
                            {labTechnician.joinDate || 'Chưa cập nhật'}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}
        </Modal>
    );
};

export default LabTechnicianProfileDetail; 