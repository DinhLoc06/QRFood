package com.qrfood.payment;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @EntityGraph(attributePaths = {"session", "session.table"})
    Optional<Payment> findBySessionId(Long sessionId);

    @Override
    @EntityGraph(attributePaths = {"session", "session.table"})
    List<Payment> findAll();

    @Override
    @EntityGraph(attributePaths = {"session", "session.table"})
    Optional<Payment> findById(Long id);
}
