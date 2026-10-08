package com.mantech.app.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Plan de Mantenimiento Preventivo: define cada cuánto se debe hacer un
 * mantenimiento sobre una máquina. Al "generar" se materializan en órdenes
 * de trabajo preventivas programadas (que alimentan la agenda y los KPIs).
 */
@Entity
@Table(name = "preventive_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreventivePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    // DIAS, SEMANAS, MESES
    @Column(name = "frequency_type", nullable = false)
    private String frequencyType;

    // cada cuántas unidades (p.ej. MESES + 1 = mensual)
    @Column(name = "frequency_value", nullable = false)
    private int frequencyValue;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    // Próxima fecha en la que toca este preventivo.
    @Column(name = "next_due_at", nullable = false)
    private LocalDateTime nextDueAt;

    @Column(name = "last_generated_at")
    private LocalDateTime lastGeneratedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** Avanza una fecha según la frecuencia del plan. */
    public LocalDateTime advance(LocalDateTime from) {
        return switch (frequencyType.toUpperCase()) {
            case "DIAS" -> from.plusDays(frequencyValue);
            case "SEMANAS" -> from.plusWeeks(frequencyValue);
            case "MESES" -> from.plusMonths(frequencyValue);
            default -> from.plusDays(frequencyValue);
        };
    }
}
