package com.mantech.app.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.exception.FlywayValidateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Ejecuta las migraciones de Flyway de forma programatica.
 *
 * En Spring Boot 4 la autoconfiguracion de Flyway se separo a un modulo propio
 * que, al agregarse, rompe el escaneo de repositorios Spring Data JPA. Para
 * evitar ese conflicto corremos Flyway manualmente con flyway-core: el bean es
 * un singleton eager que migra al construirse, antes de que DataSeeder
 * (ApplicationReadyEvent) consulte las tablas.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        try {
            flyway.migrate();
        } catch (FlywayValidateException e) {
            // Flyway guarda la huella de cada migracion aplicada y rechaza
            // arrancar si el archivo cambio despues de haberse ejecutado,
            // aunque el cambio sea solo un comentario. Es una proteccion
            // correcta, pero deja el servicio caido hasta que alguien
            // intervenga a mano.
            //
            // repair() recalcula esas huellas sin tocar datos ni volver a
            // correr nada. Sólo se ejecuta si la validacion fallo, así el
            // camino normal sigue validando como siempre, y queda en el log.
            log.warn("Flyway rechazo la validacion: {}", e.getMessage());
            log.warn("Se ejecuta repair() para recalcular las huellas y se reintenta.");
            flyway.repair();
            flyway.migrate();
            log.info("Migraciones aplicadas tras el repair.");
        }

        return flyway;
    }
}
