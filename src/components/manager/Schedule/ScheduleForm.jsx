import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import './ScheduleForm.css';
import moment from 'moment';
import { fetchAllDoctorsAPI } from '../../../services/api.service';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated, existingSchedules, onShowToast }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        doctorId: '',
        doctorName: '',
        date: moment(selectedDate).format('YYYY-MM-DD'),
        status: ScheduleStatus.AVAILABLE,
        morning: true,
        afternoon: true,
        note: '',
        repeatWeekly: false,
        repeatCount: 1,
        roomCode: '100',
        type: 'Khám'
    });

    useEffect(() => {
        if (show) {
            fetchDoctors();
            resetForm();
        }
    }, [show, selectedDate, selectedDoctor]);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('ScheduleForm: Fetching doctors from API...');
            const response = await fetchAllDoctorsAPI();
            console.log('ScheduleForm: API response for doctors:', response);
            
            // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
            let doctorsData = [];
            
            if (response && response.data) {
                doctorsData = response.data;
            } else if (response && Array.isArray(response)) {
                doctorsData = response;
            } else if (response) {
                doctorsData = response;
            }
            
            // Đảm bảo doctorsData là một mảng
            const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
            
            console.log('ScheduleForm: Doctors data after processing:', doctorsList);
            
            if (doctorsList.length > 0) {
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedDoctors = doctorsList.map(doctor => {
                    // Log để kiểm tra cấu trúc dữ liệu
                    console.log('ScheduleForm: Doctor data structure:', doctor);
                    
                    // Xử lý các trường hợp khác nhau của cấu trúc dữ liệu
                    const id = doctor.id || doctor.userId || doctor.user_id;
                    const name = doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${id}`;
                    
                    return {
                        id: id,
                        name: name
                    };
                });
                
                console.log('ScheduleForm: Formatted doctors:', formattedDoctors);
                setDoctors(formattedDoctors);
                
                // Nếu có selectedDoctor, tự động chọn bác sĩ đó
                if (selectedDoctor) {
                    const doctor = formattedDoctors.find(d => d.id.toString() === selectedDoctor.toString());
                    if (doctor) {
                        setFormData(prev => ({
                            ...prev,
                            doctorId: doctor.id,
                            doctorName: doctor.name
                        }));
                    }
                }
            } else {
                console.log('ScheduleForm: No doctor data received');
                setDoctors([]);
                setError('Không có dữ liệu bác sĩ');
            }
        } catch (error) {
            console.error('ScheduleForm: Error fetching doctors:', error);
            setDoctors([]);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            doctorId: selectedDoctor || '',
            doctorName: '',
            date: moment(selectedDate).format('YYYY-MM-DD'),
            status: 'Đang hoạt động',
            morning: true,
            afternoon: true,
            note: '',
            repeatWeekly: false,
            repeatCount: 1,
            roomCode: '100',
            type: 'Khám'
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Nếu thay đổi bác sĩ, cập nhật doctorName
        if (name === 'doctorId') {
            const selectedDoc = doctors.find(doc => doc.id.toString() === value.toString());
            if (selectedDoc) {
                setFormData(prev => ({
                    ...prev,
                    doctorId: value,
                    doctorName: selectedDoc.name
                }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.doctorId) {
            onShowToast('Vui lòng chọn bác sĩ', 'danger');
            return;
        }
        
        if (!formData.morning && !formData.afternoon) {
            onShowToast('Vui lòng chọn ít nhất một buổi làm việc', 'danger');
            return;
        }
        
        // Kiểm tra ngày
        if (!formData.date) {
            onShowToast('Vui lòng chọn ngày', 'danger');
            return;
        }

        // Kiểm tra ngày có phải là quá khứ không
        if (moment(formData.date).isBefore(moment(), 'day')) {
            onShowToast('Không thể đặt lịch cho ngày đã qua!', 'danger');
            return;
        }

        // Kiểm tra trùng lịch
        const conflictingSchedules = existingSchedules.filter(schedule => 
            schedule.date === formData.date && 
            schedule.doctorId.toString() === formData.doctorId.toString()
        );

        if (conflictingSchedules.length > 0) {
            onShowToast('Bác sĩ đã có lịch vào ngày này!', 'danger');
            return;
        }

        console.log('Form data before submission:', formData);

        // Tạo lịch mới
        if (formData.repeatWeekly && formData.repeatCount > 1) {
            // Tạo nhiều lịch lặp lại theo tuần
            const schedules = [];
            
            for (let i = 0; i < formData.repeatCount; i++) {
                const newDate = moment(formData.date).add(i * 7, 'days').format('YYYY-MM-DD');
                
                // Kiểm tra xem ngày mới có trùng với lịch hiện có không
                const hasConflict = existingSchedules.some(schedule => 
                    schedule.date === newDate && 
                    schedule.doctorId.toString() === formData.doctorId.toString()
                );
                
                if (!hasConflict) {
                    const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
                    const doctorName = selectedDoc ? selectedDoc.name : '';
                    
                    const newSchedule = {
                        doctorId: formData.doctorId,
                        doctorName: doctorName,
                        date: newDate,
                        status: formData.status,
                        morning: formData.morning,
                        afternoon: formData.afternoon,
                        note: formData.note
                    };
                    
                    schedules.push(newSchedule);
                }
            }
            
            // Thông báo số lịch được tạo
            if (schedules.length > 0) {
                console.log('Creating multiple schedules:', schedules);
                onScheduleCreated(schedules);
            } else {
                onShowToast('Không thể tạo lịch do trùng lặp với lịch hiện có', 'warning');
            }
        } else {
            // Tạo một lịch đơn
            const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
            const doctorName = selectedDoc ? selectedDoc.name : '';
            
            const newSchedule = {
                doctorId: formData.doctorId,
                doctorName: doctorName,
                date: formData.date,
                status: formData.status,
                morning: formData.morning,
                afternoon: formData.afternoon,
                note: formData.note
            };
            
            console.log('Creating single schedule:', newSchedule);
            onScheduleCreated(newSchedule);
        }
        
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Tạo lịch làm việc mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                    <Form.Group className="mb-3">
                                <Form.Label>Bác sĩ</Form.Label>
                                {loading ? (
                                    <div className="d-flex align-items-center">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        <span>Đang tải danh sách bác sĩ...</span>
                                    </div>
                                ) : (
                        <Form.Select
                                        name="doctorId"
                            value={formData.doctorId}
                                        onChange={handleChange}
                                        disabled={loading || doctors.length === 0}
                            required
                        >
                            <option value="">Chọn bác sĩ</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </Form.Select>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={moment().format('YYYY-MM-DD')}
                                    required
                                />
                    </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3 mt-2">
                                <div className="d-flex flex-column">
                                    <Form.Check 
                                        type="checkbox"
                                        name="morning"
                                        label="Buổi sáng (8:00 - 12:00)"
                                        checked={formData.morning}
                                        onChange={handleChange}
                                        className="mb-2"
                                    />
                                    <Form.Check 
                                        type="checkbox"
                                        name="afternoon"
                                        label="Buổi chiều (13:00 - 17:00)"
                                        checked={formData.afternoon}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Ghi chú</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox"
                                    name="repeatWeekly"
                                    label="Lặp lại hàng tuần"
                                    checked={formData.repeatWeekly}
                                    onChange={handleChange}
                        />
                    </Form.Group>
                        </Col>
                        <Col md={6}>
                            {formData.repeatWeekly && (
                        <Form.Group className="mb-3">
                            <Form.Label>Số tuần lặp lại</Form.Label>
                            <Form.Control
                                type="number"
                                        name="repeatCount"
                                value={formData.repeatCount}
                                        onChange={handleChange}
                                        min={1}
                                        max={12}
                            />
                        </Form.Group>
                    )}
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mã phòng</Form.Label>
                        <Form.Control
                            type="text"
                            name="roomCode"
                            value={formData.roomCode}
                            onChange={handleChange}
                            placeholder="Nhập mã phòng (vd: 100, 101, ...)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Loại lịch</Form.Label>
                        <Form.Select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Khám">Khám thông thường</option>
                            <option value="Tái khám">Tái khám</option>
                            <option value="Tư vấn">Tư vấn</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Tạo lịch
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleForm;
