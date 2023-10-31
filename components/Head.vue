<template>
    <!-- <img src="img/idle-1.webp" alt=""> -->
    <!-- <canvas id="myCanvas" width="1000" height="1000"></canvas> -->
</template>
<script>
    export default {
        mounted() {
            const {Scene, Game} = Phaser;
            const config = {
                type: Phaser.AUTO,
                width: 295 + 600,
                height: 337 + 1083,
                transparent: true,
                scene: {
                    preload: preload,
                    create: create,
                }
            };

            const game = new Game(config);

            function preload() {
                this.load.spritesheet('idle', 'img/idle-1.webp', { frameWidth: 295, frameHeight: 337 });
            }

            function create() {
                const idle = this.add.sprite(295, 337, 'idle');
                this.anims.create({
                    key: 'idle_1',
                    frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 46 }),
                    frameRate: 20,
                    repeat: -1 // Loop indefinitely
                });

                idle.anims.play('idle_1', true);
                document.querySelector('canvas').classList.add('head_canvas')
            }
        }
    }
</script>