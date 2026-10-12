CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reference_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_payments_session UNIQUE (session_id),
    CONSTRAINT uq_payments_reference UNIQUE (reference_code),
    CONSTRAINT fk_payments_session FOREIGN KEY (session_id) REFERENCES dining_sessions (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_payments_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_payments_method CHECK (method IN ('CASH', 'QR')),
    CONSTRAINT ck_payments_status CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    CONSTRAINT ck_payments_paid_time CHECK (
        (status = 'PAID' AND paid_at IS NOT NULL)
        OR (status <> 'PAID' AND paid_at IS NULL)
    )
);

CREATE INDEX idx_payments_status_created_at ON payments (status, created_at);
