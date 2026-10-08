package com.mantech.app.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Dispositivo IoT de campo (una placa ESP32 montada sobre una máquina).
 *
 * Se autentica con su propia clave, que viaja en el header de cada envío. No
 * usa JWT a propósito: un microcontrolador no debe manejar login ni refresco
 * de tokens.
 */
@Entity
@Table(name = "iot_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IotDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Máquina que este dispositivo está midiendo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @Column(nullable = false)
    private String name;

    @Column(name = "device_key", nullable = false, unique = true, length = 80)
    private String deviceKey;

    @Column(length = 500)
    private String description;

    @Column(name = "firmware_version", length = 50)
    private String firmwareVersion;

    /** Cada cuántos segundos debe reportar; se le devuelve en cada respuesta. */
    @Column(name = "interval_seconds", nullable = false)
    @Builder.Default
    private int intervalSeconds = 10;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Último envío recibido; de acá sale si el dispositivo está en línea. */
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Un dispositivo se considera en línea si reportó dentro de las últimas
     * tres ventanas de envío: una sola perdida puede ser un paquete caído, tres
     * seguidas ya es una desconexión.
     */
    public boolean isOnline(LocalDateTime now) {
        if (lastSeenAt == null) return false;
        long toleranceSeconds = Math.max(intervalSeconds, 1) * 3L + 5;
        return lastSeenAt.isAfter(now.minusSeconds(toleranceSeconds));
    }
}
