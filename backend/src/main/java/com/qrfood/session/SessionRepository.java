package com.qrfood.session;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<DiningSession, Long> {
}
