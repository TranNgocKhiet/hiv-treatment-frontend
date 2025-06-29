import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import StatusFilter from './StatusFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, ToastContainer, Toast, Form, Spinner, Alert } from 'react-bootstrap';
import { BsCalendarPlus } from 'react-icons/bs';
import moment from 'moment';
import './CustomButtons.css';
import './Schedule.css';
import { ScheduleStatus } from '../../../types/schedule.types';
import { getAllSchedulesAPI, updateScheduleAPI, deleteScheduleAPI, createScheduleAPI } from '../../../services/api.service';

const ManagerSchedule = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [error, setError] = useState(null);

    // Xóa bất kỳ dữ liệu lịch nào có thể được lưu trong localStorage
    useEffect(() => {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || 
                key.includes('calendar') || key.includes('event') || 
                key.includes('schedule')) {
                console.log('Removing from localStorage in ManagerSchedule:', key);
                localStorage.removeItem(key);
            }
        });
        
        // Xóa bất kỳ dữ liệu nào được lưu trữ trong sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || 
                key.includes('calendar') || key.includes('event') || 
                key.includes('schedule')) {
                console.log('Removing from sessionStorage in ManagerSchedule:', key);
                sessionStorage.removeItem(key);
            }
        });
        
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching schedules from API...');
            const response = await getAllSchedulesAPI();
            console.log('API response for schedules:', response);
            
            // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
            let schedulesData = [];
            
            if (response && response.data) {
                schedulesData = response.data;
            } else if (response && Array.isArray(response)) {
                schedulesData = response;
            } else if (response) {
                schedulesData = response;
            }
            
            // Đảm bảo schedulesData là một mảng
            const schedulesList = Array.isArray(schedulesData) ? schedulesData : [];
            
            console.log('Schedules data after processing:', schedulesList);
            
            if (schedulesList.length > 0) {
                // Đảm bảo tất cả lịch đều có trạng thái là "available" (Làm việc)
                const updatedSchedulesList = schedulesList.map(schedule => ({
                    ...schedule,
                    status: 'available' // Ghi đè trạng thái thành "available"
                }));
                
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedSchedules = updatedSchedulesList
                    .map(formatScheduleFromAPI)
                    .filter(Boolean); // Lọc bỏ các giá trị null
                
                console.log('Formatted schedules:', formattedSchedules);
                setSchedules(formattedSchedules);
                
                if (formattedSchedules.length === 0) {
                    showToast('Không có dữ liệu lịch từ server', 'info');
                }
            } else {
                console.log('No schedule data received');
                setSchedules([]);
                showToast('Không có dữ liệu lịch từ server', 'info');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
            
            // Hiển thị thông tin lỗi chi tiết hơn
            if (error.response) {
                console.error('Error response:', error.response);
                setError(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`);
                showToast(`Lỗi server: ${error.response.status}`, 'danger');
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                showToast('Không thể kết nối đến server', 'danger');
            } else {
                setError(`Lỗi: ${error.message || 'Unknown error'}`);
                showToast('Đã xảy ra lỗi khi tải dữ liệu', 'danger');
            }
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
        }
    };

    const handleAddClick = (date) => {
        // Kiểm tra xem ngày được chọn có phải là ngày quá khứ không
        if (moment(date).isBefore(moment(), 'day')) {
            showToast('Không thể đặt lịch cho ngày đã qua!', 'danger');
            return;
        }
        
        setSelectedDate(date);
        setShowForm(true);
    };

    const handleScheduleSelect = (schedule) => {
        console.log('Selected schedule:', schedule);
        setSelectedSchedule(schedule);
        setShowDetail(true);
    };

    const handleScheduleCreated = async (newSchedule) => {
        try {
            // Chuẩn bị dữ liệu để gửi đến API
            let scheduleData;
            
            if (Array.isArray(newSchedule)) {
                // Nếu là mảng lịch (lặp lại hàng tuần)
                const allScheduleSlots = [];
                
                // Tạo các slot cho mỗi lịch trong mảng
                for (const schedule of newSchedule) {
                    const scheduleSlots = prepareScheduleData(schedule);
                    if (scheduleSlots) {
                        allScheduleSlots.push(...scheduleSlots);
                    }
                }
                
                scheduleData = allScheduleSlots;
            } else {
                // Nếu là một lịch đơn
                scheduleData = prepareScheduleData(newSchedule);
                if (!scheduleData) {
                    showToast('Không thể tạo lịch: Không có slot nào được chọn', 'warning');
                    return;
                }
            }
            
            console.log('Prepared schedule data:', scheduleData);
            
            // Gửi request tạo lịch
            const responses = [];
            const createdSchedules = [];
            
            // Nếu có nhiều lịch, gửi từng request một
            if (Array.isArray(scheduleData)) {
                for (const schedule of scheduleData) {
                    try {
                        const response = await createScheduleAPI(schedule);
                        console.log('Schedule creation response:', response);
                        
                        if (response && response.data) {
                            responses.push(response);
                            
                            // Tạo đối tượng lịch từ response để hiển thị trên UI
                            const formattedSchedule = {
                                id: response.data.id || `new-${Date.now()}`,
                                title: `${schedule.doctorId} - ${schedule.slot}`,
                                date: schedule.date,
                                doctorId: schedule.doctorId,
                                doctorName: 'Bác sĩ', // Sẽ cập nhật sau khi refresh
                                status: 'Đang hoạt động',
                                slot: schedule.slot
                            };
                            
                            createdSchedules.push(formattedSchedule);
                        }
                    } catch (err) {
                        console.error('Error creating schedule:', err);
                        showToast(`Lỗi khi tạo lịch: ${err.message}`, 'danger');
                    }
                }
                
                if (createdSchedules.length > 0) {
                    setSchedules(prevSchedules => [...prevSchedules, ...createdSchedules]);
                    showToast(`Đã tạo ${createdSchedules.length} lịch làm việc`, 'success');
                    
                    // Làm mới dữ liệu từ server
                    fetchSchedules();
                } else {
                    showToast('Không thể tạo lịch, vui lòng thử lại sau', 'warning');
                }
            }
        } catch (error) {
            console.error('Error in handleScheduleCreated:', error);
            showToast(`Lỗi: ${error.message}`, 'danger');
        }
    };

    // Hàm chuẩn bị dữ liệu lịch để gửi đến API
    const prepareScheduleData = (schedule) => {
        // Chuyển đổi từ dữ liệu form sang định dạng API
        // Chuyển đổi morning/afternoon thành các slot cụ thể
        let slots = [];
        
        if (schedule.morning) {
            slots.push('08:00:00'); // Slot buổi sáng
        }
        
        if (schedule.afternoon) {
            slots.push('14:00:00'); // Slot buổi chiều
        }
        
        // Nếu không có slot nào được chọn, trả về null
        if (slots.length === 0) {
            return null;
        }
        
        // Tạo một mảng các lịch với các slot khác nhau
        return slots.map(slot => ({
            type: 'Khám', // Mặc định là khám
            roomCode: Math.floor(Math.random() * 5 + 1) * 100 + Math.floor(Math.random() * 10), // Tạo mã phòng ngẫu nhiên (100-599)
            date: schedule.date, // Giữ nguyên định dạng YYYY-MM-DD
            slot: slot,
            doctorId: parseInt(schedule.doctorId)
        }));
    };

    // Hàm định dạng dữ liệu lịch từ API để hiển thị trên UI
    const formatScheduleFromAPI = (schedule) => {
        if (!schedule || !schedule.id) {
            console.warn('Invalid schedule data:', schedule);
            return null;
        }
        
        try {
            // Lấy thông tin từ đối tượng schedule
            const id = schedule.id;
            const date = schedule.date;
            const slot = schedule.slot;
            const doctorId = schedule.doctorId || schedule.doctor_id || (schedule.doctor && schedule.doctor.id);
            const doctorName = schedule.doctorName || (schedule.doctor && schedule.doctor.fullName) || 'Bác sĩ';
            const status = 'Đang hoạt động'; // Luôn đặt trạng thái là "Đang hoạt động"
            const type = schedule.type || 'Khám';
            const roomCode = schedule.roomCode || schedule.room_code || '100';
            
            // Xác định buổi dựa trên slot
            const isMorning = slot && slot.startsWith('08:');
            const isAfternoon = slot && slot.startsWith('14:');
            
            return {
                id: id,
                title: `${doctorName} - Làm việc`, // Luôn hiển thị "Làm việc"
                date: date,
                doctorId: doctorId,
                doctorName: doctorName,
                status: status,
                type: type,
                roomCode: roomCode,
                slot: slot,
                morning: isMorning,
                afternoon: isAfternoon
            };
        } catch (error) {
            console.error('Error formatting schedule:', error, schedule);
            return null;
        }
    };

    const handleScheduleUpdate = async (updatedSchedule) => {
        try {
            // Chuẩn bị dữ liệu để gửi đến API
            const scheduleData = prepareScheduleData(updatedSchedule);
            
            // Gọi API để cập nhật lịch
            console.log('Updating schedule:', updatedSchedule);
            const response = await updateScheduleAPI(updatedSchedule.id, scheduleData);
            console.log('Schedule update response:', response);
            
            if (response && response.data) {
                console.log('Schedule updated successfully:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                const formattedUpdatedSchedule = formatScheduleFromAPI(response.data);
                setSchedules(prevSchedules => 
                    prevSchedules.map(schedule => 
                        schedule.id === updatedSchedule.id ? formattedUpdatedSchedule : schedule
                    )
                );
                
                showToast('Cập nhật lịch thành công!', 'success');
            } else {
                console.warn('API returned success but no data');
                showToast('Không thể cập nhật lịch, vui lòng thử lại sau', 'warning');
                
                // Nếu API không trả về dữ liệu, vẫn cập nhật UI với dữ liệu đã nhập
                setSchedules(prevSchedules => 
                    prevSchedules.map(schedule => 
                        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
                    )
                );
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
            
            // Nếu API gặp lỗi, vẫn cập nhật UI với dữ liệu đã nhập
            setSchedules(prevSchedules => 
                prevSchedules.map(schedule => 
            schedule.id === updatedSchedule.id ? updatedSchedule : schedule
                )
            );
        }
    };

    const handleScheduleDelete = async (scheduleId) => {
        try {
            // Gọi API để xóa lịch
            console.log('Deleting schedule with ID:', scheduleId);
            await deleteScheduleAPI(scheduleId);
            
            // Cập nhật state sau khi xóa thành công
            setSchedules(prevSchedules => 
                prevSchedules.filter(schedule => schedule.id !== scheduleId)
            );
            
            showToast('Xóa lịch thành công!', 'success');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
    };

    // Đảm bảo rằng filteredSchedules là một mảng rỗng khi không có dữ liệu từ API
    const filteredSchedules = initialLoadComplete ? schedules.filter(schedule => {
        // Kiểm tra dữ liệu hợp lệ
        if (!schedule || !schedule.id || !schedule.date) {
            console.warn('Invalid schedule data:', schedule);
            return false;
        }
        
        let match = true;
        
        // Lọc theo bác sĩ
        if (selectedDoctor) {
            match = match && schedule.doctorId?.toString() === selectedDoctor.toString();
        }
        
        // Lọc theo trạng thái
        if (selectedStatus) {
            match = match && schedule.status === selectedStatus;
        }
        
        return match;
    }) : [];

    console.log('Filtered schedules to pass to Calendar:', filteredSchedules);

    // Hàm hiển thị Toast
    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const handleRefreshData = () => {
        // Xóa tất cả dữ liệu trong localStorage và sessionStorage liên quan đến calendar
        try {
            const localStorageKeys = Object.keys(localStorage);
            localStorageKeys.forEach(key => {
                if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                    key.includes('event') || key.includes('schedule')) {
                    console.log('Removing from localStorage:', key);
                    localStorage.removeItem(key);
                }
            });
            
            const sessionStorageKeys = Object.keys(sessionStorage);
            sessionStorageKeys.forEach(key => {
                if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                    key.includes('event') || key.includes('schedule')) {
                    console.log('Removing from sessionStorage:', key);
                    sessionStorage.removeItem(key);
                }
            });
            
            // Xóa các key cụ thể
            localStorage.removeItem('fc-event-sources');
            localStorage.removeItem('fc-view-state');
            sessionStorage.removeItem('fc-event-sources');
            sessionStorage.removeItem('fc-view-state');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
        
        // Reset state
        setSchedules([]);
        setSelectedSchedule(null);
        setSelectedDate(null);
        setShowDetail(false);
        setShowForm(false);
        setLoading(true);
        setError(null);
        
        // Đặt một flag để tránh vòng lặp cập nhật vô hạn
        const refreshTimestamp = Date.now();
        sessionStorage.setItem('last_refresh_timestamp', refreshTimestamp.toString());
        
        // Sử dụng setTimeout để tránh vòng lặp cập nhật
        setTimeout(() => {
            fetchSchedules();
        }, 100);
        
        showToast('Đã làm mới dữ liệu', 'success');
    };

    return (
        <div className="container-fluid py-4">
            <div className="schedule-header">
                <h1 className="schedule-title text-center">Quản lý lịch làm việc bác sĩ</h1>
            </div>

            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
                <Toast 
                    onClose={() => setToast({...toast, show: false})} 
                    show={toast.show} 
                    delay={3000} 
                    autohide 
                    bg={toast.type}
                >
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body className={toast.type === 'danger' ? 'text-white' : 'text-white'}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Row className="mb-4 filter-row">
                <Col md={4} className="filter-col">
                    <DoctorFilter 
                        onDoctorSelect={setSelectedDoctor} 
                        selectedDoctor={selectedDoctor} 
                    />
                </Col>
                <Col md={4} className="filter-col">
                    <StatusFilter 
                        onStatusSelect={setSelectedStatus} 
                        selectedStatus={selectedStatus} 
                    />
                </Col>
                <Col md={4} className="filter-col text-end">
                    <div className="button-container">
                        <button 
                            className="add-schedule-button"
                            onClick={() => handleAddClick(new Date())}
                            disabled={loading}
                        >
                            <BsCalendarPlus className="me-2" />
                            Thêm lịch mới
                        </button>
                        <button 
                            className="refresh-button ms-2"
                            onClick={handleRefreshData}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Đang tải...
                                </>
                            ) : (
                                'Làm mới dữ liệu'
                            )}
                        </button>
                    </div>
                </Col>
            </Row>

            <div className="calendar-wrapper">
                {loading && !initialLoadComplete ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" />
                        <p className="mt-3">Đang tải dữ liệu lịch...</p>
                    </div>
                ) : (
            <Calendar 
                events={filteredSchedules}
                onDateSelect={handleAddClick}
                onEventSelect={handleScheduleSelect}
            />
                )}
            </div>

            <ScheduleForm 
                show={showForm}
                onHide={() => setShowForm(false)}
                selectedDate={selectedDate}
                selectedDoctor={selectedDoctor}
                onScheduleCreated={handleScheduleCreated}
                existingSchedules={schedules}
                onShowToast={showToast}
            />

            <ScheduleDetail 
                show={showDetail}
                onHide={() => setShowDetail(false)}
                schedule={selectedSchedule}
                onUpdate={handleScheduleUpdate}
                onDelete={handleScheduleDelete}
                onShowToast={showToast}
            />
        </div>
    );
};

export default ManagerSchedule;
