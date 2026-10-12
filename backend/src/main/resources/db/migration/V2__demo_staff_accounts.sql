INSERT INTO users (username, password, full_name, role) VALUES
    ('staff', 'staff123', 'Nhân viên phục vụ', 'STAFF'),
    ('kitchen', 'kitchen123', 'Nhân viên bếp', 'KITCHEN')
ON CONFLICT (username) DO NOTHING;
