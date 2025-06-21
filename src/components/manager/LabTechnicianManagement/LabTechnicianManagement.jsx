import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Spin, message, Popconfirm } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import { fetchAllLabTechniciansAPI, fetchLabTechnicianByIdAPI, updateLabTechnicianProfileAPI, fetchLabTechnicianStatisticsAPI } from '../../../services/api.service';
import './LabTechnicianManagement.css';
import UpdateLabTechnicianModal from './UpdateLabTechnicianModal';
import LabTechnicianProfileDetail from './LabTechnicianProfileDetail';

const LabTechnicianManagement = () => {
  const [labTechnicians, setLabTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedLabTechnician, setSelectedLabTechnician] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Mock data for lab technicians
  const mockLabTechnicians = [
    {
      id: 1,
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0987654321',
      department: 'Xét nghiệm',
      position: 'Kỹ thuật viên xét nghiệm',
      education: 'Cử nhân Kỹ thuật Y học',
      joinDate: '01/01/2020',
    },
    {
      id: 2,
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      department: 'Chẩn đoán hình ảnh',
      position: 'Kỹ thuật viên chẩn đoán hình ảnh',
      education: 'Thạc sĩ Kỹ thuật Y sinh',
      joinDate: '15/03/2019',
    },
    {
      id: 3,
      fullName: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      department: 'Hóa sinh',
      position: 'Kỹ thuật viên hóa sinh',
      education: 'Cử nhân Sinh học',
      joinDate: '10/05/2021',
    },
    {
      id: 4,
      fullName: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      department: 'Vi sinh',
      position: 'Kỹ thuật viên vi sinh',
      education: 'Cử nhân Vi sinh Y học',
      joinDate: '22/07/2020',
    },
    {
      id: 5,
      fullName: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      department: 'Xét nghiệm',
      position: 'Trưởng nhóm',
      education: 'Thạc sĩ Xét nghiệm Y học',
      joinDate: '05/02/2018',
    },
  ];

  // Mock statistics data
  const mockStatistics = {
    totalTests: 1250,
    workingHours: 160,
    totalPatients: 450,
  };

  useEffect(() => {
    fetchLabTechnicians();
  }, []);

  const fetchLabTechnicians = async () => {
    setLoading(true);
    try {
      // Thử gọi API thực tế
      const response = await fetchAllLabTechniciansAPI();
      setLabTechnicians(response.data || []);
    } catch (error) {
      console.log('Error fetching lab technicians or using mock data:', error);
      // Sử dụng dữ liệu giả nếu API không hoạt động
      setLabTechnicians(mockLabTechnicians);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewProfile = async (record) => {
    setSelectedLabTechnician(null);
    try {
      // Lấy chi tiết kỹ thuật viên
      const detailRes = await fetchLabTechnicianByIdAPI(record.id);
      setSelectedLabTechnician(detailRes.data || record);
      
      // Lấy thống kê
      const statsRes = await fetchLabTechnicianStatisticsAPI(record.id);
      setStatistics(statsRes.data || mockStatistics);
      
      setIsProfileModalVisible(true);
    } catch (error) {
      console.error('Error fetching lab technician details:', error);
      setSelectedLabTechnician(record);
      setStatistics(mockStatistics);
      setIsProfileModalVisible(true);
    }
  };

  const handleUpdateLabTechnician = (record) => {
    setSelectedLabTechnician(record);
    setIsUpdateModalVisible(true);
  };

  const handleDeleteLabTechnician = async (id) => {
    try {
      // Trong trường hợp thực tế, bạn sẽ gọi API ở đây
      // await axios.delete(`/api/lab-technicians/${id}`);
      
      // Xóa kỹ thuật viên khỏi state
      setLabTechnicians(labTechnicians.filter(tech => tech.id !== id));
      message.success('Xóa kỹ thuật viên thành công');
    } catch (error) {
      console.error('Error deleting lab technician:', error);
      message.error('Không thể xóa kỹ thuật viên');
    }
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalVisible(false);
    fetchLabTechnicians();
    message.success('Cập nhật thông tin kỹ thuật viên thành công');
  };

  const filteredLabTechnicians = searchText
    ? labTechnicians.filter(
        (tech) =>
          tech.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          tech.email.toLowerCase().includes(searchText.toLowerCase()) ||
          tech.department.toLowerCase().includes(searchText.toLowerCase()) ||
          tech.position.toLowerCase().includes(searchText.toLowerCase())
      )
    : labTechnicians;

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'Xét nghiệm', value: 'Xét nghiệm' },
        { text: 'Chẩn đoán hình ảnh', value: 'Chẩn đoán hình ảnh' },
        { text: 'Hóa sinh', value: 'Hóa sinh' },
        { text: 'Vi sinh', value: 'Vi sinh' },
      ],
      onFilter: (value, record) => record.department === value,
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record)}
            title="Xem chi tiết"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleUpdateLabTechnician(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa kỹ thuật viên này?"
            onConfirm={() => handleDeleteLabTechnician(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="lab-technician-management">
      <div className="lab-technician-management-header">
        <h1 className="lab-technician-list-title">Danh sách kỹ thuật viên</h1>
      </div>

      <div className="lab-technician-table">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Tìm kiếm kỹ thuật viên..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => message.info('Chức năng thêm kỹ thuật viên đang được phát triển')}
          >
            Thêm kỹ thuật viên
          </Button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredLabTechnicians}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>

      {selectedLabTechnician && (
        <>
          <UpdateLabTechnicianModal
            visible={isUpdateModalVisible}
            labTechnician={selectedLabTechnician}
            onCancel={() => setIsUpdateModalVisible(false)}
            onSuccess={handleUpdateSuccess}
            updateLabTechnicianProfileAPI={updateLabTechnicianProfileAPI}
          />

          <LabTechnicianProfileDetail
            visible={isProfileModalVisible}
            labTechnician={selectedLabTechnician}
            statistics={statistics}
            loading={false}
            onClose={() => setIsProfileModalVisible(false)}
          />
        </>
      )}
    </div>
  );
};

export default LabTechnicianManagement;
