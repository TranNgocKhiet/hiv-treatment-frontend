import React, { useState, useEffect } from 'react';
import './DoctorList.css';

// Dùng ảnh từ thư mục public
import defaultDoctorImage from '../../assets/doctor.png';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    //fetch('/api/doctors')// có data thì gỡ cmt dòng này
    // Lấy dữ liệu giả từ public/api/doctors.json
    fetch('/api/doctors.json')
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error('Lỗi khi tải danh sách bác sĩ:', error));
  }, []);

  const visibleDoctors = showAll ? doctors : doctors.slice(0, 4);

  return (
    <section className="doctor-section">
      <h2 className="title">
        Đội ngũ <span className="highlight">bác sĩ chuyên khoa</span>
      </h2>
      <p className="subtitle">
        Các bác sĩ của chúng tôi đều là những chuyên gia hàng đầu trong lĩnh vực điều trị HIV với nhiều năm kinh nghiệm và được đào tạo bài bản quốc tế.
      </p>

      <div className="doctor-grid">
        {visibleDoctors.map((doctor) => (
          <div className="doctor-card" key={doctor.id}>
            <img
              src={doctor.image || defaultDoctorImage}
              alt={`Ảnh bác sĩ ${doctor.name}`}
              className="doctor-avatar"
              onError={(e) => (e.target.src = defaultDoctorImage)}
            />
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              
              <p>🕒 {doctor.experience} năm kinh nghiệm</p>
              <p>{doctor.qualifications}</p>
             
              <button className="btn-primary">Đặt lịch</button>
            </div>
          </div>
        ))}
      </div>

      {doctors.length > 4 && (
        <div className="view-all-container">
          <button
            className="btn-outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Thu gọn danh sách' : 'Xem tất cả bác sĩ'}
          </button>
        </div>
      )}
    </section>
  );
}

export default DoctorList;
