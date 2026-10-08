package com.mantech.app.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Orden de Trabajo: núcleo del CMMS.
 *
 * Modela los 5 bloques de la spec:
 *  1. Identificación (id, createdAt, createdByUser)
 *  2. Info del activo (machine -> hereda plant, sector, criticidad)
 *  3. Info operativa (failureType, impact, stoppedProduction)
 *  4. Ejecución (startedAt, finishedAt) -> CRÍTICO para los KPIs (MTTR/MTBF)
 *  5. Cierre (status, resolutionNotes, signature)
 */
@Entity
@Table(name = "work_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id")
    private Plant plant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    // Reporte de origen (cuando la orden nace de un reporte del operario). Opcional.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    // CORRECTIVA, PREVENTIVA
    @Column(nullable = false)
    private String type;

    // ABIERTA, ASIGNADA, EN_PROCESO, PAUSADA, CERRADA, CANCELADA
    @Column(nullable = false)
    @Builder.Default
    private String status = "ABIERTA";

    // ALTA, MEDIA, BAJA
    private String priority;

    @Column(length = 1000)
    private String description;

    // Bloque 3 - info operativa
    @Column(name = "failure_type")
    private String failureType;

    // ALTO, MEDIO, BAJO
    private String impact;

    @Column(name = "stopped_production", nullable = false)
    @Builder.Default
    private boolean stoppedProduction = false;

    // Bloque 4 - ejecución
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    // Bloque 5 - cierre
    @Column(name = "resolution_notes", length = 1000)
    private String resolutionNotes;

    // Firma digital simple (nombre del técnico que cierra)
    private String signature;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
