package com.mantech.app.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Una medición puntual de un sensor.
 *
 * El estado (NORMAL / ALERTA / CRITICO) se calcula al recibir el dato y se
 * guarda junto a él: así la app no tiene que conocer los umbrales, y la
 * clasificación queda registrada tal como se evaluó en ese momento.
 */
@Entity
@Table(name = "sensor_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private IotDevice device;

    /** Denormalizada desde el dispositivo para poder consultar por máquina. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    /** TEMPERATURA, VIBRACION, INCLINACION */
    @Column(nullable = false, length = 30)
    private String metric;

    @Column(nullable = false)
    private double value;

    /** C, g, deg */
    @Column(nullable = false, length = 16)
    private String unit;

    /** NORMAL, ALERTA, CRITICO */
    @Column(nullable = false, length = 16)
    private String status;

    /** Momento al que corresponde la medición. */
    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
