package com.qrfood.session;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionRepository extends JpaRepository<DiningSession, Long> {
    @Override
    @EntityGraph(attributePaths = {"table", "orders"})
    Optional<DiningSession> findById(Long id);
}
