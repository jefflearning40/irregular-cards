-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           8.4.3 - MySQL Community Server - GPL
-- SE du serveur:                Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Listage de la structure de table irregular_cards. administrateur
CREATE TABLE IF NOT EXISTS `administrateur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. eleve
CREATE TABLE IF NOT EXISTS `eleve` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `professeur_id` int unsigned NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_eleve_professeur` (`professeur_id`),
  CONSTRAINT `fk_eleve_professeur` FOREIGN KEY (`professeur_id`) REFERENCES `professeur` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. erreur_quiz
CREATE TABLE IF NOT EXISTS `erreur_quiz` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `session_quiz_id` int unsigned NOT NULL,
  `infinitif` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reponse_attendue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reponse_eleve` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_erreur_session` (`session_quiz_id`),
  CONSTRAINT `fk_erreur_session` FOREIGN KEY (`session_quiz_id`) REFERENCES `session_quiz` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. professeur
CREATE TABLE IF NOT EXISTS `professeur` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. progression
CREATE TABLE IF NOT EXISTS `progression` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `eleve_id` int unsigned NOT NULL,
  `infinitif` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_reussites` int unsigned NOT NULL DEFAULT '0',
  `nombre_erreurs` int unsigned NOT NULL DEFAULT '0',
  `derniere_revision` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_progression_eleve_verbe` (`eleve_id`,`infinitif`),
  CONSTRAINT `fk_progression_eleve` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. revision
CREATE TABLE IF NOT EXISTS `revision` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `progression_id` int unsigned NOT NULL,
  `date_revision` datetime NOT NULL,
  `effectuee` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_revision_progression` (`progression_id`),
  CONSTRAINT `fk_revision_progression` FOREIGN KEY (`progression_id`) REFERENCES `progression` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

-- Listage de la structure de table irregular_cards. session_quiz
CREATE TABLE IF NOT EXISTS `session_quiz` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `eleve_id` int unsigned NOT NULL,
  `date_session` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `difficulte` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_quiz` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int unsigned NOT NULL DEFAULT '0',
  `nombre_questions` int unsigned NOT NULL,
  `duree` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_session_eleve` (`eleve_id`),
  CONSTRAINT `fk_session_eleve` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les données exportées n'étaient pas sélectionnées.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

CREATE TABLE `message` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,

    `expediteur_type` ENUM(
        'administrateur',
        'professeur',
        'eleve'
    ) NOT NULL,

    `expediteur_id` INT UNSIGNED NOT NULL,

    `destinataire_type` ENUM(
        'administrateur',
        'professeur',
        'eleve'
    ) NOT NULL,

    `destinataire_id` INT UNSIGNED NOT NULL,

    `objet` VARCHAR(255) NOT NULL,

    `contenu` TEXT NOT NULL,

    `est_lu` TINYINT(1) NOT NULL DEFAULT 0,

    `date_envoi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    KEY `idx_message_expediteur` (
        `expediteur_type`,
        `expediteur_id`
    ),

    KEY `idx_message_destinataire` (
        `destinataire_type`,
        `destinataire_id`
    ),

    KEY `idx_message_date_envoi` (
        `date_envoi`
    )
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
