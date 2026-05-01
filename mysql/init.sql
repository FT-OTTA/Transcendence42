CREATE DATABASE IF NOT EXISTS otta;
USE otta;

CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('creature', 'building', 'sortilege') NOT NULL,
    class ENUM('common', 'Warrior', 'Druid') NOT NULL,
    rune_cost INT NOT NULL,
    base_force INT DEFAULT 0,
    base_endurance INT DEFAULT 0,
    effect_text VARCHAR(1000),
    effect_json_path VARCHAR(1000),
    illustration VARCHAR(255),
    collection_id VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS card_effects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_id VARCHAR(10) NOT NULL,
    effect ENUM('ad_mod', 'def_mod', 'draw', 'dmg', 'armor', 'mana', 'swap', 'destroy') NOT NULL,
    target ENUM('self_hero', 'opponent_hero', 'self', 'left_neighbor', 'right_neighbor', 'all_allies', 'all_enemies') NOT NULL,
    value INT DEFAULT 0,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);

CREATE TABLE IF NOT EXISTS heroes (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class ENUM('Warrior', 'Druid') NOT NULL,
    base_armor INT DEFAULT 0,
    passive_text VARCHAR(1000),
    passive_json_path VARCHAR(1000),
    illustration VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS decks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hero_id VARCHAR(10) NOT NULL,
    card_id VARCHAR(10) NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (hero_id) REFERENCES heroes(id),
    FOREIGN KEY (card_id) REFERENCES cards(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    hero_id VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hero_id) REFERENCES heroes(id)
);