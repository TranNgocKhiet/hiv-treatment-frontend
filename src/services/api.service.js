import axios from './axios.customize'

const loginAPI = (username, password) => {
    const URL_BACKEND = '/api/auth/login'
    const data = {
        username: username,
        password: password,
    }
    return axios.post(URL_BACKEND, data)
}

const registerAPI = (values) => {
    const URL_BACKEND = '/api/auth/register'
    const data = {
        fullName: values.fullname,
        gender: values.gender,
        dateOfBirth: values.dob.format('DD-MM-YYYY'),
        email: values.email,
        phone: values.phone,
        address: values.address,
        username: values.username,
        password: values.password
    }
    return axios.post(URL_BACKEND, data)
}

const bookingAPI = (values) => {
    const URL_BACKEND = `/api/schedule/`
    const data = {
        name: values.name,
        phone: values.phone,
        service: values.type,
        doctor: values.doctor,
        date: values.date.format('DD-MM-YYYY'),
        slot: values.time,
    }
    return axios.post(URL_BACKEND, data)
}

const fetchAllScheduleAPI = (doctorId, date) => {
    const URL_BACKEND = '/api/schedule'
    return axios.get(URL_BACKEND, {
        params: {
            doctorId,
            date: date.format('YYYY-MM-DD'),
            status: 'ACTIVE',
        },
    })
}

const registerScheduleAPI = (registerData) => {
    const URL_BACKEND = `/api/schedule/register/schedule-id/${registerData.scheduleId}?patientId=${registerData.patientId}&type=${registerData.type}`
    return axios.put(URL_BACKEND)
}

const initiatePaymentAPI = (params) => {
    const URL_BACKEND = '/api/payment'
    return axios.post(URL_BACKEND, params)
}

const createAccountAPI = (username, password, email, role) => {
    const URL_BACKEND = '/api/user/create'
    const data = {
        username,
        password,
        email,
        role
    }
    return axios.post(URL_BACKEND, data)
}

const handlePaymentCallbackAPI = (params) => {
    const URL_BACKEND = '/api/payment/callback'
    return axios.get(URL_BACKEND, { params })
}

const fetchAllPatientScheduleAPI = (id) => {
    const URL_BACKEND = `/api/schedule/patient-id/${id}`
    return axios.get(URL_BACKEND)
}

const fetchAccountByRoleAPI = (role) => {
    const URL_BACKEND = `/api/user/${role}`
    return axios.get(URL_BACKEND)
}

const updateAccountAPI = (id, username, email) => {
    const URL_BACKEND = `/api/user/${id}`
    const data = {
        username,
        email
    }

    return axios.put(URL_BACKEND, data)
}

const deleteAccountAPI = (id) => {
    const URL_BACKEND = `/api/user/${id}`
    return axios.delete(URL_BACKEND)
}

const fetchDoctorProfileAPI = () => {
    const URL_BACKEND = '/api/doctor-profile'
    return axios.get(URL_BACKEND)
}

const fetchScheduleAPI = () => {
    const URL_BACKEND = '/api/schedule/list'
    return axios.get(URL_BACKEND)
}

const fetchAvailableSlotAPI = (doctorId, date) => {
    const URL_BACKEND = `/api/schedule/available-slots?doctorId=${doctorId}&date=${date}`
    return axios.get(URL_BACKEND)
}

const fetchAccountAPI = () => {
    const URL_BACKEND = '/api/auth/account'
    return axios.get(URL_BACKEND)
}

const logoutAPI = () => {
    const URL_BACKEND = '/api/auth/logout'
    return axios.post(URL_BACKEND)
}

const fetchAllDoctorsAPI = () => {
    const URL_BACKEND = '/api/doctors'
    return axios.get(URL_BACKEND)
}

// Lấy thông tin chi tiết của một bác sĩ
const fetchDoctorByIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/doctors/${doctorId}`;
    return axios.get(URL_BACKEND);
}

// Cập nhật thông tin bác sĩ
const updateDoctorProfileAPI = (doctorId, profileData) => {
    const URL_BACKEND = `/api/doctors/${doctorId}`;
    return axios.put(URL_BACKEND, profileData);
}

// Lấy thống kê công việc của bác sĩ
const fetchDoctorStatisticsAPI = (doctorId) => {
    const URL_BACKEND = `/api/doctors/${doctorId}/statistics`;
    return axios.get(URL_BACKEND);
}

const fetchAllDocumentsAPI = () => {
    const URL_BACKEND = '/api/document'
    return axios.get(URL_BACKEND)
}

const fetchUsersAPI = () => {
    const URL_BACKEND = '/api/user/patient'
    return axios.get(URL_BACKEND)
}

const fetchHealthRecordByScheduleIdAPI = (scheduleId) => {
    const URL_BACKEND = `/api/health-record/schedule-id/${scheduleId}`
    return axios.get(URL_BACKEND)
}

const fetchTestResultByHealthRecordIdAPI = (healthRecordId) => {
    const URL_BACKEND = `/api/test-result/health-record-id/${healthRecordId}`
    return axios.get(URL_BACKEND)
}

const updateHealthRecordAPI = (healthRecordId, healthRecordData) => {
    const URL_BACKEND = `/api/health-record/${healthRecordId}`
    return axios.put(URL_BACKEND, healthRecordData)
}

const deleteTestResultAPI = (testResultId) => {
    const URL_BACKEND = `/api/test-result/${testResultId}`
    return axios.delete(URL_BACKEND)
}

const createTestResultAPI = (type, note, expectedResultTime, healthRecordId) => {
    const testResultData = {
        type,
        note,
        expectedResultTime,
        healthRecordId,
    }
    const URL_BACKEND = 'api/test-result'
    return axios.post(URL_BACKEND, testResultData)
}

const updateTestResultAPI = (testResultId, type, result, unit, note, expectedResultTime, actualResultTime) => {
    const testResultData = {
        type, 
        result, 
        unit, 
        note, 
        expectedResultTime, 
        actualResultTime
    }
    const URL_BACKEND = `api/test-result/${testResultId}`
    return axios.put(URL_BACKEND, testResultData)
}

const fetchScheduleByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/schedule/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

const fetchRegimensByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/regimen/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

const fetchAllRegimensAPI = () => {
    const URL_BACKEND = '/api/regimen'
    return axios.get(URL_BACKEND)
}
export {
    loginAPI,
    registerAPI,
    bookingAPI,
    createAccountAPI,
    fetchAccountByRoleAPI,
    deleteAccountAPI,
    updateAccountAPI,
    fetchDoctorProfileAPI,
    fetchScheduleAPI,
    fetchAccountAPI,
    fetchAllPatientScheduleAPI,
    fetchAvailableSlotAPI,
    fetchAllScheduleAPI,
    initiatePaymentAPI,
    registerScheduleAPI,
    handlePaymentCallbackAPI,
    logoutAPI,

    fetchAllDoctorsAPI,
    fetchDoctorByIdAPI,
    updateDoctorProfileAPI,
    fetchDoctorStatisticsAPI,
    fetchAllDocumentsAPI,
    fetchUsersAPI,
    fetchHealthRecordByScheduleIdAPI,
    fetchTestResultByHealthRecordIdAPI,
    updateHealthRecordAPI,
    deleteTestResultAPI,
    createTestResultAPI,
    updateTestResultAPI,

    fetchScheduleByDoctorIdAPI,
    fetchRegimensByDoctorIdAPI,
    fetchAllRegimensAPI
}