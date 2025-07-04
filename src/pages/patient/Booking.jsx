import { useContext, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Typography, Col, Row, Layout, theme, message, Descriptions } from 'antd';
import { ArrowLeftOutlined, SoundTwoTone } from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, createHealthRecordAPI, fetchAllDoctorsAPI, fetchAllScheduleAPI, fetchAvailableSlotAPI, fetchDoctorProfileAPI, fetchScheduleByDateAPI, initiatePaymentAPI, registerScheduleAPI } from '../../services/api.service';
import { AuthContext } from '../../components/context/AuthContext';


const { Link } = Typography;
const { Option } = Select;
const { Content } = Layout;
const dateFormat = 'DD-MM-YYYY';

const Booking = () => {
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext)
    const [availableTimes, setAvailableTimes] = useState(generateTimeSlots());
    const [doctors, setDoctors] = useState([])
    const [availableSlots, setAvailableSlots] = useState([])
    const [scheduleId, setScheduleId] = useState()
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [selectedAmount, setSelectedAmount] = useState();
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const doctorId = Form.useWatch('doctor', form)
    const date = Form.useWatch('date', form)
    const slot = Form.useWatch('slot', form);
    const type = Form.useWatch('type', form);

    const typeMapping = {
        APPOINTMENT: 'Đặt khám',
        FOLLOW_UP: 'Tái khám',
        CONSULTATION: 'Tư vấn',
    };

    const navigate = useNavigate();

    useEffect(() => {
        loadDoctors()
    }, [])

    useEffect(() => {
        loadAvailableSlots()
        loadSchedule()
    }, [doctorId])

    useEffect(() => {
        if (slot) {
            const schedule = availableSchedules.find(s => s.slot === slot);
            setSelectedSchedule(schedule);
        } else {
            setSelectedSchedule(null);
        }
        // Gán amount dựa trên type từ form
        if (type) {
            let amount;
            switch (type) {
                case 'Đặt khám':
                    amount = 200000;
                    break;
                case 'Tái khám':
                    amount = 150000;
                    break;
                case 'Tư vấn':
                    amount = 100000;
                    break;
                default:
                    amount = 0;
            }
            setSelectedAmount(amount);
        } else {
            setSelectedAmount(null);
        }
    }, [slot, type, availableSchedules]);

    const handleDateChange = async (date) => {
        if (!date) {
            setAvailableSchedules([]);
            form.setFieldsValue({ slot: undefined });
            return;
        }
        const response = await fetchScheduleByDateAPI(date.format("YYYY-MM-DD"))
        if (response.data) {
            setAvailableSchedules(response.data)
        }
    }


    const onFinish = async (values) => {
        try {
            const selectedSchedules = availableSchedules.filter(schedule => schedule.slot === values.slot);
            console.log("selected schedule", selectedSchedules)
            if (selectedSchedules.length === 0) {
                throw new Error('Lịch hẹn không hợp lệ');
            }


            if (values.doctorId) {
                const selectedSchedule = selectedSchedules.find(schedule => schedule.doctorId === values.doctorId);
                console.log("check selected schedule", selectedSchedule)
                if (!selectedSchedule) {
                    throw new Error('Bác sĩ không có lịch hẹn cho slot này');
                }
                setScheduleId(selectedSchedule.id)
            } else {
                setScheduleId(selectedSchedules[0].id)
            }

            const schedule = selectedSchedules.find(s => s.slot === values.slot);
            if (!schedule) {
                throw new Error('Lịch không khả dụng');
            }


            const registerResponse = await registerScheduleAPI({
                scheduleId: schedule.id,
                patientId: user.id,
                type: type
            });

            const createHealthRecordResponse = await createHealthRecordAPI(schedule.id)


            const paymentResponse = await initiatePaymentAPI({
                scheduleId: schedule.id,
                amount: selectedAmount,
            });
            window.location.href = paymentResponse.data;
            // console.log("Check payment", paymentResponse.data)
            // console.log("schedule id", schedule.id)
        } catch (error) {
            message.error(error.message);
        }
    };

    const loadDoctors = async () => {
        const response = await fetchAllDoctorsAPI()
        console.log(response.data)
        if (response.data) {
            setDoctors(response.data)
        }


    }

    const loadAvailableSlots = async () => {
        const response = await fetchAvailableSlotAPI(doctorId, date.format('YYYY-MM-DD'))
        if (response.data) {
            setAvailableSlots(response.data)
        } else {
            setAvailableSlots([])
        }
    }

    const loadSchedule = async () => {
        const response = await fetchAllScheduleAPI(doctorId, date)
        if (response.data) {
            setAvailableSchedules(response.data);
        }
    }


    const disabledDate = (current) => {
        const isBeforeToday = current && current < moment().startOf('day');

        const isSunday = current && current.day() === 0;

        return isBeforeToday || isSunday;
    };
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    function generateTimeSlots() {
        const times = [];
        const startHour = 8;
        const endHour = 17;
        for (let hour = startHour; hour < endHour; hour++) {
            times.push(moment(`${hour}:00`, 'HH:mm'));
            times.push(moment(`${hour}:30`, 'HH:mm'));
        }
        return times;
    }

    return (
        <Layout>

            <Content style={{ padding: '15px' }}>
                <div style={{
                    background: colorBgContainer,
                    padding: 15,
                    borderRadius: borderRadiusLG,
                }}>
                    <Row justify="center">
                        <Col span={16} style={{ background: 'white', borderRadius: '10px', margin: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <Link href="/"><ArrowLeftOutlined style={{ margin: '15px' }} /> Về trang chủ</Link>
                            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                                <h1>Đặt lịch khám</h1>
                                <p>Vui lòng điền thông tin dưới đây để đặt lịch khám với bác sĩ chuyên khoa HIV</p>
                                <Form form={form} layout="vertical" onFinish={onFinish}>



                                    <Form.Item name="type" label="Loại dịch vụ" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}>
                                        <Select placeholder="Chọn loại dịch vụ">
                                            <Select.Option value="Đặt khám">Đặt khám</Select.Option>
                                            <Select.Option value="Tái khám">Tái khám</Select.Option>
                                            <Select.Option value="Tư vấn">Tư vấn</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="doctor"
                                        label="Bác sĩ"
                                    >
                                        <Select placeholder="Chọn bác sĩ" allowClear filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }>
                                            {doctors.map(doctor => (
                                                <Option key={doctor.id} value={doctor.id}>
                                                    {doctor.fullName}
                                                </Option>
                                            ))}
                                            {/* <Option value="doctor1">Bác sĩ 1</Option>
                                            <Option value="doctor2">Bác sĩ 2</Option> */}
                                        </Select>
                                    </Form.Item>
                                    <Row gutter={8} >
                                        <Col span={12}>
                                            <Form.Item
                                                name="date"
                                                label="Ngày khám"
                                                rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}

                                            >

                                                <DatePicker disabledDate={disabledDate} format={dateFormat} style={{ width: '100%' }} onChange={handleDateChange} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="slot" label="Khung giờ" rules={[{ required: true }]}>
                                                <Select placeholder="Chọn khung giờ" disabled={!availableSchedules.length}>
                                                    {availableSchedules.map(schedule => (
                                                        <Select.Option key={schedule.id} value={schedule.slot}>{schedule.slot}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {selectedSchedule && (
                                        <Descriptions bordered>
                                            <Descriptions.Item label="Loại lịch hẹn">{type}</Descriptions.Item>
                                            <Descriptions.Item label="Giá tiền">{selectedAmount ? selectedAmount.toLocaleString('vi-VN') : '0'} VND</Descriptions.Item>
                                        </Descriptions>
                                    )}
                                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="primary" htmlType="submit">
                                            Xác nhận đặt lịch
                                        </Button>
                                    </Form.Item>
                                </Form>

                            </div>
                        </Col>
                        <Col span={4} style={{ margin: '20px' }}>
                            <div style={{ marginTop: 20 }}>
                                <h2>Thông tin hỗ trợ</h2>
                                <p><strong>Giờ làm việc:</strong> Thứ Hai - Thứ Sáu: 8:00 - 16:30</p>
                                <p><strong>Liên hệ hỗ trợ:</strong></p>
                                <p>Hotline: 1900 1234</p>
                                <p>Email: support@hivcarecenter.vn</p>
                                <h3>Lưu ý</h3>
                                <ul>
                                    <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                                    <li>Mang theo giấy tờ tùy thân và thẻ BHYT (nếu có)</li>
                                    <li>Cập nhật thông tin sức khỏe gần nhất</li>
                                </ul>
                            </div>
                        </Col>
                    </Row>

                </div>

            </Content>

        </Layout>

    );
};

export default Booking;
