package com.qrfood.order;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Override
    @EntityGraph(attributePaths = {"session", "items", "items.product"})
    Optional<Order> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"session", "items", "items.product"})
    List<Order> findAll();
}
