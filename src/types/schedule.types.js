// Schedule Types
export const ScheduleType = {
    EXAMINATION: 'EXAMINATION',     // Khám thông thường
    EMERGENCY: 'EMERGENCY',         // Khám khẩn cấp
    FOLLOW_UP: 'FOLLOW_UP',        // Tái khám
    CONSULTATION: 'CONSULTATION'    // Tư vấn
};

// Schedule Status
export const ScheduleStatus = {
    PENDING: 'PENDING',         // Chờ xác nhận
    CONFIRMED: 'CONFIRMED',     // Đã xác nhận
    CANCELLED: 'CANCELLED',     // Đã hủy
    COMPLETED: 'COMPLETED',     // Đã hoàn thành
    NO_SHOW: 'NO_SHOW',         // Không đến khám
    
    // Trạng thái làm việc của bác sĩ
    AVAILABLE: 'available',     // Làm việc
    UNAVAILABLE: 'UNAVAILABLE'  // Không làm việc
};

// Mapping giữa Status FE và BE
export const StatusMapping = {
    // FE -> BE
    'available': 'Trống',
    'UNAVAILABLE': 'Đã hủy',
    'active': 'Đang hoạt động',
    
    // BE -> FE
    'Trống': 'available',
    'Đã hủy': 'cancelled',
    'Đang hoạt động': 'active',
    'Đang chờ': 'booked',
    'Đang chờ thanh toán': 'pending_payment',
    'Đã thanh toán': 'confirmed',
    'Hoàn thành': 'completed'
};

// Time slots for schedule - 15 slots chính xác từ BE
export const SlotTimes = [
    { value: '08:00:00', label: '08:00' },
    { value: '08:30:00', label: '08:30' },
    { value: '09:00:00', label: '09:00' },
    { value: '09:30:00', label: '09:30' },
    { value: '10:00:00', label: '10:00' },
    { value: '10:30:00', label: '10:30' },
    { value: '11:00:00', label: '11:00' },
    { value: '13:00:00', label: '13:00' },
    { value: '13:30:00', label: '13:30' },
    { value: '14:00:00', label: '14:00' },
    { value: '14:30:00', label: '14:30' },
    { value: '15:00:00', label: '15:00' },
    { value: '15:30:00', label: '15:30' },
    { value: '16:00:00', label: '16:00' },
    { value: '16:30:00', label: '16:30' }
];
