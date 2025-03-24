/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import {
  Game,
  Scene,
  Physics,
  Types,
  GameObjects,
  Sound,
  Math as PhaserMath,
  AUTO,
  Input,
  Tweens,
  Time,
} from "phaser";
import { createScore } from "./actions";

// Définition des types pour les variables globales
export interface GameScene extends Scene {
  physics: Physics.Arcade.ArcadePhysics;
  add: GameObjects.GameObjectFactory;
  input: Input.InputPlugin;
  sound: Sound.BaseSoundManager;
  time: Time.Clock;
  tweens: Tweens.TweenManager;
}

export default function GamePage() {
  useEffect(() => {
    const config: Types.Core.GameConfig = {
      type: AUTO,
      width: 1200,
      height: 800,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      parent: "game-container",
    };

    // Variables globales
    let player: Physics.Arcade.Sprite;
    let cursors: Types.Input.Keyboard.CursorKeys;
    let projectiles: Physics.Arcade.Group;
    let obstacles: Physics.Arcade.Group;
    let sodas: Physics.Arcade.Group;
    let particles: GameObjects.Particles.ParticleEmitterManager;
    let scoreText: GameObjects.Text;
    let livesText: GameObjects.Text;
    let levelText: GameObjects.Text;
    let flashPlayer: GameObjects.Sprite;
    let gameOverImage: GameObjects.Sprite;
    let backgroundMusic: Sound.BaseSound;
    let invincibilityMusic: Sound.BaseSound;
    let gameOverMusic: Sound.BaseSound;
    let matraks: Physics.Arcade.Group;

    const speed = 300;
    let score = 0;
    let lives = 3;
    let level = 1;
    let isInvincible = false;
    let gameOverTriggered = false;

    function preload(this: GameScene) {
      this.load.image("player", "/images/player.png");
      this.load.image("matrak", "/images/matrak.png");
      this.load.image("evolved_player", "/images/evolved_player.png");
      this.load.image("obstacle", "/images/obstacle.png");
      this.load.image("projectile", "/images/projectile.png");
      this.load.image("particle", "/images/particle.png");
      this.load.image("soda", "/images/soda.png");
      this.load.image("aura", "/images/aura.png");
      this.load.image("flash_player", "/images/flash_player.png");
      this.load.image("game_over_image", "/images/game_over_image.png");

      this.load.audio("background", "/audio/background.mp3");
      this.load.audio("invincibility", "/audio/invincibility.mp3");
      this.load.audio("game_over", "/audio/game_over.mp3");
      this.load.audio("shoot", "/audio/shoot.wav");
      this.load.audio("hit", "/audio/hit.wav");
      this.load.audio("life_lost", "/audio/life_lost.wav");
    }

    function create(this: GameScene) {
      // Réinitialisation des variables
      score = 0;
      lives = 3;
      level = 1;
      gameOverTriggered = false;

      // Création du joueur
      player = this.physics.add
        .sprite((config.width as any) / 2, (config.height as any) / 2, "player")
        .setScale(0.2);
      player.setCollideWorldBounds(true);

      // Groupes
      projectiles = this.physics.add.group();
      obstacles = this.physics.add.group();
      sodas = this.physics.add.group();
      matraks = this.physics.add.group();

      // Particules pour l'aura des projectiles
      particles = this.add.particles("particle");

      // Génération des obstacles
      this.time.addEvent({
        delay: 1000 - level * 50,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true,
      });

      // Génération des sodas
      this.time.addEvent({
        delay: 10000,
        callback: spawnSoda,
        callbackScope: this,
        loop: true,
      });

      // Collisions
      this.physics.add.collider(
        projectiles,
        obstacles,
        destroyObstacle,
        undefined,
        this
      );
      this.physics.add.collider(
        player,
        obstacles,
        hitObstacle,
        undefined,
        this
      );
      this.physics.add.overlap(player, sodas, collectSoda, undefined, this);
      this.physics.add.collider(
        projectiles,
        matraks,
        destroyObstacle,
        undefined,
        this
      );
      this.physics.add.collider(player, matraks, hitObstacle, undefined, this);

      // Textes
      scoreText = this.add.text(10, 10, "Score: 0", {
        fontSize: "20px",
        color: "#fff",
      });
      livesText = this.add.text(10, 40, "Lives: 3", {
        fontSize: "20px",
        color: "#fff",
      });
      levelText = this.add.text(10, 70, "Level: 1", {
        fontSize: "20px",
        color: "#fff",
      });

      // Contrôles
      cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on("keydown-SPACE", fireProjectile, this);

      // Musiques
      backgroundMusic = this.sound.add("background", { loop: true });
      invincibilityMusic = this.sound.add("invincibility");
      gameOverMusic = this.sound.add("game_over");

      backgroundMusic.play();

      // Sprite de Game Over
      flashPlayer = this.add
        .sprite(-200, (config.height as any) / 2, "flash_player")
        .setScale(0.4);
      flashPlayer.setVisible(false);

      gameOverImage = this.add
        .sprite(
          (config.width as any) / 2,
          (config.height as any) / 2,
          "game_over_image"
        )
        .setScale(0);
      gameOverImage.setVisible(false);
    }

    function update(this: GameScene) {
      if (gameOverTriggered) return;

      player.setVelocity(0);

      if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.setFlipX(true);
      }
      if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.setFlipX(false);
      }
      if (cursors.up.isDown) {
        player.setVelocityY(-speed);
      }
      if (cursors.down.isDown) {
        player.setVelocityY(speed);
      }

      projectiles.children.iterate((projectile: any) => {
        if (projectile && projectile.y < 0) projectile.destroy();
      });

      obstacles.children.iterate((obstacle: any) => {
        if (obstacle && obstacle.y > (config.height as any)) obstacle.destroy();
      });

      sodas.children.iterate((soda: any) => {
        if (soda && soda.y > (config.height as any)) soda.destroy();
      });

      matraks.children.iterate((matrak: any) => {
        if (matrak && matrak.y > (config.height as any)) matrak.destroy();
      });

      if (score >= level * 50) {
        level++;
        levelText.setText("Level: " + level);
      }
    }

    function fireProjectile(this: GameScene) {
      const projectile = projectiles.create(player.x, player.y, "projectile");
      projectile.setScale(0.1);
      projectile.setVelocityY(-400);

      // Ajout de l'animation de rotation du joueur
      this.tweens.add({
        targets: player,
        angle: 360,
        duration: 500,
        onComplete: () => {
          player.setAngle(0);
        },
      });

      const emitter = particles.createEmitter({
        x: projectile.x,
        y: projectile.y,
        lifespan: 300,
        speed: 50,
        scale: { start: 0.3, end: 0 },
        blendMode: "ADD",
        quantity: 5,
        follow: projectile,
      });
      projectile.on("destroy", () => {
        emitter.stop();
      });
      this.sound.play("shoot");
    }

    function spawnObstacle(this: GameScene) {
      const x = PhaserMath.Between(50, (config.width as any) - 50);
      const isMatrak = Math.random() < 0.3; // 30% de chance d'être un matrak

      if (isMatrak) {
        const matrak = matraks.create(x, 0, "matrak").setScale(0.4);
        matrak.setVelocityY(300 + level * 25); // Plus rapide que l'obstacle normal
      } else {
        const obstacle = obstacles.create(x, 0, "obstacle").setScale(0.4);
        obstacle.setVelocityY(200 + level * 20);
      }
    }

    function spawnSoda(this: GameScene) {
      const x = PhaserMath.Between(50, (config.width as any) - 50);
      const soda = sodas.create(x, 0, "soda");
      soda.setScale(0.3);
      soda.setVelocityY(100);
    }

    function destroyObstacle(this: GameScene, projectile: any, obstacle: any) {
      projectile.destroy();
      obstacle.destroy();
      score += 10;
      scoreText.setText("Score: " + score);
      this.sound.play("hit");
    }

    function hitObstacle(this: GameScene, player: any, obstacle: any) {
      if (!isInvincible) {
        obstacle.destroy();
        lives--;
        livesText.setText("Lives: " + lives);
        this.sound.play("life_lost");

        if (lives <= 0) triggerGameOver.call(this);
      }
    }

    function collectSoda(this: GameScene, player: any, soda: any) {
      soda.destroy();
      isInvincible = true;
      player.setTexture("evolved_player");
      backgroundMusic.stop();
      invincibilityMusic.play();

      this.time.addEvent({
        delay: 15000,
        callback: () => {
          isInvincible = false;
          player.setTexture("player");
          invincibilityMusic.stop();
          backgroundMusic.play();
        },
        callbackScope: this,
      });
    }

    function triggerGameOver(this: GameScene) {
      gameOverTriggered = true;
      this.physics.pause();

      backgroundMusic.stop();
      invincibilityMusic.stop();
      gameOverMusic.play();

      obstacles.clear(true, true);

      gameOverImage.setVisible(true);
      this.tweens.add({
        targets: gameOverImage,
        scale: 1,
        duration: gameOverMusic.duration * 1000,
      });

      flashPlayer.setVisible(true);
      this.tweens.add({
        targets: flashPlayer,
        x: (config.width as any) + 200,
        scale: 1.2,
        duration: gameOverMusic.duration * 1000,
        onComplete: () => {
          this.time.delayedCall(6000, () => {
            this.scene.restart();
          });
        },
      });

      // Sauvegarder le score avec la server action
      createScore(score).catch(console.error);
    }

    // Création du jeu
    const game = new Game(config);

    // Nettoyage lors du démontage du composant
    return () => {
      game.destroy(true);
    };
  }, []); // Le tableau de dépendances vide signifie que cela ne s'exécute qu'une fois au montage

  return (
    <div className="w-screen overflow-hidden h-screen bg-black flex items-center justify-center">
      <div id="game-container"></div>
    </div>
  );
}
